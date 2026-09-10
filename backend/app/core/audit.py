from sqlalchemy.orm import Session
from sqlalchemy import select, insert
from app.models.audit_log import AuditLog


class AuditService:
    def log(
        self,
        db: Session,
        actor_id: str,
        actor_type: str,
        action: str,
        resource_type: str,
        resource_id: str,
        details: dict = None,
        ip_address: str = None,
    ):
        try:
            stmt = insert(AuditLog).values(
                actor_id=str(actor_id) if actor_id is not None else None,
                actor_type=str(actor_type) if actor_type is not None else None,
                action=action,
                resource_type=resource_type,
                resource_id=str(resource_id) if resource_id is not None else None,
                details=details,
                ip_address=ip_address,
            )
            db.execute(stmt)
            db.commit()
        except Exception:
            db.rollback()

    def get_logs(
        self,
        db: Session,
        resource_type: str = None,
        resource_id: str = None,
        limit: int = 50,
    ):
        stmt = select(AuditLog).limit(limit)
        if resource_type:
            stmt = stmt.where(AuditLog.resource_type == resource_type)
        if resource_id:
            stmt = stmt.where(AuditLog.resource_id == resource_id)
        result = db.execute(stmt)
        return result.scalars().all()


audit_service = AuditService()
