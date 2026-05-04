# backend/app/services/rag_service.py
import os
import json
import numpy as np
from typing import List, Dict, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class RAGService:
    """RAG Service using TF-IDF for document retrieval"""
    
    def __init__(self):
        self.documents = []
        self.embeddings = None
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        self.data_path = "data/rag_docs.json"
        os.makedirs("data", exist_ok=True)
        self.load()
    
    def add_documents(self, texts: List[str], metadata: List[Dict] = None):
        if metadata is None:
            metadata = [{"source": "manual"} for _ in texts]
        
        for text, meta in zip(texts, metadata):
            if text and len(text) > 20:
                self.documents.append({"text": text, "metadata": meta})
        
        if self.documents:
            corpus = [d["text"] for d in self.documents]
            self.embeddings = self.vectorizer.fit_transform(corpus)
            self.save()
        print(f"RAG: {len(self.documents)} total documents indexed")
    
    def retrieve(self, query: str, top_k: int = 3) -> List[Dict]:
        if not self.documents:
            return []
        
        try:
            query_vec = self.vectorizer.transform([query])
            scores = cosine_similarity(query_vec, self.embeddings)[0]
            top_indices = np.argsort(scores)[-top_k:][::-1]
            
            results = []
            for idx in top_indices:
                if scores[idx] > 0.05:
                    results.append({
                        "text": self.documents[idx]["text"],
                        "score": float(scores[idx]),
                        "metadata": self.documents[idx].get("metadata", {})
                    })
            return results
        except Exception as e:
            print(f"RAG retrieve error: {e}")
            return []
    
    def get_context(self, query: str, top_k: int = 3) -> str:
        docs = self.retrieve(query, top_k)
        if docs:
            return "\n\n".join([d["text"][:500] for d in docs])
        return ""
    
    def save(self):
        data = [{"text": d["text"], "metadata": d.get("metadata", {})} for d in self.documents]
        with open(self.data_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False)
    
    def load(self):
        if os.path.exists(self.data_path):
            with open(self.data_path, 'r', encoding='utf-8') as f:
                self.documents = json.load(f)
            if self.documents:
                corpus = [d["text"] for d in self.documents]
                self.embeddings = self.vectorizer.fit_transform(corpus)
                print(f"RAG: Loaded {len(self.documents)} documents from disk")
    
    def get_stats(self) -> Dict:
        return {"total_documents": len(self.documents)}

rag_service = RAGService()
