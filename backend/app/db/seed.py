"""
KMRL IntelliDocs - Database Seed Script
Creates realistic demo data for Kochi Metro Rail Limited context.
"""
import asyncio
import uuid
from datetime import datetime, timedelta
import random

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.config import settings
from app.core.security import hash_password
from app.db.base import Base
from app.db.models import *  # Import all models


DEPARTMENTS = [
    {"name": "Operations", "code": "OPS", "color": "#0ea5e9", "description": "Metro rail operations and control"},
    {"name": "Finance", "code": "FIN", "color": "#22c55e", "description": "Financial management and accounting"},
    {"name": "Human Resources", "code": "HR", "color": "#a855f7", "description": "HR policies and employee management"},
    {"name": "Maintenance", "code": "MNT", "color": "#f59e0b", "description": "Rolling stock and infrastructure maintenance"},
    {"name": "Legal", "code": "LGL", "color": "#ef4444", "description": "Legal affairs and compliance"},
    {"name": "Procurement", "code": "PRO", "color": "#06b6d4", "description": "Procurement and vendor management"},
]

USERS = [
    {"email": "admin@kmrl.in", "full_name": "Suresh Prabhu", "role": "admin", "dept_code": "OPS"},
    {"email": "rajan.menon@kmrl.in", "full_name": "Rajan Menon", "role": "manager", "dept_code": "FIN"},
    {"email": "priya.nair@kmrl.in", "full_name": "Priya Nair", "role": "manager", "dept_code": "HR"},
    {"email": "arun.kumar@kmrl.in", "full_name": "Arun Kumar", "role": "employee", "dept_code": "MNT"},
    {"email": "deepa.thomas@kmrl.in", "full_name": "Deepa Thomas", "role": "employee", "dept_code": "LGL"},
    {"email": "suresh.pillai@kmrl.in", "full_name": "Suresh Pillai", "role": "employee", "dept_code": "PRO"},
    {"email": "anjali.krishna@kmrl.in", "full_name": "Anjali Krishna", "role": "employee", "dept_code": "OPS"},
    {"email": "mohan.das@kmrl.in", "full_name": "Mohan Das", "role": "employee", "dept_code": "FIN"},
]

