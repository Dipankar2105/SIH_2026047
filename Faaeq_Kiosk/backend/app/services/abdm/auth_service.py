from app.services.abdm.auth import generate_session_token


class ABDMAuthService:
    """Service for ABDM Gateway authentication."""

    @staticmethod
    def get_session_token() -> dict:
        return generate_session_token()