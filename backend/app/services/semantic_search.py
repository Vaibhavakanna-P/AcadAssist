# backend/app/services/semantic_search.py
from app.ml_models.huggingface_transformer import HuggingFaceTransformer
import numpy as np
from typing import List, Tuple, Dict, Optional
import pickle
import os
import json
from datetime import datetime

class SemanticSearchService:
    """Semantic Search using Sentence Transformers for Academic Resources"""
    
    def __init__(self):
        self.transformer = HuggingFaceTransformer()
        self.index = {}
        self.cache_path = "backend/data/search_index.pkl"
        self.metadata_path = "backend/data/search_metadata.json"
        self.metadata = {}
        
        # Try to load existing index
        self.load_index()
    
    def build_index(self, documents: List[str], doc_ids: List[int] = None, 
                    metadata: List[Dict] = None):
        """Build search index from documents with optional metadata"""
        print(f"Building search index for {len(documents)} documents...")
        
        if not documents:
            print("No documents to index")
            return
        
        # Get embeddings for all documents
        embeddings = self.transformer.get_embeddings(documents)
        
        # Store index with timestamps
        for i, embedding in enumerate(embeddings):
            doc_id = doc_ids[i] if doc_ids else i
            self.index[doc_id] = {
                'embedding': embedding.tolist() if isinstance(embedding, np.ndarray) else embedding,
                'text': documents[i][:1000],  # Store first 1000 chars
                'indexed_at': datetime.now().isoformat()
            }
            
            # Store metadata if provided
            if metadata and i < len(metadata):
                self.metadata[doc_id] = metadata[i]
        
        # Save index and metadata
        self.save_index()
        self.save_metadata()
        print(f"Successfully indexed {len(self.index)} documents")
    
    def search(self, query: str, documents: List[str] = None, top_k: int = 5) -> List[Tuple[int, float]]:
        """Search for relevant documents using semantic similarity"""
        if not query or not query.strip():
            return []
        
        # Get query embedding
        query_embedding = self.transformer.get_embeddings(query)
        if isinstance(query_embedding, np.ndarray) and len(query_embedding.shape) > 1:
            query_embedding = query_embedding[0]
        
        if documents:
            # Search in provided documents (real-time)
            doc_embeddings = self.transformer.get_embeddings(documents)
            
            # Normalize embeddings
            query_norm = query_embedding / np.linalg.norm(query_embedding)
            doc_norms = doc_embeddings / np.linalg.norm(doc_embeddings, axis=1, keepdims=True)
            
            # Calculate cosine similarities
            similarities = np.dot(doc_norms, query_norm)
            
            # Get top k results
            top_indices = np.argsort(similarities)[-top_k:][::-1]
            results = [(int(i), float(similarities[i])) for i in top_indices if similarities[i] > 0]
            
        elif self.index:
            # Search in pre-built index (faster)
            results = []
            query_norm = query_embedding / (np.linalg.norm(query_embedding) + 1e-8)
            
            for doc_id, doc_data in self.index.items():
                doc_embedding = np.array(doc_data['embedding'])
                doc_norm = doc_embedding / (np.linalg.norm(doc_embedding) + 1e-8)
                
                similarity = float(np.dot(doc_norm, query_norm))
                
                if similarity > 0.1:  # Minimum threshold
                    results.append((doc_id, similarity))
            
            # Sort by similarity (highest first)
            results.sort(key=lambda x: x[1], reverse=True)
            results = results[:top_k]
        else:
            print("No index or documents available for search")
            results = []
        
        return results
    
    def search_with_context(self, query: str, top_k: int = 5) -> List[Dict]:
        """Search and return results with full context and metadata"""
        results = self.search(query, top_k=top_k)
        
        enriched_results = []
        for doc_id, score in results:
            result = {
                'doc_id': doc_id,
                'relevance_score': round(score, 4),
                'text_preview': self.index.get(doc_id, {}).get('text', '')[:200] + '...',
                'indexed_at': self.index.get(doc_id, {}).get('indexed_at', 'unknown')
            }
            
            # Add metadata if available
            if doc_id in self.metadata:
                result['metadata'] = self.metadata[doc_id]
            
            enriched_results.append(result)
        
        return enriched_results
    
    def find_similar_resources(self, resource_text: str, top_k: int = 5) -> List[Dict]:
        """Find resources similar to the given text"""
        if not self.index:
            print("No index available. Building index first...")
            return []
        
        results = self.search(resource_text, top_k=top_k)
        
        similar_resources = []
        for doc_id, similarity in results:
            if similarity > 0.3:  # Relevance threshold
                doc_data = self.index[doc_id]
                resource_info = {
                    'doc_id': doc_id,
                    'similarity': round(similarity, 4),
                    'preview': doc_data['text'][:200] + '...' if len(doc_data['text']) > 200 else doc_data['text'],
                    'full_text': doc_data['text'],
                    'indexed_at': doc_data.get('indexed_at', 'unknown')
                }
                
                # Include metadata
                if doc_id in self.metadata:
                    resource_info.update(self.metadata[doc_id])
                
                similar_resources.append(resource_info)
        
        return similar_resources
    
    def find_by_topic(self, topic: str, top_k: int = 5) -> List[Dict]:
        """Find resources related to a specific academic topic"""
        query = f"academic content about {topic} study material notes syllabus"
        return self.search_with_context(query, top_k)
    
    def get_recommendations(self, user_interests: List[str], top_k: int = 10) -> List[Dict]:
        """Get personalized recommendations based on user interests"""
        if not self.index:
            return []
        
        all_recommendations = []
        seen_ids = set()
        
        for interest in user_interests:
            results = self.search(interest, top_k=top_k)
            for doc_id, score in results:
                if doc_id not in seen_ids and score > 0.2:
                    seen_ids.add(doc_id)
                    doc_data = self.index[doc_id]
                    all_recommendations.append({
                        'doc_id': doc_id,
                        'interest': interest,
                        'relevance_score': round(score, 4),
                        'preview': doc_data['text'][:150] + '...'
                    })
        
        # Sort by relevance score
        all_recommendations.sort(key=lambda x: x['relevance_score'], reverse=True)
        return all_recommendations[:top_k]
    
    def update_document(self, doc_id: int, new_text: str, new_metadata: Dict = None):
        """Update a document in the index"""
        if not new_text:
            return
        
        # Get new embedding
        embedding = self.transformer.get_embeddings(new_text)
        if isinstance(embedding, np.ndarray) and len(embedding.shape) > 1:
            embedding = embedding[0]
        
        # Update index
        self.index[doc_id] = {
            'embedding': embedding.tolist() if isinstance(embedding, np.ndarray) else embedding,
            'text': new_text[:1000],
            'indexed_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Update metadata
        if new_metadata:
            self.metadata[doc_id] = new_metadata
        
        # Save changes
        self.save_index()
        self.save_metadata()
        print(f"Document {doc_id} updated in index")
    
    def remove_document(self, doc_id: int):
        """Remove a document from the index"""
        if doc_id in self.index:
            del self.index[doc_id]
            print(f"Document {doc_id} removed from index")
        
        if doc_id in self.metadata:
            del self.metadata[doc_id]
        
        # Save changes
        self.save_index()
        self.save_metadata()
    
    def get_index_stats(self) -> Dict:
        """Get statistics about the current index"""
        return {
            'total_documents': len(self.index),
            'total_metadata_entries': len(self.metadata),
            'cache_path': self.cache_path,
            'cache_exists': os.path.exists(self.cache_path),
            'last_updated': max(
                [doc.get('indexed_at', 'unknown') for doc in self.index.values()],
                default='never'
            ),
            'embedding_dimension': len(
                next(iter(self.index.values()))['embedding']
            ) if self.index else 0
        }
    
    def search_by_department(self, query: str, department: str, top_k: int = 5) -> List[Dict]:
        """Search filtered by department"""
        results = self.search_with_context(query, top_k=top_k * 2)
        
        # Filter by department in metadata
        filtered_results = [
            r for r in results 
            if r.get('metadata', {}).get('department') == department
        ]
        
        return filtered_results[:top_k]
    
    def search_by_resource_type(self, query: str, resource_type: str, top_k: int = 5) -> List[Dict]:
        """Search filtered by resource type (syllabus, notes, etc.)"""
        results = self.search_with_context(query, top_k=top_k * 2)
        
        # Filter by resource type in metadata
        filtered_results = [
            r for r in results 
            if r.get('metadata', {}).get('resource_type') == resource_type
        ]
        
        return filtered_results[:top_k]
    
    def hybrid_search(self, query: str, keywords: List[str] = None, top_k: int = 5) -> List[Dict]:
        """Combine semantic and keyword-based search"""
        # Semantic search
        semantic_results = self.search(query, top_k=top_k * 2)
        
        # Keyword search (simple TF-IDF-like scoring)
        keyword_scores = {}
        if keywords and self.index:
            for doc_id, doc_data in self.index.items():
                text_lower = doc_data['text'].lower()
                keyword_count = sum(1 for kw in keywords if kw.lower() in text_lower)
                if keyword_count > 0:
                    keyword_scores[doc_id] = keyword_count / len(keywords)
        
        # Combine scores
        combined_results = []
        for doc_id, semantic_score in semantic_results:
            keyword_score = keyword_scores.get(doc_id, 0)
            # Weighted combination (70% semantic, 30% keyword)
            combined_score = 0.7 * semantic_score + 0.3 * keyword_score
            combined_results.append((doc_id, combined_score))
        
        # Sort by combined score
        combined_results.sort(key=lambda x: x[1], reverse=True)
        
        # Return top_k with full context
        final_results = []
        for doc_id, score in combined_results[:top_k]:
            if score > 0.1:
                final_results.append({
                    'doc_id': doc_id,
                    'combined_score': round(score, 4),
                    'semantic_score': round(dict(semantic_results).get(doc_id, 0), 4),
                    'keyword_score': round(keyword_scores.get(doc_id, 0), 4),
                    'preview': self.index[doc_id]['text'][:200] + '...'
                })
        
        return final_results
    
    def batch_search(self, queries: List[str], top_k: int = 5) -> List[List[Dict]]:
        """Perform multiple searches at once"""
        all_results = []
        for query in queries:
            results = self.search_with_context(query, top_k)
            all_results.append(results)
        return all_results
    
    def save_index(self):
        """Save index to disk"""
        try:
            os.makedirs(os.path.dirname(self.cache_path), exist_ok=True)
            
            # Convert numpy arrays to lists for serialization
            serializable_index = {}
            for doc_id, doc_data in self.index.items():
                serializable_index[doc_id] = {
                    'embedding': doc_data['embedding'] if isinstance(doc_data['embedding'], list) 
                                else doc_data['embedding'].tolist() if isinstance(doc_data['embedding'], np.ndarray)
                                else doc_data['embedding'],
                    'text': doc_data['text'],
                    'indexed_at': doc_data.get('indexed_at', datetime.now().isoformat())
                }
            
            with open(self.cache_path, 'wb') as f:
                pickle.dump(serializable_index, f)
            
            print(f"Index saved to {self.cache_path} ({len(self.index)} documents)")
        except Exception as e:
            print(f"Error saving index: {e}")
    
    def load_index(self):
        """Load index from disk"""
        if os.path.exists(self.cache_path):
            try:
                with open(self.cache_path, 'rb') as f:
                    loaded_index = pickle.load(f)
                
                # Convert lists back to numpy arrays
                self.index = {}
                for doc_id, doc_data in loaded_index.items():
                    self.index[doc_id] = {
                        'embedding': np.array(doc_data['embedding']),
                        'text': doc_data['text'],
                        'indexed_at': doc_data.get('indexed_at', 'unknown')
                    }
                
                print(f"Index loaded from {self.cache_path} ({len(self.index)} documents)")
                
                # Load metadata if exists
                if os.path.exists(self.metadata_path):
                    with open(self.metadata_path, 'r') as f:
                        self.metadata = json.load(f)
                    # Convert string keys back to integers
                    self.metadata = {int(k): v for k, v in self.metadata.items()}
                
                return True
            except Exception as e:
                print(f"Error loading index: {e}")
                self.index = {}
                return False
        else:
            print("No existing index found")
            return False
    
    def save_metadata(self):
        """Save metadata to JSON file"""
        try:
            os.makedirs(os.path.dirname(self.metadata_path), exist_ok=True)
            with open(self.metadata_path, 'w') as f:
                json.dump(self.metadata, f, indent=2, default=str)
        except Exception as e:
            print(f"Error saving metadata: {e}")
    
    def clear_index(self):
        """Clear the entire search index"""
        self.index = {}
        self.metadata = {}
        
        # Remove files
        if os.path.exists(self.cache_path):
            os.remove(self.cache_path)
        if os.path.exists(self.metadata_path):
            os.remove(self.metadata_path)
        
        print("Index and metadata cleared")
    
    def rebuild_index(self, documents: List[str], doc_ids: List[int] = None, 
                      metadata: List[Dict] = None):
        """Clear and rebuild the entire index"""
        self.clear_index()
        self.build_index(documents, doc_ids, metadata)

# Singleton instance
semantic_search = SemanticSearchService()