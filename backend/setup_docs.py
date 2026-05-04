# setup_docs.py
import os

# Create directory structure
dirs = [
    "data/documents/syllabus",
    "data/documents/notes",
    "data/documents/question_papers",
    "data/documents/lab_manuals"
]
for d in dirs:
    os.makedirs(d, exist_ok=True)
    print(f"Created: {d}")

# Create sample academic documents
samples = {
    "data/documents/syllabus/cs301_dsa.txt": """CS301 - Data Structures and Algorithms Syllabus
Semester 3, Computer Science Department

Unit 1: Introduction to Data Structures (2 weeks)
- Definition and classification of data structures
- Abstract Data Types (ADTs)
- Time and Space complexity analysis
- Big O, Omega, Theta notations

Unit 2: Arrays and Linked Lists (3 weeks)
- One-dimensional and multi-dimensional arrays
- Singly linked lists - insertion, deletion, traversal
- Doubly linked lists
- Circular linked lists
- Comparison of arrays vs linked lists

Unit 3: Stacks and Queues (2 weeks)
- Stack operations (push, pop, peek)
- Applications: Expression evaluation, Parenthesis matching
- Queue operations (enqueue, dequeue)
- Circular Queue, Priority Queue
- Applications: BFS, Job scheduling

Unit 4: Trees (3 weeks)
- Binary Trees - properties and types
- Binary Search Trees (BST)
- Tree traversals (Inorder, Preorder, Postorder)
- AVL Trees and balancing
- Heap data structure

Unit 5: Graphs (2 weeks)
- Graph representation (Adjacency Matrix, List)
- BFS and DFS traversal
- Shortest path algorithms
- Minimum Spanning Tree

Textbook: "Data Structures and Algorithms in Python" by Goodrich
Exam: 30% Internal + 70% End Semester""",

    "data/documents/notes/algorithms_notes.txt": """Algorithm Analysis and Design - Key Concepts

1. TIME COMPLEXITY
Time complexity measures how long an algorithm takes to run as input size grows.
Common complexities:
- O(1): Constant time (array access)
- O(log n): Logarithmic (binary search)
- O(n): Linear (linear search)
- O(n log n): Linearithmic (merge sort, quick sort)
- O(n^2): Quadratic (bubble sort)
- O(2^n): Exponential (recursive fibonacci)

2. SORTING ALGORITHMS
Quick Sort: Divide and conquer, average O(n log n)
- Picks a pivot element
- Partitions array around pivot
- Recursively sorts sub-arrays

Merge Sort: Divide and conquer, stable O(n log n)
- Divides array into halves
- Recursively sorts halves
- Merges sorted halves

3. SEARCHING ALGORITHMS
Linear Search: O(n), works on unsorted arrays
Binary Search: O(log n), requires sorted array

4. RECURSION
- Function calls itself
- Base case to stop recursion
- Used in tree traversals, divide and conquer algorithms""",

    "data/documents/question_papers/cs301_sample.txt": """CS301 - Data Structures - Sample Questions

2 MARK QUESTIONS:
1. Define Abstract Data Type (ADT)
2. What is time complexity? Give an example
3. Differentiate between stack and queue
4. What is a binary search tree?
5. Define graph and its types

5 MARK QUESTIONS:
1. Explain the different types of linked lists with diagrams
2. Write an algorithm for binary search and analyze its complexity
3. Explain stack operations with an example of expression evaluation
4. Describe BFS traversal with an example graph

10 MARK QUESTIONS:
1. Explain the various tree traversals with examples
2. Write detailed notes on sorting algorithms
3. Discuss graph representation methods and shortest path algorithms"""
}

for filepath, content in samples.items():
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created sample: {filepath}")

print("\nDone! Add your PDFs, PPTs, Word files to these folders.")
print("Then run: python ingest_all.py")