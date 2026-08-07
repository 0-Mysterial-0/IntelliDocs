from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
import uuid

from app.core.deps import get_db, get_current_active_user
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.db.models.user import User
from app.db.models.department import Department

router = APIRouter(prefix="/auth")


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()
    email = body.get("email", "").lower().strip()
    full_name = body.get("full_name", "").strip()
    password = body.get("password", "")
    role = body.get("role", "employee")
    department_id = body.get("department_id")

    if not email or not full_name or not password:
        raise HTTPException(status_code=400, detail="Email, full name, and password are required")

    # Check duplicate
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        id=uuid.uuid4(),
        email=email,
        full_name=full_name,
        hashed_password=hash_password(password),
        role=role,
        department_id=uuid.UUID(department_id) if department_id else None,
        is_verified=True,  # Auto-verify for demo
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": _user_to_dict(user),
    }


@router.post("/login")
async def login(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()
    email = body.get("email", "").lower().strip()
    password = body.get("password", "")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": _user_to_dict(user),
    }


@router.post("/refresh")
async def refresh_token(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()
    token = body.get("refresh_token", "")
    try:
        payload = decode_token(token)
        if payload.get("type") != "refresh":
            raise ValueError("Not a refresh token")
        user_id = payload.get("sub")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token({"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/forgot-password")
async def forgot_password(request: Request):
    body = await request.json()
    email = body.get("email", "")
    # In production, send email. For demo, just return success.
    return {"message": f"If {email} is registered, a reset link has been sent.", "demo_token": "demo-reset-token-12345"}


@router.post("/reset-password")
async def reset_password(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()
    new_password = body.get("new_password", "")
    # For demo, just return success
    return {"message": "Password reset successfully"}


@router.post("/verify-email")
async def verify_email(request: Request):
    return {"message": "Email verified successfully"}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    # Load department name
    dept_name = None
    if current_user.department_id:
        dept_result = await db.execute(select(Department).where(Department.id == current_user.department_id))
        dept = dept_result.scalar_one_or_none()
        if dept:
            dept_name = dept.name

    user_dict = _user_to_dict(current_user)
    user_dict["department_name"] = dept_name
    return user_dict


@router.put("/profile")
async def update_profile(
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    body = await request.json()
    if "full_name" in body:
        current_user.full_name = body["full_name"]
    if "avatar_url" in body:
        current_user.avatar_url = body["avatar_url"]
    if "department_id" in body and body["department_id"]:
        current_user.department_id = uuid.UUID(body["department_id"])

    await db.commit()
    await db.refresh(current_user)
    return _user_to_dict(current_user)


def _user_to_dict(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "department_id": str(user.department_id) if user.department_id else None,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "avatar_url": user.avatar_url,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }
