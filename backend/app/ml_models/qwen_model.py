# backend/app/ml_models/qwen_model.py
import os
from typing import Optional, List, Dict
from llama_cpp import Llama

class QwenModel:
    """Qwen 2.5 Model wrapper with GGUF support for detailed academic responses"""
    
    def __init__(self, model_path: str = None):
        self.model = None
        self.model_path = model_path or os.getenv(
            "QWEN_MODEL_PATH", 
            "backend/data/models/qwen2.5-1.5b-instruct-q4_k_m.gguf"
        )
        self.n_ctx = 8192  # Larger context window for longer responses
        
    def load_model(self):
        """Load Qwen GGUF model"""
        if self.model is not None:
            return
        
        if not os.path.exists(self.model_path):
            print(f"Model not found at {self.model_path}")
            print("Download a Qwen GGUF file from: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF")
            print("Recommended: qwen2.5-1.5b-instruct-q4_k_m.gguf (~1GB)")
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        
        print(f"Loading Qwen model from {self.model_path}...")
        self.model = Llama(
            model_path=self.model_path,
            n_ctx=self.n_ctx,
            n_threads=4,
            n_gpu_layers=24,  # Set to -1 for GPU
            verbose=False
        )
        print("Qwen model loaded!")
    
    def _detect_question_type(self, query: str) -> str:
        """Detect the type of question and adjust response style"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['describe', 'explain', 'elaborate', 'what is', 'define']):
            return "detailed_explanation"
        elif any(word in query_lower for word in ['compare', 'difference', 'versus', 'vs']):
            return "comparison"
        elif any(word in query_lower for word in ['list', 'enumerate', 'what are', 'name']):
            return "list_format"
        elif any(word in query_lower for word in ['how', 'steps', 'process', 'procedure']):
            return "step_by_step"
        elif any(word in query_lower for word in ['example', 'illustrate', 'demonstrate']):
            return "with_examples"
        else:
            return "general"
    
    def _get_system_prompt(self, question_type: str) -> str:
        """Get appropriate system prompt based on question type"""
        prompts = {
            "detailed_explanation": """You are an expert academic professor. Provide DETAILED, comprehensive explanations.
- Write 2-3 paragraphs minimum
- Include definitions, key concepts, and practical applications
- Use academic language but remain clear
- Structure your response with clear organization
- End with a brief summary""",
            
            "comparison": """You are an expert academic professor. Provide DETAILED comparisons.
- Use a structured comparison format
- Highlight similarities AND differences
- Include examples for each point
- Write 2-3 paragraphs with clear organization""",
            
            "list_format": """You are an expert academic professor. Provide comprehensive lists.
- List items clearly with brief explanations
- Organize logically (by importance or chronology)
- Include 2-3 sentences of context before the list
- Add a concluding remark""",
            
            "step_by_step": """You are an expert academic professor. Explain processes step-by-step.
- Break down into clear, numbered steps
- Explain WHY each step matters
- Include 2-3 paragraphs of detailed instruction
- Add practical tips""",
            
            "with_examples": """You are an expert academic professor. Provide examples with explanations.
- Start with a clear definition
- Provide 2-3 concrete examples
- Explain each example in detail
- Connect examples to real-world applications""",
            
            "general": """You are a helpful academic assistant. Answer questions thoroughly.
- Provide 2-3 paragraphs of relevant information
- Be clear and educational
- Include key concepts and definitions
- End with a helpful summary"""
        }
        return prompts.get(question_type, prompts["general"])
    
    def generate(self, prompt: str, max_tokens: int = 2048, temperature: float = 0.7) -> str:
        """Generate text using Qwen with adaptive response length"""
        self.load_model()
        
        # Detect question type
        question_type = self._detect_question_type(prompt)
        system_prompt = self._get_system_prompt(question_type)
        
        # Adjust max_tokens based on question type
        token_map = {
            "detailed_explanation": 2048,
            "comparison": 1024,
            "list_format": 1024,
            "step_by_step": 2048,
            "with_examples": 400,
            "general": 1024
        }
        max_tokens = token_map.get(question_type, max_tokens)
        
        # Format prompt for Qwen with system message
        formatted_prompt = f"""<|im_start|>system
{system_prompt}<|im_end|>
<|im_start|>user
{prompt}<|im_end|>
<|im_start|>assistant
"""
        
        response = self.model(
            formatted_prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=0.9,
            top_k=40,
            repeat_penalty=1.1,
            stop=["<|im_end|>", "<|im_start|>"],
            echo=False
        )
        
        result = response['choices'][0]['text'].strip()
        
        # Ensure minimum response length for detailed questions
        if question_type == "detailed_explanation" and len(result.split()) < 50:
            # Regenerate with more tokens if response is too short
            response = self.model(
                formatted_prompt,
                max_tokens=2048,
                temperature=0.8,
                top_p=0.95,
                top_k=50,
                repeat_penalty=1.1,
                stop=["<|im_end|>", "<|im_start|>"],
                echo=False
            )
            result = response['choices'][0]['text'].strip()
        
        return result
    
    def generate_with_context(self, query: str, context: str, max_tokens: int = 2048) -> str:
        """Generate answer using retrieved context with detailed responses"""
        question_type = self._detect_question_type(query)
        
        prompt = f"""Use the following academic content to answer the question in DETAIL.
Provide 2-3 paragraphs of comprehensive information.

Academic Context:
{context[:2000]}

Question: {query}

Provide a thorough, well-structured answer with key concepts, explanations, and examples where relevant:"""
        
        return self.generate(prompt, max_tokens=max_tokens)
    
    def generate_lecture_style(self, topic: str, depth: str = "moderate") -> str:
        """Generate lecture-style explanation on a topic"""
        depth_tokens = {
            "brief": 200,
            "moderate": 400,
            "detailed": 600,
            "comprehensive": 800
        }
        
        prompt = f"""Provide a {depth} academic lecture on the following topic.
Include definitions, key concepts, practical applications, and examples.

Topic: {topic}

Structure your response as a mini-lecture with:
1. Introduction and definition
2. Key concepts and principles  
3. Practical applications and examples
4. Summary and significance"""
        
        return self.generate(prompt, max_tokens=depth_tokens.get(depth, 400))

# Singleton instance
qwen_model = QwenModel()