# 🎓 AcadAssist - AI-Powered Academic Assistant

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Python](https://img.shields.io/badge/python-3.11-green)
![React](https://img.shields.io/badge/react-18.2-61DAFB)
![FastAPI](https://img.shields.io/badge/fastapi-0.104-009688)
![License](https://img.shields.io/badge/license-MIT-orange)

**Your Personal AI Tutor for Academic Excellence**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture)

</div>

---

## 📖 Overview

AcadAssist is an intelligent academic platform that revolutionizes how students access and interact with educational content. Powered by **Qwen 2.5 LLM** with **Retrieval-Augmented Generation (RAG)**, it provides instant, accurate answers from your actual course materials.

### 🎯 Problem Statement
Students struggle with fragmented access to academic information - syllabi, notes, question papers, and lab schedules are scattered across different sources. This leads to inefficient study planning and difficulty in retrieving relevant materials.

### 💡 Solution
A centralized AI-powered platform that:
- 🤖 Answers academic queries using advanced LLM
- 📚 Retrieves information directly from uploaded course documents
- 📝 Auto-generates practice questions from study materials
- 💬 Enables peer-to-peer learning through discussion forums
- 📊 Tracks study progress with analytics and achievements

---

## ✨ Features

### 🤖 AI Academic Chatbot
- Powered by **Qwen 2.5 (1.5B parameters)** with GGUF quantization
- Context-aware responses using RAG from your documents
- Supports detailed explanations, comparisons, and step-by-step guides
- Adaptive response length based on question type

### 📚 Smart Document Management
- Upload PDFs, Word documents, PowerPoints, and text files
- Automatic text extraction and indexing
- Category-based organization (Syllabus, Notes, Question Papers, Lab Manuals)
- User-specific document storage and retrieval

### 📝 Intelligent Question Generator
- Generate practice questions from any study material
- Multiple question types: Descriptive and MCQ
- Difficulty levels: Easy, Medium, Hard
- Answers generated using Qwen LLM for accuracy

### 💬 Live Discussion Forum
- Topic-based discussion rooms
- Real-time messaging interface
- Pre-built rooms for common subjects
- Collaborative learning environment

### ⏱️ Study Room with Pomodoro Timer
- Focus sessions with customizable duration
- Focus music options (Rain, Lo-fi, Nature, White Noise)
- Session tracking and statistics

### 🏆 Gamification & Achievements
- Study streak tracking
- Achievement badges for milestones
- Progress visualization

### 📊 Learning Analytics
- Weekly study hour tracking
- Subject-wise performance charts
- Question accuracy metrics
- Personalized recommendations

### 🎨 Modern UI/UX
- Dark/Light mode support
- Responsive design for all devices
- Smooth animations with Framer Motion
- Intuitive navigation with sidebar

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI Framework |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| React Router | Navigation |
| Recharts | Charts & Analytics |
| React Icons | Icon Library |
| Axios | HTTP Client |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | API Framework |
| SQLAlchemy | ORM |
| SQLite | Database |
| JWT | Authentication |
| PyPDF2 | PDF Processing |
| python-docx | Word Processing |
| python-pptx | PowerPoint Processing |

### AI/ML Models
| Model | Purpose | Size |
|-------|---------|------|
| Qwen 2.5 1.5B | Primary LLM (GGUF Q4_K_M) | ~1 GB |
| TF-IDF Vectorizer | Document Retrieval | - |
| CNN Model | Content Classification | - |
| RandomForest | Keyword Extraction | - |

### RAG Pipeline
```
User Query → TF-IDF Retrieval → Cosine Similarity → Top-K Documents → Qwen LLM → Answer
```

---

## 📁 Project Structure

```
AcadAssist/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # API endpoints
│   │   │   ├── auth.py       # Authentication
│   │   │   ├── chatbot.py    # AI Chatbot
│   │   │   ├── resources.py  # Document management
│   │   │   ├── questions.py  # Question generator
│   │   │   ├── live_chat.py  # Discussion forum
│   │   │   └── upload.py     # File upload
│   │   ├── core/             # Core utilities
│   │   │   ├── config.py     # Configuration
│   │   │   ├── security.py   # JWT & auth
│   │   │   └── database.py   # Database setup
│   │   ├── models/           # Database models
│   │   ├── ml_models/        # AI/ML models
│   │   │   ├── qwen_model.py # Qwen LLM wrapper
│   │   │   ├── cnn_model.py  # CNN classifier
│   │   │   └── ensemble_model.py
│   │   └── services/         # Business logic
│   │       ├── rag_service.py     # RAG pipeline
│   │       ├── document_loader.py # File processing
│   │       └── semantic_search.py
│   ├── data/                 # Data storage
│   │   ├── documents/        # Uploaded files
│   │   ├── models/           # AI model files
│   │   └── chroma_db/        # Vector database
│   └── run.py               # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   ├── services/         # API & WebSocket
│   │   └── utils/            # Helpers & constants
│   └── package.json
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- **Python 3.11+** 
- **Node.js 18+**
- **Git**
- **8GB RAM** (for LLM model)

### Step 1: Clone Repository
```bash
git clone https://github.com/Vaibhavakanna-P/AcadAssist.git
cd AcadAssist
```

### Step 2: Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download Qwen model (~1GB)
python download_qwen.py

# Seed RAG with sample documents
python seed_rag_data.py

# Start backend
python run.py
```

### Step 3: Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Step 4: Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs

---

## 🎯 Usage Guide

### For Students

**1. Register/Login**
- Create account with college email
- Complete profile with department and year

**2. Upload Study Materials**
- Navigate to Resources page
- Upload PDFs, notes, syllabi
- Organize by category

**3. Ask AI Questions**
- Use the AI Chatbot for instant answers
- AI references your uploaded documents
- Get detailed explanations with examples

**4. Generate Practice Questions**
- Paste study material or upload documents
- Generate descriptive or MCQ questions
- Use for exam preparation

**5. Join Discussions**
- Participate in topic-based rooms
- Collaborate with peers
- Share knowledge and resources

**6. Track Progress**
- View learning analytics
- Maintain study streaks
- Earn achievements

### For Teachers/Faculty

**1. Upload Course Materials**
- Share syllabi, notes, question papers
- Organize by subject and semester

**2. Monitor Student Progress**
- View class analytics
- Identify struggling students
- Provide targeted support

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Chatbot  │ │Resources │ │Questions │ │Discussions│  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       │             │           │             │         │
│       └─────────────┴───────────┴─────────────┘         │
│                        │ HTTP/WS                        │
└────────────────────────┼────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│                  Backend (FastAPI)                       │
│  ┌─────────────────────┼─────────────────────────────┐  │
│  │              API Routes                            │  │
│  │  /api/auth /api/chatbot /api/resources /api/questions│
│  └─────────────────────┼─────────────────────────────┘  │
│                        │                                 │
│  ┌─────────────────────┼─────────────────────────────┐  │
│  │              Services Layer                         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │  │
│  │  │RAG Service│ │LLM Service│ │Question Generator│   │  │
│  │  └─────┬────┘ └─────┬────┘ └────────┬─────────┘   │  │
│  └────────┼────────────┼───────────────┼──────────────┘  │
│           │            │               │                  │
│  ┌────────┼────────────┼───────────────┼──────────────┐  │
│  │   ML Models Layer   │               │              │  │
│  │  ┌────┴─────┐ ┌─────┴──────┐ ┌─────┴──────┐       │  │
│  │  │Qwen 2.5  │ │ Embeddings │ │ CNN / RF   │       │  │
│  │  │   LLM    │ │   (BGE)    │ │ Classifiers│       │  │
│  │  └──────────┘ └────────────┘ └────────────┘       │  │
│  └────────────────────────────────────────────────────┘  │
│                        │                                 │
│  ┌─────────────────────┼─────────────────────────────┐  │
│  │              Data Layer                             │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │  │
│  │  │ SQLite   │ │ ChromaDB │ │  File System     │   │  │
│  │  │ (Users)  │ │ (Vectors)│ │  (Documents)     │   │  │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Model Size | 1.5B parameters (Q4_K_M quantized) |
| Response Time | 10-30 seconds (CPU) / 2-5 seconds (GPU) |
| Max Context | 8192 tokens |
| Max Response | 2048 tokens |
| RAM Usage | ~2-3 GB |
| Disk Space | ~2 GB (including model) |

---

## 🔮 Future Roadmap

- [ ] **Multi-language Support** - Hindi, Tamil, Telugu
- [ ] **Voice Input/Output** - Speech-to-text and text-to-speech
- [ ] **Mobile App** - React Native for iOS/Android
- [ ] **Video Lecture Analysis** - Summarize recorded lectures
- [ ] **Personalized Learning Paths** - Adaptive study plans
- [ ] **Integration with LMS** - Moodle, Canvas, Google Classroom
- [ ] **Offline Mode** - Local model inference without internet
- [ ] **Advanced RAG** - Hybrid search with BM25 + embeddings
- [ ] **Fine-tuned Models** - Domain-specific academic models
- [ ] **Real-time Collaboration** - Shared study spaces

---



---

## 📜 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Qwen Team** at Alibaba Cloud for the Qwen 2.5 model
- **HuggingFace** for transformer models and tools
- **FastAPI** for the excellent web framework
- **React** community for the UI library

---

<div align="center">



</div>
