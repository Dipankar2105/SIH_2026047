import httpx
from app.core.config import settings


class OCRService:
    def __init__(self):
        self.base_url = settings.OCR_SERVICE_URL

    def extract(self, file_bytes: bytes, filename: str, content_type: str) -> dict:
        with httpx.Client(timeout=60.0) as client:
            files = {"file": (filename, file_bytes, content_type)}
            try:
                response = client.post(f"{self.base_url}/extract", files=files)
                response.raise_for_status()
                data = response.json()
                return {
                    "extracted_data": data.get("extracted_data", {}),
                    "confidence": data.get("confidence", 0.0),
                    "method": data.get("method", "unknown"),
                    "needs_human_verification": data.get("needs_human_verification", False),
                    "source_refs": data.get("source_refs", {}),
                }
            except Exception:
                return {
                    "extracted_data": {},
                    "confidence": 0.0,
                    "method": "error",
                    "needs_human_verification": True,
                    "source_refs": {},
                }

    def health_check(self) -> bool:
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception:
            return False


ocr_service = OCRService()
