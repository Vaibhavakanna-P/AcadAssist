# backend/app/ml_models/random_forest_model.py
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
import numpy as np
import pickle
import os
from typing import List, Dict, Any

class RandomForestModel:
    """Random Forest Model for Academic Content Analysis"""
    
    def __init__(self):
        self.classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.label_encoder = LabelEncoder()
        self.is_trained = False
        self.model_path = "backend/data/models/rf_model.pkl"
        
    def preprocess_text(self, text: str) -> str:
        """Preprocess text for feature extraction"""
        # Basic preprocessing
        text = text.lower()
        # Remove special characters
        import re
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        return text
    
    def train(self, texts: List[str], labels: List[str]):
        """Train the Random Forest model"""
        # Preprocess texts
        processed_texts = [self.preprocess_text(text) for text in texts]
        
        # Transform text to TF-IDF features
        X = self.vectorizer.fit_transform(processed_texts)
        
        # Encode labels
        y = self.label_encoder.fit_transform(labels)
        
        # Train classifier
        self.classifier.fit(X, y)
        self.is_trained = True
        
        # Calculate feature importance
        feature_importance = self.classifier.feature_importances_
        top_features_idx = np.argsort(feature_importance)[-20:]
        feature_names = self.vectorizer.get_feature_names_out()
        
        print("Top 10 important features:")
        for idx in top_features_idx[-10:]:
            print(f"  {feature_names[idx]}: {feature_importance[idx]:.4f}")
    
    def predict(self, text: str) -> Dict[str, Any]:
        """Predict using Random Forest"""
        if not self.is_trained:
            self.load_model()
        
        # Preprocess and vectorize
        processed_text = self.preprocess_text(text)
        X = self.vectorizer.transform([processed_text])
        
        # Get prediction
        prediction = self.classifier.predict(X)[0]
        probabilities = self.classifier.predict_proba(X)[0]
        
        # Get top 3 predictions
        top_indices = np.argsort(probabilities)[-3:][::-1]
        
        return {
            'prediction': self.label_encoder.inverse_transform([prediction])[0],
            'confidence': float(probabilities[top_indices[0]]),
            'top_predictions': [
                {
                    'label': self.label_encoder.inverse_transform([idx])[0],
                    'probability': float(probabilities[idx])
                }
                for idx in top_indices
            ],
            'model': 'RandomForest'
        }
    
    def get_feature_importance(self, text: str) -> Dict[str, float]:
        """Get feature importance for a specific text"""
        processed_text = self.preprocess_text(text)
        X = self.vectorizer.transform([processed_text])
        
        # Get non-zero features
        feature_names = self.vectorizer.get_feature_names_out()
        feature_vector = X.toarray()[0]
        
        important_features = {}
        for i, val in enumerate(feature_vector):
            if val > 0:
                importance = self.classifier.feature_importances_[i]
                important_features[feature_names[i]] = float(val * importance)
        
        # Sort by importance
        sorted_features = dict(sorted(
            important_features.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10])
        
        return sorted_features
    
    def save_model(self):
        """Save model and vectorizer"""
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump({
                'classifier': self.classifier,
                'vectorizer': self.vectorizer,
                'label_encoder': self.label_encoder,
                'is_trained': self.is_trained
            }, f)
    
    def load_model(self):
        """Load model from disk"""
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                data = pickle.load(f)
                self.classifier = data['classifier']
                self.vectorizer = data['vectorizer']
                self.label_encoder = data['label_encoder']
                self.is_trained = data['is_trained']

# Singleton instance
rf_model = RandomForestModel()