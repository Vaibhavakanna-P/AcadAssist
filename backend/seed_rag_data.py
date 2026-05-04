# backend/seed_rag_data.py
"""Add initial academic content to RAG database"""
import sys
sys.path.insert(0, '.')
from app.services.rag_service import rag_service

# Academic knowledge base
academic_content = [
    # Data Structures
    """Data structures are specialized formats for organizing, processing, retrieving and storing data. 
    Common types include arrays, linked lists, stacks, queues, trees, graphs, and hash tables. 
    Arrays store elements in contiguous memory locations with O(1) access time. 
    Linked lists use nodes with pointers, allowing dynamic size but O(n) access time. 
    Stacks follow LIFO (Last In First Out) principle, used in function calls and undo operations. 
    Queues follow FIFO (First In First Out), used in scheduling and BFS algorithms.""",
    
    """Trees are hierarchical data structures with a root node and child nodes. 
    Binary trees have at most 2 children per node. Binary Search Trees maintain sorted order. 
    AVL trees and Red-Black trees are self-balancing BSTs ensuring O(log n) operations. 
    B-trees are used in databases and file systems. Tries are used for efficient string operations.""",
    
    # Algorithms
    """Algorithms are step-by-step procedures for solving problems or performing tasks. 
    Sorting algorithms include Quick Sort (average O(n log n)), Merge Sort (stable O(n log n)), 
    and Bubble Sort (simple but O(n²)). Searching algorithms include Linear Search (O(n)) 
    and Binary Search (O(log n) on sorted data). Graph algorithms include BFS, DFS, 
    Dijkstra's shortest path, and Kruskal's MST algorithm.""",
    
    # Database Management
    """Database Management Systems (DBMS) are software for creating, managing, and manipulating databases. 
    Key concepts include ACID properties (Atomicity, Consistency, Isolation, Durability), 
    normalization (1NF, 2NF, 3NF, BCNF), and ER diagrams. SQL is the standard query language 
    with commands like SELECT, INSERT, UPDATE, DELETE, JOIN operations, and aggregation functions. 
    Indexing improves query performance while transactions ensure data integrity.""",
    
    # Operating Systems
    """Operating Systems manage computer hardware and software resources. 
    Key functions include process management (scheduling algorithms like FCFS, SJF, Round Robin), 
    memory management (paging, segmentation, virtual memory), file systems (FAT, NTFS, ext4), 
    and I/O management. Deadlock occurs when processes wait for each other indefinitely. 
    Solutions include prevention, avoidance (Banker's algorithm), detection, and recovery.""",
    
    # Computer Networks
    """Computer Networks connect devices to share resources and communicate. 
    The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. 
    TCP/IP is the practical model with 4 layers. Key protocols include HTTP/HTTPS (web), 
    TCP/UDP (transport), IP (routing), DNS (name resolution), and DHCP (address assignment). 
    Network topologies include star, bus, ring, mesh, and hybrid configurations.""",
    
    # Software Engineering
    """Software Engineering is the systematic application of engineering approaches to software development. 
    The Software Development Life Cycle (SDLC) includes requirements, design, implementation, 
    testing, deployment, and maintenance phases. Agile methodologies like Scrum and Kanban 
    emphasize iterative development and customer collaboration. Version control systems like Git 
    track code changes and enable team collaboration.""",
    
    # Study Tips
    """Effective study techniques include active recall (testing yourself), spaced repetition 
    (reviewing at increasing intervals), and the Pomodoro Technique (25-minute focused sessions). 
    Create mind maps for visual learning, use flashcards for memorization, and teach concepts 
    to others to reinforce understanding. Review previous exam papers to familiarize with question patterns. 
    Maintain a consistent study schedule and take regular breaks to avoid burnout.""",
    
    # Exam Preparation
    """Exam preparation strategies include creating a study schedule 3-4 weeks before exams, 
    prioritizing difficult subjects first, and using the 80/20 rule (focus on high-weightage topics). 
    Practice with previous year question papers under timed conditions. Form study groups for 
    collaborative learning and doubt clarification. Get adequate sleep (7-8 hours) before exams 
    and maintain a healthy diet during exam preparation."""
]

# Academic metadata
metadata = [
    {"topic": "data_structures", "subject": "Computer Science", "type": "notes"},
    {"topic": "trees", "subject": "Computer Science", "type": "notes"},
    {"topic": "algorithms", "subject": "Computer Science", "type": "notes"},
    {"topic": "database", "subject": "Computer Science", "type": "notes"},
    {"topic": "operating_systems", "subject": "Computer Science", "type": "notes"},
    {"topic": "networks", "subject": "Computer Science", "type": "notes"},
    {"topic": "software_engineering", "subject": "Computer Science", "type": "notes"},
    {"topic": "study_tips", "subject": "General", "type": "guide"},
    {"topic": "exam_preparation", "subject": "General", "type": "guide"},
]

print("Seeding RAG database with academic content...")
rag_service.add_documents(academic_content, metadata)

# Verify
stats = rag_service.get_stats()
print(f"✅ RAG database ready with {stats['total_documents']} documents!")
print(f"Topics: {', '.join(set(m['topic'] for m in metadata))}")