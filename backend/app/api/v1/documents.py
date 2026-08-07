from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload
from typing import Optional
import uuid

from app.core.deps import get_db, get_current_active_user, require_admin
from app.db.models.document import Document
from app.db.models.user import User

router = APIRouter(prefix="/documents")


def _doc_to_dict(doc: Document, include_relations: bool = False) -> dict:
    d = {
        "id": str(doc.id),
        "title": doc.title,
        "filename": doc.filename,
        "file_path": doc.file_path,
        "file_size": doc.file_size,
        "mime_type": doc.mime_type,
        "category": doc.category,
        "department_id": str(doc.department_id) if doc.department_id else None,
        "uploader_id": str(doc.uploader_id),
        "status": doc.status,
        "priority": doc.priority,
        "version": doc.version,
        "is_favorite": doc.is_favorite,
        "is_archived": doc.is_archived,
        "is_deleted": doc.is_deleted,
        "description": doc.description,
        "ocr_status": doc.ocr_status,
        "ai_status": doc.ai_status,
        "created_at": doc.created_at.isoformat() if doc.created_at else None,
        "updated_at": doc.updated_at.isoformat() if doc.updated_at else None,
    }
    if include_relations:
        if hasattr(doc, "uploader") and doc.uploader:
            d["uploader_name"] = doc.uploader.full_name
        if hasattr(doc, "department") and doc.department:
            d["department_name"] = doc.department.name
        if hasattr(doc, "tags") and doc.tags:
            d["tags"] = [{"id": str(t.id), "name": t.name, "color": t.color} for t in doc.tags]
        else:
            d["tags"] = []
    return d


@router.get("")
async def list_documents(
    search: Optional[str] = None,
    department_id: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    is_archived: bool = False,
    is_deleted: bool = False,
    is_favorite: Optional[bool] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    sort_by: str = "created_at",
    sort_order: str = "desc",
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Document).options(
        selectinload(Document.uploader),
        selectinload(Document.department),
        selectinload(Document.tags),
    ).where(
        Document.is_deleted == is_deleted,
        Document.is_archived == is_archived,
    )

    if search:
        query = query.where(
            or_(
                Document.title.ilike(f"%{search}%"),
                Document.filename.ilike(f"%{search}%"),
                Document.description.ilike(f"%{search}%"),
            )
        )
    if department_id:
        query = query.where(Document.department_id == uuid.UUID(department_id))
    if category:
        query = query.where(Document.category == category)
    if status:
        query = query.where(Document.status == status)
    if priority:
        query = query.where(Document.priority == priority)
    if is_favorite is not None:
        query = query.where(Document.is_favorite == is_favorite)

    # Count
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()

    # Sort
    sort_col = getattr(Document, sort_by, Document.created_at)
    if sort_order == "desc":
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())

    # Paginate
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    docs = result.scalars().all()

    return {
        "items": [_doc_to_dict(d, include_relations=True) for d in docs],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
    }


def _safe_uuid(val: str) -> Optional[uuid.UUID]:
    try:
        return uuid.UUID(val)
    except (ValueError, TypeError):
        return None


