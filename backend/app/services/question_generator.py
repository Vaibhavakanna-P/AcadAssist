# backend/app/services/question_generator.py
from app.ml_models.huggingface_transformer import HuggingFaceTransformer
from typing import List, Dict
import random
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

class QuestionGeneratorService:
    """AI-Powered Question Generator Service"""
    
    def __init__(self):
        self.transformer = HuggingFaceTransformer()
        self.stop_words = set(stopwords.words('english'))
        
        self.question_templates = {
            'definition': [
                "What is {}?",
                "Define {}.",
                "Explain the concept of {}."
            ],
            'explanation': [
                "How does {} work?",
                "Describe the process of {}.",
                "Explain {} in detail."
            ],
            'comparison': [
                "Compare and contrast {}.",
                "What are the differences between {}?",
                "How is {} different from others?"
            ],
            'application': [
                "What are the applications of {}?",
                "How can {} be applied in real-world scenarios?",
                "Give examples of {}."
            ],
            'analysis': [
                "Analyze the importance of {}.",
                "Why is {} crucial in this context?",
                "What are the implications of {}?"
            ]
        }
    
    def extract_key_terms(self, text: str, num_terms: int = 10) -> List[str]:
        """Extract key terms from text using NLP"""
        words = word_tokenize(text.lower())
        
        # Remove stopwords and punctuation
        key_terms = []
        for word in words:
            if word.isalnum() and word not in self.stop_words and len(word) > 3:
                key_terms.append(word)
        
        # Get frequency distribution
        from nltk.probability import FreqDist
        freq_dist = FreqDist(key_terms)
        
        return [term for term, _ in freq_dist.most_common(num_terms)]
    
    def generate_descriptive_questions(self, text: str, num_questions: int = 5) -> List[Dict]:
        """Generate descriptive questions from text"""
        key_terms = self.extract_key_terms(text)
        sentences = sent_tokenize(text)
        
        questions = []
        
        for i in range(min(num_questions, len(key_terms))):
            term = key_terms[i]
            
            # Choose template type based on term position
            template_type = random.choice(list(self.question_templates.keys()))
            template = random.choice(self.question_templates[template_type])
            
            question_text = template.format(term)
            
            # Find relevant sentences for answer
            relevant_sents = [s for s in sentences if term in s.lower()]
            if relevant_sents:
                answer_context = " ".join(relevant_sents[:3])
                answer = self.transformer.summarize(answer_context, max_length=100)
            else:
                answer = f"Refer to the study material for information about {term}"
            
            questions.append({
                'question': question_text,
                'answer': answer,
                'type': template_type,
                'key_term': term,
                'difficulty': random.choice(['easy', 'medium', 'hard'])
            })
        
        return questions
    
    def generate_mcq_questions(self, text: str, num_questions: int = 5) -> List[Dict]:
        """Generate Multiple Choice Questions"""
        key_terms = self.extract_key_terms(text)
        sentences = sent_tokenize(text)
        
        mcqs = []
        
        for i in range(min(num_questions, len(sentences))):
            sentence = sentences[i]
            words = word_tokenize(sentence)
            
            if len(words) < 6:
                continue
            
            # Choose a word to blank (prefer nouns/key terms)
            content_words = [w for w in words if w.lower() not in self.stop_words and w.isalnum()]
            if not content_words:
                continue
            
            blank_word = random.choice(content_words)
            blank_index = words.index(blank_word)
            
            # Create question with blank
            question_words = words.copy()
            question_words[blank_index] = "__________"
            question_text = " ".join(question_words)
            
            # Generate options (simplified - can be enhanced with word embeddings)
            correct_answer = blank_word
            
            # Get distractors from other key terms
            distractors = [t for t in key_terms[:5] if t != blank_word.lower()][:3]
            
            # Ensure we have 4 options
            options = [correct_answer] + distractors
            while len(options) < 4:
                options.append(f"Option {len(options)}")
            
            random.shuffle(options)
            
            correct_index = options.index(correct_answer)
            
            mcqs.append({
                'question': question_text,
                'options': options,
                'correct_answer': correct_answer,
                'correct_index': correct_index,
                'type': 'mcq'
            })
        
        return mcqs
    
    def generate_from_prompt(self, prompt: str, num_questions: int = 3) -> List[Dict]:
        """Generate questions using AI from a topic prompt"""
        ai_prompt = f"Generate {num_questions} academic questions about: {prompt}"
        
        # Use transformer to generate questions
        generated = self.transformer.generate_text(ai_prompt, max_length=200)
        
        # Parse generated text into questions
        questions = []
        lines = generated.split('\n')
        for line in lines:
            line = line.strip()
            if line and ('?' in line or line[0].isdigit()):
                questions.append({
                    'question': line,
                    'type': 'ai_generated',
                    'topic': prompt
                })
        
        return questions[:num_questions]

# Singleton instance
question_generator = QuestionGeneratorService()