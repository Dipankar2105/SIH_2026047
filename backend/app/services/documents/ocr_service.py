from typing import Dict, Any

class OCRService:
    def extract_text_from_file(self, file_path: str) -> Dict[str, Any]:
        """OCR Engine mockup for processing lab reports and medical prescriptions."""
        return {
            "file_path": file_path,
            "status": "COMPLETED",
            "extracted_text": "Hemoglobin: 13.5 g/dL (Normal: 12.0-15.5)\nWBC Count: 7,500 /mcL\nPlatelet Count: 250,000 /mcL",
            "confidence": 0.98
        }

ocr_service = OCRService()