@router.get("/{document_id}")
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    u_id = _safe_uuid(document_id)
    if not u_id:
        raise HTTPException(status_code=404, detail="Document not found")

    result = await db.execute(
        select(Document).options(
            selectinload(Document.uploader),
            selectinload(Document.department),
            selectinload(Document.tags),
            selectinload(Document.ocr_result),
            selectinload(Document.ai_classification),
            selectinload(Document.ai_summary),
        ).where(Document.id == u_id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    d = _doc_to_dict(doc, include_relations=True)

    if doc.ocr_result:
        d["ocr_result"] = {
            "extracted_text": doc.ocr_result.extracted_text,
            "languages": doc.ocr_result.languages,
            "confidence": doc.ocr_result.confidence,
            "has_tables": doc.ocr_result.has_tables,
            "has_signatures": doc.ocr_result.has_signatures,
            "has_stamps": doc.ocr_result.has_stamps,
            "processed_at": doc.ocr_result.processed_at.isoformat() if doc.ocr_result.processed_at else None,
        }
    if doc.ai_classification:
        d["ai_classification"] = {
            "predicted_category": doc.ai_classification.predicted_category,
            "confidence_score": doc.ai_classification.confidence_score,
            "manual_override": doc.ai_classification.manual_override,
            "keywords": doc.ai_classification.keywords,
        }
    if doc.ai_summary:
        d["ai_summary"] = {
            "executive_summary": doc.ai_summary.executive_summary,
            "key_points": doc.ai_summary.key_points,
            "action_items": doc.ai_summary.action_items,
            "important_dates": doc.ai_summary.important_dates,
            "risk_level": doc.ai_summary.risk_level,
            "responsible_department": doc.ai_summary.responsible_department,
            "keywords": doc.ai_summary.keywords,
        }
    return d


@router.put("/{document_id}")
async def update_document(
    document_id: str,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    u_id = _safe_uuid(document_id)
    if not u_id:
        raise HTTPException(status_code=404, detail="Document not found")
    result = await db.execute(select(Document).where(Document.id == u_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    body = await request.json()
    for field in ["title", "category", "priority", "description", "status"]:
        if field in body:
            setattr(doc, field, body[field])

    await db.commit()
    await db.refresh(doc)
    return _doc_to_dict(doc)


@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    u_id = _safe_uuid(document_id)
    if not u_id:
        raise HTTPException(status_code=404, detail="Document not found")
    result = await db.execute(select(Document).where(Document.id == u_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.is_deleted = True
    await db.commit()


@router.post("/{document_id}/favorite")
async def toggle_favorite(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    u_id = _safe_uuid(document_id)
    if not u_id:
        raise HTTPException(status_code=404, detail="Document not found")
    result = await db.execute(select(Document).where(Document.id == u_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.is_favorite = not doc.is_favorite
    await db.commit()
    return {"is_favorite": doc.is_favorite}


@router.post("/{document_id}/archive")
async def archive_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    u_id = _safe_uuid(document_id)
    if not u_id:
        raise HTTPException(status_code=404, detail="Document not found")
    result = await db.execute(select(Document).where(Document.id == u_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.is_archived = True
    await db.commit()
    return {"message": "Document archived"}


@router.post("/{document_id}/restore")
async def restore_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    u_id = _safe_uuid(document_id)
    if not u_id:
        raise HTTPException(status_code=404, detail="Document not found")
    result = await db.execute(select(Document).where(Document.id == u_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.is_archived = False
    doc.is_deleted = False
    await db.commit()
    return {"message": "Document restored"}


@router.get("/{document_id}/versions")
async def get_versions(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    from app.db.models.approval import DocumentVersion
    u_id = _safe_uuid(document_id)
    if not u_id:
        return []
    result = await db.execute(
        select(DocumentVersion)
        .where(DocumentVersion.document_id == u_id)
        .order_by(DocumentVersion.version_number.desc())
    )
    versions = result.scalars().all()
    return [
        {
            "id": str(v.id),
            "version_number": v.version_number,
            "file_path": v.file_path,
            "change_notes": v.change_notes,
            "uploaded_by": str(v.uploaded_by),
            "created_at": v.created_at.isoformat() if v.created_at else None,
        }
        for v in versions
    ]


@router.get("/{document_id}/comments")
async def get_comments(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    from app.db.models.approval import Comment
    u_id = _safe_uuid(document_id)
    if not u_id:
        return []
    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.user))
        .where(Comment.document_id == u_id)
        .order_by(Comment.created_at.asc())
    )
    comments = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "content": c.content,
            "user_id": str(c.user_id),
            "user_name": c.user.full_name if c.user else "Unknown",
            "parent_id": str(c.parent_id) if c.parent_id else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in comments
    ]


@router.post("/{document_id}/comments", status_code=201)
async def add_comment(
    document_id: str,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    from app.db.models.approval import Comment
    u_id = _safe_uuid(document_id)
    if not u_id:
        raise HTTPException(status_code=404, detail="Document not found")
    body = await request.json()
    parent_uuid = _safe_uuid(body.get("parent_id")) if body.get("parent_id") else None
    comment = Comment(
        id=uuid.uuid4(),
        document_id=u_id,
        user_id=current_user.id,
        content=body.get("content", ""),
        parent_id=parent_uuid,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return {
        "id": str(comment.id),
        "content": comment.content,
        "user_id": str(comment.user_id),
        "user_name": current_user.full_name,
        "created_at": comment.created_at.isoformat() if comment.created_at else None,
    }
