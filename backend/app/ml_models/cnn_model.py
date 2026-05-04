# backend/app/ml_models/cnn_model.py
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import List, Dict
import pickle
import os

class TextCNN(nn.Module):
    """CNN for Text Classification and Feature Extraction"""
    
    def __init__(self, vocab_size: int, embedding_dim: int = 300, 
                 num_filters: int = 100, filter_sizes: List[int] = [3, 4, 5],
                 num_classes: int = 10, dropout: float = 0.5):
        super(TextCNN, self).__init__()
        
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)
        self.convs = nn.ModuleList([
            nn.Conv2d(1, num_filters, (fs, embedding_dim)) 
            for fs in filter_sizes
        ])
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(num_filters * len(filter_sizes), num_classes)
        
    def forward(self, x):
        # x shape: (batch_size, sequence_length)
        x = self.embedding(x)  # (batch_size, sequence_length, embedding_dim)
        x = x.unsqueeze(1)  # (batch_size, 1, sequence_length, embedding_dim)
        
        conved = [F.relu(conv(x)).squeeze(3) for conv in self.convs]
        pooled = [F.max_pool1d(conv, conv.shape[2]).squeeze(2) for conv in conved]
        
        x = torch.cat(pooled, dim=1)
        x = self.dropout(x)
        x = self.fc(x)
        
        return F.log_softmax(x, dim=1)

class CNNModel:
    """CNN Model Wrapper for Academic Content Classification"""
    
    def __init__(self):
        self.model = None
        self.vocab = {}
        self.reverse_vocab = {}
        self.max_length = 500
        self.categories = [
            'syllabus', 'exam', 'assignment', 'lab', 'event',
            'notes', 'question', 'general', 'urgent', 'announcement'
        ]
        self.model_path = "backend/data/models/cnn_model.pkl"
        
    def build_vocabulary(self, texts: List[str]):
        """Build vocabulary from texts"""
        word_freq = {}
        for text in texts:
            for word in text.lower().split():
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Add special tokens
        self.vocab = {'<PAD>': 0, '<UNK>': 1}
        for word, freq in word_freq.items():
            if freq >= 2:  # Minimum frequency threshold
                self.vocab[word] = len(self.vocab)
        
        self.reverse_vocab = {v: k for k, v in self.vocab.items()}
    
    def text_to_sequence(self, text: str) -> List[int]:
        """Convert text to sequence of indices"""
        words = text.lower().split()[:self.max_length]
        sequence = [self.vocab.get(word, 1) for word in words]  # 1 is <UNK>
        
        # Pad sequence
        if len(sequence) < self.max_length:
            sequence += [0] * (self.max_length - len(sequence))
        
        return sequence
    
    def train(self, texts: List[str], labels: List[int], epochs: int = 10):
        """Train the CNN model"""
        self.build_vocabulary(texts)
        
        # Prepare data
        X = torch.tensor([self.text_to_sequence(text) for text in texts])
        y = torch.tensor(labels)
        
        # Initialize model
        self.model = TextCNN(
            vocab_size=len(self.vocab),
            num_classes=len(self.categories)
        )
        
        # Training loop
        optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)
        criterion = nn.NLLLoss()
        
        self.model.train()
        for epoch in range(epochs):
            optimizer.zero_grad()
            output = self.model(X)
            loss = criterion(output, y)
            loss.backward()
            optimizer.step()
            
            if epoch % 2 == 0:
                print(f"CNN Epoch {epoch}/{epochs}, Loss: {loss.item():.4f}")
    
    def predict(self, text: str) -> Dict:
        """Predict category of text"""
        if self.model is None:
            self.load_model()
        
        self.model.eval()
        with torch.no_grad():
            sequence = torch.tensor([self.text_to_sequence(text)])
            output = self.model(sequence)
            probabilities = torch.exp(output).numpy()[0]
            
            predicted_class = np.argmax(probabilities)
            confidence = probabilities[predicted_class]
            
            return {
                'category': self.categories[predicted_class],
                'confidence': float(confidence),
                'all_probabilities': {
                    cat: float(prob) 
                    for cat, prob in zip(self.categories, probabilities)
                }
            }
    
    def extract_features(self, text: str) -> np.ndarray:
        """Extract CNN features for ensemble model"""
        if self.model is None:
            self.load_model()
        
        self.model.eval()
        with torch.no_grad():
            sequence = torch.tensor([self.text_to_sequence(text)])
            x = self.model.embedding(sequence)
            x = x.unsqueeze(1)
            
            features = []
            for conv in self.model.convs:
                conved = F.relu(conv(x)).squeeze(3)
                pooled = F.max_pool1d(conved, conved.shape[2]).squeeze(2)
                features.append(pooled.numpy())
            
            return np.concatenate(features, axis=1)
    
    def save_model(self):
        """Save model to disk"""
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump({
                'model_state': self.model.state_dict() if self.model else None,
                'vocab': self.vocab,
                'categories': self.categories
            }, f)
    
    def load_model(self):
        """Load model from disk"""
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                data = pickle.load(f)
                self.vocab = data['vocab']
                self.categories = data['categories']
                
                self.model = TextCNN(
                    vocab_size=len(self.vocab),
                    num_classes=len(self.categories)
                )
                if data['model_state']:
                    self.model.load_state_dict(data['model_state'])

# Singleton instance
cnn_model = CNNModel()