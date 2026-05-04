from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.security import get_current_user
from typing import List, Dict
import random
from app.ml_models.qwen_model import qwen_model

router = APIRouter()

class QuestionRequest(BaseModel):
    content: str
    num_questions: int = 5
    question_type: str = "descriptive"

@router.post("/generate")
async def generate_questions(request: QuestionRequest, current_user = Depends(get_current_user)):
    """Generate questions with proper answers using Qwen model"""
    try:
        content = request.content.strip()
        if not content:
            raise HTTPException(400, "Please provide some content!")
        
        sentences = [s.strip() for s in content.replace('!', '.').replace('?', '.').split('.') if len(s.strip()) > 10]
        
        if not sentences:
            raise HTTPException(400, "Content too short!")
        
        # Extract key topics from the content
        key_topics = []
        for sentence in sentences[:10]:
            words = sentence.split()
            if len(words) > 5:
                # Extract meaningful phrases
                for i in range(0, len(words)-3, 3):
                    phrase = ' '.join(words[i:i+4])
                    if len(phrase) > 15:
                        key_topics.append(phrase)
        
        # Remove duplicates and limit
        key_topics = list(dict.fromkeys(key_topics))[:request.num_questions]
        
        question_templates = [
            "Explain {} in detail.",
            "What is {} and why is it important?",
            "Describe the key concepts of {}.",
            "How does {} work? Provide examples.",
            "What are the applications of {}?",
            "Define {} and explain its significance.",
        ]
        
        questions = []
        
        for i, topic in enumerate(key_topics):
            template = random.choice(question_templates)
            question_text = template.format(topic)
            
            # Generate answer using Qwen model
            print(f"Generating answer for Q{i+1}: {question_text[:50]}...")
            
            try:
                if qwen_model.model is None:
                    qwen_model.load_model()
                
                answer = qwen_model.generate(f"Answer this question in 3-4 sentences: {question_text}")
                
                if not answer or len(answer) < 20:
                    # Use content-based answer as fallback
                    relevant_sentences = [s for s in sentences if any(w in s.lower() for w in topic.lower().split()[:3])]
                    answer = ' '.join(relevant_sentences[:3]) if relevant_sentences else sentences[i % len(sentences)]
            except Exception as e:
                print(f"Qwen error: {e}, using fallback")
                answer = sentences[i % len(sentences)] if sentences else "Refer to study materials."
            
            questions.append({
                "question": question_text,
                "answer": answer[:500],
                "type": request.question_type,
                "difficulty": random.choice(["easy", "medium", "hard"]),
                "topic": topic[:60]
            })
        
        # Add one general summary question
        if len(questions) < request.num_questions:
            general_q = f"Summarize the key points about {key_topics[0][:40]}..."
            questions.append({
                "question": general_q,
                "answer": ' '.join(sentences[:5])[:500],
                "type": "descriptive",
                "difficulty": "medium",
                "topic": key_topics[0][:40]
            })
        
        return {"questions": questions[:request.num_questions]}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Question generation error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(500, "Failed to generate questions")
