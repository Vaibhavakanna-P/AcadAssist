# backend/app/ml_models/ensemble_model.py
import numpy as np
from typing import List, Dict, Any
from app.ml_models.cnn_model import cnn_model
from app.ml_models.random_forest_model import rf_model
from app.ml_models.huggingface_transformer import HuggingFaceTransformer

class EnsembleModel:
    """Ensemble Model combining CNN, RandomForest, and HuggingFace Transformer"""
    
    def __init__(self):
        self.cnn = cnn_model
        self.rf = rf_model
        self.transformer = HuggingFaceTransformer()
        self.weights = {
            'cnn': 0.3,
            'rf': 0.3,
            'transformer': 0.4
        }
        
    def predict(self, text: str) -> Dict[str, Any]:
        """Get ensemble prediction from all models"""
        predictions = {}
        confidences = {}
        
        # Get CNN prediction
        try:
            cnn_result = self.cnn.predict(text)
            predictions['cnn'] = cnn_result['category']
            confidences['cnn'] = cnn_result['confidence']
        except Exception as e:
            print(f"CNN prediction failed: {e}")
            predictions['cnn'] = None
            confidences['cnn'] = 0.0
        
        # Get Random Forest prediction
        try:
            rf_result = self.rf.predict(text)
            predictions['rf'] = rf_result['prediction']
            confidences['rf'] = rf_result['confidence']
        except Exception as e:
            print(f"RF prediction failed: {e}")
            predictions['rf'] = None
            confidences['rf'] = 0.0
        
        # Get Transformer prediction
        try:
            transformer_result = self.transformer.classify_text(text)
            predictions['transformer'] = transformer_result['sentiment']
            confidences['transformer'] = max(
                transformer_result['positive_score'],
                transformer_result['negative_score']
            )
        except Exception as e:
            print(f"Transformer prediction failed: {e}")
            predictions['transformer'] = None
            confidences['transformer'] = 0.0
        
        # Weighted ensemble
        weighted_score = 0
        total_weight = 0
        
        for model_name, confidence in confidences.items():
            if confidence > 0:
                weight = self.weights[model_name]
                weighted_score += confidence * weight
                total_weight += weight
        
        ensemble_confidence = weighted_score / total_weight if total_weight > 0 else 0
        
        # Majority voting for final prediction
        valid_predictions = [p for p in predictions.values() if p is not None]
        if valid_predictions:
            from collections import Counter
            final_prediction = Counter(valid_predictions).most_common(1)[0][0]
        else:
            final_prediction = "unknown"
        
        return {
            'final_prediction': final_prediction,
            'ensemble_confidence': ensemble_confidence,
            'individual_predictions': predictions,
            'individual_confidences': confidences,
            'model_agreement': len(set(valid_predictions)) == 1 if valid_predictions else False
        }
    
    def get_content_recommendation(self, text: str, resources: List[str]) -> List[Dict]:
        """Get personalized content recommendations"""
        # Get embeddings for input text
        text_embedding = self.transformer.get_embeddings(text)
        
        # Get embeddings for resources
        resource_embeddings = self.transformer.get_embeddings(resources)
        
        # Calculate similarities
        from sklearn.metrics.pairwise import cosine_similarity
        similarities = cosine_similarity(text_embedding, resource_embeddings)[0]
        
        # Sort by similarity
        recommendations = []
        for idx, score in enumerate(similarities):
            recommendations.append({
                'resource': resources[idx],
                'similarity_score': float(score),
                'recommended': score > 0.5
            })
        
        recommendations.sort(key=lambda x: x['similarity_score'], reverse=True)
        return recommendations[:5]
    
    def analyze_academic_content(self, content: str) -> Dict:
        """Comprehensive academic content analysis"""
        # Run all analyses
        sentiment = self.transformer.classify_text(content)
        ensemble_pred = self.predict(content)
        
        # Extract key phrases using RF feature importance
        key_phrases = self.rf.get_feature_importance(content)
        
        return {
            'sentiment_analysis': sentiment,
            'content_classification': ensemble_pred,
            'key_phrases': key_phrases,
            'content_length': len(content.split()),
            'complexity_score': self._calculate_complexity(content)
        }
    
    def _calculate_complexity(self, text: str) -> float:
        """Calculate content complexity score"""
        words = text.split()
        if not words:
            return 0.0
        
        avg_word_length = np.mean([len(word) for word in words])
        sentence_count = max(1, text.count('.') + text.count('!') + text.count('?'))
        words_per_sentence = len(words) / sentence_count
        
        # Normalize scores
        complexity = (avg_word_length * 0.4 + (words_per_sentence / 20) * 0.6)
        return min(1.0, complexity)

# Singleton instance
ensemble_model = EnsembleModel()