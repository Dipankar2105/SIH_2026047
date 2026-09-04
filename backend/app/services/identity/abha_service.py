from typing import Dict, Any

class ABHAService:
    def verify_abha(self, abha_number: str) -> Dict[str, Any]:
        """Mock verification of ABDM ABHA Number."""
        return {
            "abha_number": abha_number,
            "abha_address": f"{abha_number.replace('-', '')}@sbx",
            "is_valid": True,
            "status": "VERIFIED",
            "name": "Verified ABHA User"
        }

    def generate_otp(self, abha_number: str) -> Dict[str, str]:
        return {"status": "SUCCESS", "message": f"OTP sent to mobile linked with ABHA {abha_number}"}

    def verify_otp(self, abha_number: str, otp: str) -> Dict[str, Any]:
        return {"status": "AUTHENTICATED", "txn_id": "mock_txn_12345"}

abha_service = ABHAService()
