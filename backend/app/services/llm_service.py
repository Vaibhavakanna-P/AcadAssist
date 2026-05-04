from app.ml_models.huggingface_transformer import hf_transformer
from typing import Dict, Optional

class LLMService:
    def __init__(self):
        self.transformer = hf_transformer
    
    def get_chatbot_response(self, query: str, context: Optional[str] = None) -> Dict:
        prompt = f"Student asked: {query}\nAssistant: "
        response = self.transformer.generate_text(prompt, max_length=100)
        return {'response': response}
    
    def summarize_content(self, text: str, max_length: int = 150) -> str:
        return self.transformer.summarize(text, max_length)

llm_service = LLMService()
