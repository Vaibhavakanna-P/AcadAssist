from fastapi import APIRouter
from pydantic import BaseModel
from app.ml_models.qwen_model import qwen_model

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat(request: ChatRequest):
    query = request.message.strip()
    
    print(f"\n📝 Query: {query}")
    
    # Load model if needed
    if qwen_model.model is None:
        print("Loading model...")
        qwen_model.load_model()
    
    # Try first prompt
    response = qwen_model.generate(query, max_tokens=2048)
    print(f"First attempt: {len(response)} chars")
    
    # If response is too short, try alternative prompt
    if len(response.strip()) < 20:
        print("Response too short, retrying...")
        prompt2 = f"Provide a detailed explanation about: {query}. Include definitions, key concepts, examples, and applications."
        response = qwen_model.generate(prompt2, max_tokens=2048)
        print(f"Second attempt: {len(response)} chars")
    
    # If still too short, try one more time
    if len(response.strip()) < 20:
        print("Still short, final attempt...")
        prompt3 = f"Write a comprehensive answer about {query}. Explain what it is, why it matters, and give examples."
        response = qwen_model.generate(prompt3, max_tokens=2048)
        print(f"Final attempt: {len(response)} chars")
    
    # Absolute fallback
    if len(response.strip()) < 10:
        response = f"**{query}**\n\nThis is an important topic in computer science and technology. I recommend checking your course materials, textbooks, or the Resources section for detailed information about this subject."
    
    print(f"✅ Final response: {len(response)} chars")
    return {"response": response.strip()}
