from typing import Dict, Any

class DialogueEngine:
    def process_turn(self, kiosk_session_id: str, patient_input: str, current_step: int) -> Dict[str, Any]:
        """Adaptive dialogue engine determining next question based on current input."""
        if "chest pain" in patient_input.lower() or "breath" in patient_input.lower():
            return {
                "next_question": "Are you experiencing pain radiating to your left arm or jaw?",
                "input_type": "select",
                "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}],
                "step_number": current_step + 1,
                "is_urgent": True
            }
        
        questions = [
            "What is your primary symptom or reason for visiting today?",
            "How many days have you had these symptoms?",
            "Are you currently taking any regular medications?",
            "Do you have any known drug or food allergies?"
        ]
        
        next_idx = min(current_step, len(questions) - 1)
        return {
            "next_question": questions[next_idx],
            "input_type": "text",
            "step_number": current_step + 1,
            "is_urgent": False
        }

dialogue_engine = DialogueEngine()
