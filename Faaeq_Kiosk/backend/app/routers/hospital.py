import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.rbac import require_roles
from app.services.hospital.hospital_service import (
    add_patient_to_queue,
    get_live_queue,
    update_queue_status,
    get_hospital_dashboard,
    ws_manager,
)
from app.schemas.hospital import (
    QueueItemCreate,
    QueueItemResponse,
    QueueStatusUpdate,
    HospitalDashboardResponse,
)

router = APIRouter(prefix="/hospital", tags=["Hospital Ops & Dashboard"])


@router.post("/queue/add", response_model=QueueItemResponse)
async def add_to_queue_endpoint(
    queue_in: QueueItemCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    item = add_patient_to_queue(db, queue_in)
    # Broadcast queue push update via WebSocket
    await ws_manager.broadcast_queue_update(
        str(queue_in.hospital_id),
        {"event": "queue_updated", "appointment_id": str(item.appointment_id), "status": item.status},
    )
    return item


@router.get("/queue/live/{hospital_id}", response_model=List[QueueItemResponse])
def get_live_queue_endpoint(
    hospital_id: uuid.UUID,
    doctor_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
):
    return get_live_queue(db, hospital_id, doctor_id)


@router.put("/queue/update/{appointment_id}", response_model=QueueItemResponse)
async def update_queue_status_endpoint(
    appointment_id: uuid.UUID,
    update_in: QueueStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("doctor", "hospital_admin", "kiosk_operator", "super_admin")),
):
    item = update_queue_status(db, appointment_id, update_in)
    # Broadcast queue update via WebSocket
    await ws_manager.broadcast_queue_update(
        str(item.hospital_id),
        {"event": "status_changed", "appointment_id": str(item.appointment_id), "status": item.status},
    )
    return item


@router.get("/dashboard/{hospital_id}", response_model=HospitalDashboardResponse)
def get_hospital_dashboard_endpoint(
    hospital_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("hospital_admin", "super_admin")),
):
    return get_hospital_dashboard(db, hospital_id)


@router.websocket("/{hospital_id}/queue/ws")
async def websocket_queue_endpoint(websocket: WebSocket, hospital_id: str):
    await ws_manager.connect(hospital_id, websocket)
    try:
        while True:
            # Keep connection alive receiving ping or messages
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(hospital_id, websocket)