DEMO_DOCUMENTS = [
    {"title": "Safety Inspection Report Q1 2024", "filename": "Safety_Inspection_Q1_2024.pdf", "category": "Safety", "dept": "OPS", "priority": "high", "status": "approved"},
    {"title": "Financial Statement March 2024", "filename": "Financial_Statement_Mar2024.xlsx", "category": "Finance", "dept": "FIN", "priority": "high", "status": "approved"},
    {"title": "Tender Document - Signal System Upgrade", "filename": "Tender_Signal_System_2024.pdf", "category": "Procurement", "dept": "PRO", "priority": "critical", "status": "pending"},
    {"title": "HR Policy Manual v3.2", "filename": "HR_Policy_Manual_v3.2.docx", "category": "HR", "dept": "HR", "priority": "medium", "status": "approved"},
    {"title": "Board Meeting Minutes - February 2024", "filename": "Board_Meeting_Feb2024.pdf", "category": "Operations", "dept": "OPS", "priority": "medium", "status": "approved"},
    {"title": "Rolling Stock Maintenance Schedule 2024", "filename": "Maintenance_Schedule_2024.xlsx", "category": "Maintenance", "dept": "MNT", "priority": "high", "status": "approved"},
    {"title": "Vendor Agreement - TechSys Solutions", "filename": "Vendor_Agreement_TechSys.pdf", "category": "Legal", "dept": "LGL", "priority": "high", "status": "approved"},
    {"title": "Annual Report 2023-24", "filename": "KMRL_Annual_Report_2023_24.pdf", "category": "Finance", "dept": "FIN", "priority": "high", "status": "approved"},
    {"title": "Emergency Evacuation Procedures", "filename": "Emergency_Evacuation_SOP.pdf", "category": "Safety", "dept": "OPS", "priority": "critical", "status": "approved"},
    {"title": "Procurement Guidelines 2024", "filename": "Procurement_Guidelines_2024.pdf", "category": "Procurement", "dept": "PRO", "priority": "medium", "status": "approved"},
    {"title": "Employee Handbook 2024 Edition", "filename": "Employee_Handbook_2024.pdf", "category": "HR", "dept": "HR", "priority": "medium", "status": "approved"},
    {"title": "Track Inspection Report - Blue Line", "filename": "Track_Inspection_BlueLine_Mar2024.pdf", "category": "Maintenance", "dept": "MNT", "priority": "high", "status": "pending"},
    {"title": "Legal Opinion - Land Acquisition Case", "filename": "Legal_Opinion_LandAcquisition.pdf", "category": "Legal", "dept": "LGL", "priority": "high", "status": "approved"},
    {"title": "Quarterly Revenue Report Q4 2023", "filename": "Revenue_Q4_2023.xlsx", "category": "Finance", "dept": "FIN", "priority": "high", "status": "approved"},
    {"title": "Station CCTV Upgrade Tender", "filename": "Tender_CCTV_Upgrade.pdf", "category": "Procurement", "dept": "PRO", "priority": "medium", "status": "pending"},
    {"title": "Passenger Safety Protocol - COVID Update", "filename": "Safety_Protocol_COVID.pdf", "category": "Safety", "dept": "OPS", "priority": "medium", "status": "approved"},
    {"title": "Staff Training Program Schedule", "filename": "Training_Schedule_2024.xlsx", "category": "HR", "dept": "HR", "priority": "low", "status": "approved"},
    {"title": "Traction Power System Report", "filename": "Traction_Power_Report_2024.pdf", "category": "Maintenance", "dept": "MNT", "priority": "high", "status": "approved"},
    {"title": "Contract Amendment - Civil Works", "filename": "Contract_Amendment_CivilWorks.pdf", "category": "Legal", "dept": "LGL", "priority": "critical", "status": "pending"},
    {"title": "Budget Allocation FY2024-25", "filename": "Budget_FY2024_25.xlsx", "category": "Finance", "dept": "FIN", "priority": "high", "status": "draft"},
    {"title": "Depot Operations Manual", "filename": "Depot_Operations_Manual.pdf", "category": "Operations", "dept": "OPS", "priority": "medium", "status": "approved"},
    {"title": "Escalator Maintenance Report", "filename": "Escalator_Maintenance_Q1.pdf", "category": "Maintenance", "dept": "MNT", "priority": "medium", "status": "approved"},
    {"title": "IT Infrastructure Procurement RFP", "filename": "IT_Infrastructure_RFP.pdf", "category": "Procurement", "dept": "PRO", "priority": "high", "status": "pending"},
    {"title": "Passenger Grievance Report March 2024", "filename": "Grievance_Report_Mar2024.pdf", "category": "Operations", "dept": "OPS", "priority": "medium", "status": "approved"},
    {"title": "Fire Safety Compliance Certificate", "filename": "Fire_Safety_Certificate.pdf", "category": "Safety", "dept": "OPS", "priority": "high", "status": "approved"},
    {"title": "Leave Policy Amendment 2024", "filename": "Leave_Policy_2024.docx", "category": "HR", "dept": "HR", "priority": "low", "status": "approved"},
    {"title": "Permanent Way Inspection Q1 2024", "filename": "PW_Inspection_Q1.pdf", "category": "Maintenance", "dept": "MNT", "priority": "high", "status": "approved"},
    {"title": "Insurance Renewal Documents", "filename": "Insurance_Renewal_2024.pdf", "category": "Legal", "dept": "LGL", "priority": "high", "status": "approved"},
    {"title": "Revenue Collection System Audit", "filename": "Revenue_System_Audit.pdf", "category": "Finance", "dept": "FIN", "priority": "high", "status": "approved"},
    {"title": "Platform Screen Door Maintenance", "filename": "PSD_Maintenance_Report.pdf", "category": "Maintenance", "dept": "MNT", "priority": "medium", "status": "approved"},
]

TAGS_DATA = [
    {"name": "urgent", "color": "#ef4444"},
    {"name": "2024", "color": "#6366f1"},
    {"name": "quarterly", "color": "#22c55e"},
    {"name": "compliance", "color": "#f59e0b"},
    {"name": "tender", "color": "#0ea5e9"},
    {"name": "safety", "color": "#a855f7"},
    {"name": "approved", "color": "#22c55e"},
    {"name": "draft", "color": "#94a3b8"},
]


