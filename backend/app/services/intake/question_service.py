from typing import List, Dict, Any

class QuestionService:
    def get_initial_questions(self, language: str = "en") -> List[Dict[str, Any]]:
        return [
            {
                "question_id": "Q1",
                "question_text": "What is your main health concern today?",
                "input_type": "voice_or_text",
                "step_number": 1
            }
        ]

question_service = QuestionService()
