import re

def validate_phone_number(phone: str) -> bool:
    """Validates standard 10-digit Indian phone numbers."""
    pattern = r"^[6-9]\d{9}$"
    return bool(re.match(pattern, phone))

def validate_abha_number(abha: str) -> bool:
    """Validates 14-digit ABHA number format (XX-XXXX-XXXX-XXXX)."""
    pattern = r"^\d{2}-\d{4}-\d{4}-\d{4}$"
    return bool(re.match(pattern, abha))
