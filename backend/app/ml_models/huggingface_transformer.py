# backend/app/ml_models/huggingface_transformer.py
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    AutoModelForQuestionAnswering,
    AutoModelForCausalLM,
    AutoModelForSeq2SeqLM,
    pipeline,
)
import torch
import numpy as np
from typing import List, Dict, Optional, Union
import os

class HuggingFaceTransformer:
    """HuggingFace Transformer Models Integration"""
    
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.models = {}
        self.tokenizers = {}
        self.pipelines = {}
        
        # Model configurations
        self.model_configs = {
            'classification': 'distilbert-base-uncased-finetuned-sst-2-english',
            'qa': 'distilbert-base-cased-distilled-squad',
            'generation': 'google/flan-t5-small',
            'summarization': 'facebook/bart-large-cnn',
            'embedding': 'sentence-transformers/all-MiniLM-L6-v2'
        }
        
        print(f"Using device: {self.device}")
    
    def load_model(self, model_type: str):
        """Load a specific model type"""
        if model_type in self.models:
            return self.models[model_type], self.tokenizers[model_type]
        
        model_name = self.model_configs.get(model_type)
        if not model_name:
            raise ValueError(f"Unknown model type: {model_type}")
        
        print(f"Loading {model_type} model: {model_name}")
        
        try:
            if model_type == 'classification':
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                model = AutoModelForSequenceClassification.from_pretrained(model_name)
                
            elif model_type == 'qa':
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                model = AutoModelForQuestionAnswering.from_pretrained(model_name)
                
            elif model_type == 'generation':
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                tokenizer.pad_token = tokenizer.eos_token
                model = AutoModelForCausalLM.from_pretrained(model_name)
                
            elif model_type == 'summarization':
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
                
            elif model_type == 'embedding':
                from sentence_transformers import SentenceTransformer
                tokenizer = None
                model = SentenceTransformer(model_name)
            
            model = model.to(self.device)
            model.eval()
            
            # Cache models
            self.models[model_type] = model
            self.tokenizers[model_type] = tokenizer
            
            return model, tokenizer
            
        except Exception as e:
            print(f"Error loading model {model_type}: {str(e)}")
            raise
    
    def classify_text(self, text: str) -> Dict:
        """Classify text using transformer"""
        model, tokenizer = self.load_model('classification')
        
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model(**inputs)
            probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
        
        # Convert to numpy for easier handling
        probs = probabilities[0].cpu().numpy()
        
        return {
            'positive_score': float(probs[1]),
            'negative_score': float(probs[0]),
            'sentiment': 'positive' if probs[1] > probs[0] else 'negative'
        }
    
    def answer_question(self, question: str, context: str) -> Dict:
        """Answer questions using QA model"""
        model, tokenizer = self.load_model('qa')
        
        inputs = tokenizer(
            question, 
            context, 
            return_tensors="pt",
            max_length=512,
            truncation=True
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model(**inputs)
            
            answer_start = torch.argmax(outputs.start_logits)
            answer_end = torch.argmax(outputs.end_logits) + 1
            
            answer = tokenizer.convert_tokens_to_string(
                tokenizer.convert_ids_to_tokens(
                    inputs['input_ids'][0][answer_start:answer_end]
                )
            )
            
            confidence = float(
                torch.max(torch.softmax(outputs.start_logits, dim=1)) *
                torch.max(torch.softmax(outputs.end_logits, dim=1))
            )
        
        return {
            'answer': answer,
            'confidence': confidence,
            'start_position': int(answer_start),
            'end_position': int(answer_end)
        }
    
    def generate_text(self, prompt: str, max_length: int = 150) -> str:
        """Generate text using DialoGPT"""
        model, tokenizer = self.load_model('generation')
        
        # Encode input
        inputs = tokenizer.encode(prompt, return_tensors="pt").to(self.device)
        
        # Generate response
        with torch.no_grad():
            outputs = model.generate(
                inputs,
                max_length=max_length,
                temperature=0.7,
                do_sample=True,
                top_k=50,
                top_p=0.95,
                pad_token_id=tokenizer.eos_token_id,
                no_repeat_ngram_size=3
            )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Remove prompt from response
        if response.startswith(prompt):
            response = response[len(prompt):].strip()
        
        return response
    
    def summarize(self, text: str, max_length: int = 130, min_length: int = 30) -> str:
        """Summarize text using BART"""
        model, tokenizer = self.load_model('summarization')
        
        inputs = tokenizer(
            text,
            max_length=1024,
            truncation=True,
            return_tensors="pt"
        ).to(self.device)
        
        with torch.no_grad():
            summary_ids = model.generate(
                inputs['input_ids'],
                max_length=max_length,
                min_length=min_length,
                num_beams=4,
                early_stopping=True
            )
        
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary
    
    def get_embeddings(self, text: Union[str, List[str]]) -> np.ndarray:
        """Get text embeddings using SentenceTransformer"""
        model, _ = self.load_model('embedding')
        
        if isinstance(text, str):
            embeddings = model.encode([text])
        else:
            embeddings = model.encode(text)
        
        return embeddings
    
    def compute_similarity(self, text1: str, text2: str) -> float:
        """Compute semantic similarity between two texts"""
        embeddings = self.get_embeddings([text1, text2])
        
        # Cosine similarity
        similarity = np.dot(embeddings[0], embeddings[1]) / (
            np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
        )
        
        return float(similarity)
    
    def extract_keywords(self, text: str, num_keywords: int = 5) -> List[str]:
        """Extract keywords from text using embeddings"""
        from sklearn.feature_extraction.text import TfidfVectorizer
        
        # Use TF-IDF for keyword extraction
        vectorizer = TfidfVectorizer(stop_words='english', max_features=num_keywords)
        try:
            vectorizer.fit_transform([text])
            keywords = vectorizer.get_feature_names_out().tolist()
            return keywords
        except:
            return []
    
    def analyze_academic_text(self, text: str) -> Dict:
        """Comprehensive analysis of academic text"""
        # Get sentiment
        sentiment = self.classify_text(text)
        
        # Get summary
        summary = self.summarize(text, max_length=100)
        
        # Get keywords
        keywords = self.extract_keywords(text)
        
        # Get embeddings for search
        embeddings = self.get_embeddings(text)
        
        return {
            'sentiment': sentiment,
            'summary': summary,
            'keywords': keywords,
            'embedding_shape': embeddings.shape,
            'text_length': len(text.split())
        }
    
    def batch_process(self, texts: List[str], task: str = 'summarize') -> List:
        """Batch process multiple texts"""
        results = []
        for text in texts:
            try:
                if task == 'summarize':
                    result = self.summarize(text)
                elif task == 'classify':
                    result = self.classify_text(text)
                elif task == 'embed':
                    result = self.get_embeddings(text)
                else:
                    result = None
                results.append(result)
            except Exception as e:
                print(f"Error processing text: {e}")
                results.append(None)
        return results
    
    def save_model_cache(self, path: str = "backend/data/models/cache/"):
        """Save model cache information"""
        os.makedirs(path, exist_ok=True)
        cache_info = {
            'device': str(self.device),
            'loaded_models': list(self.models.keys()),
            'model_configs': self.model_configs
        }
        import json
        with open(os.path.join(path, 'cache_info.json'), 'w') as f:
            json.dump(cache_info, f, indent=2)
        print(f"Model cache info saved to {path}")

# Singleton instance
hf_transformer = HuggingFaceTransformer()