async def seed():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        from sqlalchemy import select, func
        count = (await db.execute(select(func.count()).select_from(User))).scalar()
        if count > 0:
            print(f"✅ Database already has {count} users, skipping seed.")
            return

        print("🌱 Seeding KMRL IntelliDocs database...")

        # Create departments
        dept_map = {}
        for d in DEPARTMENTS:
            dept = Department(id=uuid.uuid4(), **{k: v for k, v in d.items()})
            db.add(dept)
            dept_map[d["code"]] = dept
        await db.flush()
        print(f"  ✓ Created {len(DEPARTMENTS)} departments")

        # Create users
        user_map = {}
        for u in USERS:
            dept_code = u.pop("dept_code")
            user = User(
                id=uuid.uuid4(),
                hashed_password=hash_password(f"{'Admin' if u['role']=='admin' else 'Manager' if u['role']=='manager' else 'Employee'}@123456"),
                department_id=dept_map[dept_code].id,
                is_verified=True,
                is_active=True,
                **u
            )
            db.add(user)
            user_map[user.email] = user
        await db.flush()
        print(f"  ✓ Created {len(USERS)} users")

        # Create tags
        tag_map = {}
        for t in TAGS_DATA:
            tag = Tag(id=uuid.uuid4(), **t)
            db.add(tag)
            tag_map[t["name"]] = tag
        await db.flush()

        # Create documents
        uploader_emails = list(user_map.keys())
        doc_ids = []
        for i, doc_data in enumerate(DEMO_DOCUMENTS):
            dept_code = doc_data.pop("dept")
            uploader = user_map[uploader_emails[i % len(uploader_emails)]]
            created_delta = timedelta(days=random.randint(1, 180))
            doc = Document(
                id=uuid.uuid4(),
                department_id=dept_map.get(dept_code, list(dept_map.values())[0]).id,
                uploader_id=uploader.id,
                file_path=f"demo/{doc_data['filename']}",
                file_size=random.randint(50_000, 5_000_000),
                mime_type="application/pdf",
                version=1,
                ocr_status="completed",
                ai_status="completed",
                created_at=datetime.utcnow() - created_delta,
                **doc_data,
            )
            db.add(doc)
            doc_ids.append(doc.id)

            # Add AI summary for each doc
            summary = AiSummary(
                id=uuid.uuid4(),
                document_id=doc.id,
                executive_summary=f"This document contains important {doc.category} information for KMRL operations. It covers key aspects of {doc.title} and provides guidance for relevant stakeholders.",
                key_points=["Regular monitoring required", "Compliance with safety standards", "Stakeholder approval needed"],
                action_items=["Review and approve", "Distribute to relevant departments", "Archive after action"],
                important_dates=[{"date": "2024-03-31", "description": "Compliance deadline"}],
                risk_level="medium" if doc.priority in ("high", "critical") else "low",
                responsible_department=dept_map.get(dept_code, list(dept_map.values())[0]).name,
                keywords=["KMRL", doc.category.lower(), "document", "official"],
            )
            db.add(summary)

            # Add classification
            cls = AiClassification(
                id=uuid.uuid4(),
                document_id=doc.id,
                predicted_category=doc.category,
                confidence_score=round(random.uniform(0.82, 0.99), 2),
                keywords=["KMRL", doc.category, "official", "2024"],
            )
            db.add(cls)

        await db.flush()
        print(f"  ✓ Created {len(DEMO_DOCUMENTS)} documents with AI metadata")

        # Create approvals
        pending_docs = [d for d in DEMO_DOCUMENTS if d.get("status") == "pending"]
        manager = user_map.get("rajan.menon@kmrl.in")
        employee = user_map.get("arun.kumar@kmrl.in")
        if manager and employee and doc_ids:
            for doc_id in doc_ids[:5]:
                approval = Approval(
                    id=uuid.uuid4(),
                    document_id=doc_id,
                    requester_id=employee.id,
                    approver_id=manager.id,
                    status="pending",
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 14)),
                )
                db.add(approval)
        print("  ✓ Created approval records")

        # Create notifications
        admin_user = user_map.get("admin@kmrl.in")
        notif_types = [
            ("upload_complete", "Document Uploaded", "Safety_Inspection_Q1_2024.pdf has been uploaded and processed."),
            ("approval_request", "Approval Requested", "Arun Kumar has requested your approval for Track Inspection Report."),
            ("ai_complete", "AI Processing Complete", "AI summarization complete for Tender Document - Signal System."),
            ("duplicate_detected", "Duplicate Detected", "Possible duplicate found: Revenue Report matches an existing document."),
            ("system_alert", "System Alert", "Storage usage has reached 75%. Consider archiving old documents."),
        ]
        if admin_user:
            for notif_type, title, message in notif_types:
                n = Notification(
                    id=uuid.uuid4(),
                    user_id=admin_user.id,
                    type=notif_type,
                    title=title,
                    message=message,
                    is_read=False,
                    payload={"department": "Operations"},
                    created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
                )
                db.add(n)
        print("  ✓ Created notifications")

        # Create audit logs
        if admin_user:
            audit_actions = [
                ("user_login", "auth", "User logged in"),
                ("document_upload", "document", "Uploaded Safety_Inspection_Q1_2024.pdf"),
                ("approval_granted", "approval", "Approved Financial Statement March 2024"),
                ("user_created", "user", "Created new user priya.nair@kmrl.in"),
                ("settings_updated", "settings", "Updated OCR language settings"),
            ]
            for action, resource_type, detail in audit_actions:
                log = AuditLog(
                    id=uuid.uuid4(),
                    user_id=admin_user.id,
                    action=action,
                    resource_type=resource_type,
                    details={"description": detail},
                    ip_address="192.168.1.100",
                    timestamp=datetime.utcnow() - timedelta(hours=random.randint(1, 72)),
                )
                db.add(log)
        print("  ✓ Created audit logs")

        await db.commit()
        print("✅ Database seeded successfully!")
        print("\nDemo Accounts:")
        print("  admin@kmrl.in       / Admin@123456    (Admin)")
        print("  rajan.menon@kmrl.in / Manager@123456  (Manager - Finance)")
        print("  priya.nair@kmrl.in  / Manager@123456  (Manager - HR)")
        print("  arun.kumar@kmrl.in  / Employee@123456 (Employee - Maintenance)")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
