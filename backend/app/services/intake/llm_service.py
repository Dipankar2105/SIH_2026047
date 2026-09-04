from typing import Dict, Any, List

class LLMService:
    def summarize_complaints(self, answers: List[Dict[str, str]]) -> str:
        """Mock LLM prompt execution to summarize patient answers into concise clinical note."""
        summary = "Patient presents with "
        details = [f"{a['question_text']}: {a['answer_text']}" for a in answers]
        return summary + "; ".join(details)

llm_service = LLMService()
