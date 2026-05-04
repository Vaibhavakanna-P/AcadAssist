# backend/app/services/summarizer.py
from app.ml_models.huggingface_transformer import HuggingFaceTransformer
from typing import Dict, List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class SummarizerService:
    """Academic Content Summarization Service"""
    
    def __init__(self):
        self.transformer = HuggingFaceTransformer()
    
    def summarize(self, text: str, method: str = "transformer", max_length: int = 150) -> str:
        """Summarize text using specified method"""
        if method == "transformer":
            return self.transformer.summarize(text, max_length)
        elif method == "extractive":
            return self.extractive_summarize(text, num_sentences=3)
        else:
            return self.hybrid_summarize(text)
    
    def extractive_summarize(self, text: str, num_sentences: int = 3) -> str:
        """Extractive summarization using TF-IDF"""
        import nltk
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        
        from nltk.tokenize import sent_tokenize
        
        sentences = sent_tokenize(text)
        
        if len(sentences) <= num_sentences:
            return text
        
        # TF-IDF vectorization
        vectorizer = TfidfVectorizer(stop_words='english')
        sentence_vectors = vectorizer.fit_transform(sentences)
        
        # Calculate similarity matrix
        similarity_matrix = cosine_similarity(sentence_vectors)
        
        # Score sentences using TextRank-like approach
        scores = np.array(similarity_matrix.sum(axis=1)).flatten()
        
        # Get top sentences
        top_indices = scores.argsort()[-num_sentences:][::-1]
        top_indices.sort()  # Sort to maintain original order
        
        summary = " ".join([sentences[i] for i in top_indices])
        return summary
    
    def hybrid_summarize(self, text: str) -> str:
        """Combine extractive and abstractive summarization"""
        # First extractive to get key sentences
        extractive = self.extractive_summarize(text, num_sentences=5)
        
        # Then abstractive to refine
        abstractive = self.transformer.summarize(extractive, max_length=100)
        
        return abstractive
    
    def generate_bullet_points(self, text: str) -> List[str]:
        """Generate bullet point summary"""
        summary = self.summarize(text)
        
        # Split into bullet points
        sentences = summary.split('. ')
        bullet_points = [f"• {s.strip()}" for s in sentences if s.strip()]
        
        return bullet_points
    
    def create_study_notes(self, text: str) -> Dict:
        """Create structured study notes from content"""
        # Generate summary
        summary = self.summarize(text)
        
        # Extract key points
        from app.services.question_generator import question_generator
        key_terms = question_generator.extract_key_terms(text, num_terms=10)
        
        # Generate questions for review
        questions = question_generator.generate_descriptive_questions(text, num_questions=3)
        
        return {
            'summary': summary,
            'key_terms': key_terms,
            'review_questions': questions,
            'bullet_points': self.generate_bullet_points(text)
        }

# Singleton instance
summarizer = SummarizerService()