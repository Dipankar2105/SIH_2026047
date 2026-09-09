from sqlalchemy.orm import Session
from sqlalchemy import select, insert
from app.models.audit_log import AuditLog

class AuditService:
    def log(self, db: Session, actor_id: str, actor_type: str, action: str,
            resource_type: str, resource_id: str, details: dict = None, ip_address: str = None):
        try:
            stmt = insert(AuditLog).values(
                actor_id=actor_id,
                actor_type=actor_type,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=details,
                ip_address=ip_address,
            )
            db.execute(stmt)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Audit log failed: {e}")

    def get_logs(self, db: Session, resource_type: str = None,
                 resource_id: str = None, limit: int = 50):
        stmt = select(AuditLog).limit(limit)
        if resource_type:
            stmt = stmt.where(AuditLog.resource_type == resource_type)
        if resource_id:
            stmt = stmt.where(AuditLog.resource_id == resource_id)
        result = db.execute(stmt)
        return result.scalars().all()


audit_service = AuditService()
