

> **Saaransh** (सारांश) - meaning "summary" in Hindi - is an intelligent e-consultation platform that enables citizens to comment on government bills and provides administrators with AI-powered analytics and insights.

## 🎯 Overview

Saaransh revolutionizes public policy consultation by combining civic engagement with cutting-edge Natural Language Processing. The platform automatically analyzes citizen comments using **custom-trained ensemble AI models**, generating sentiment analysis and hierarchical summaries to help policymakers understand public opinion at scale.

## 📸 Screenshots

<div align="center">

### User Panel - Comment Submission
<img src="photos/user.png" alt="User Panel Interface" width="800"/>

*Citizens can submit detailed comments on bills with section-wise targeting and document uploads*

---

### Admin Dashboard - Analytics Overview
<img src="photos/rolebased.jpeg" alt="Admin Dashboard" width="800"/>

*Real-time sentiment analysis and stakeholder breakdown across all consultations*

---

### AI-Powered Summaries
<img src="photos/summary.jpeg" alt="AI Generated Summaries" width="800"/>

*Hierarchical summarization with overall, positive, and negative insights*

---

### Minister Dashboard - Executive View
<img src="photos/minister.jpeg" alt="Minister Dashboard" width="800"/>

*Executive-level insights with sentiment trends and top comments*

</div>

## 🏆 Key Achievement

### State-of-the-Art Sentiment Analysis

Our **ensemble modeling approach with advanced preprocessing** achieved **72% accuracy**, surpassing the baseline research paper we referenced. This was accomplished through:

- ✅ **Custom Dataset**: Trained on domain-specific legal/policy consultation data
- ✅ **Ensemble Architecture**: Majority voting across 3 fine-tuned transformer models
- ✅ **Advanced Preprocessing**: Multi-stage pipeline including Hinglish translation, domain noise removal, and linguistic normalization
- ✅ **Production Optimization**: Model caching, graceful fallbacks, and security validations

## ✨ Features

### 👥 For Citizens (User Panel)

- **📝 Comment Submission**: Submit detailed feedback on government bills and policies
- **📂 Section-Wise Comments**: Target specific sections of legislation
- **🌐 Hinglish Support**: Automatic detection and translation of Hindi-English mixed text
- **📎 Document Upload**: Attach supporting documents to strengthen arguments
- **🔐 Verified Identity**: Secure submission with ID verification options

### 👨‍💼 For Administrators (Admin Panel)

- **📊 Real-Time Analytics Dashboard**
  - Sentiment distribution across all consultations
  - Stakeholder type breakdown (Individual, NGO, Corporate, etc.)
  - Submission trends and engagement metrics
  
- **🤖 AI-Powered Summaries**
  - **Overall Summary**: Comprehensive view of all comments
  - **Positive/Negative Summaries**: Separate insights for each sentiment
  - **Section-Wise Analysis**: Granular summaries for each bill section
  - **Hierarchical Summarization**: Chunk-based processing for large volumes

- **☁️ Word Cloud Generation**: Visual representation of key themes and topics

- **📈 Stakeholder Analytics**: Understand who is engaging with each consultation

- **📤 Export Reports**: Download analytics and summaries for offline analysis

### 🎖️ For Ministers (Executive Dashboard)

- **🔍 Executive Summary**: High-level overview across all consultations
- **📉 Sentiment Trends**: Dominant sentiment identification with percentages
- **🏅 Top Comments**: Highest confidence/impact submissions surfaced automatically
- **📋 Consultation Status**: Active vs. completed consultations at a glance

## 🧠 AI Models & Technology

### 1. Sentiment Analysis - Ensemble Model

**Architecture**: Majority voting ensemble of 3 fine-tuned transformers

#### Models
- **XLM-RoBERTa** (`xlm-roberta-base`) - Multilingual understanding
- **RoBERTa** (`roberta-base`) - Robust English comprehension
- **DistilBERT** (`distilbert-base-uncased`) - Efficient inference

#### Prediction Logic
```python
# Ensemble voting for robust predictions
votes = [xlm_roberta_pred, roberta_pred, distilbert_pred]
final_sentiment = mode(votes)  # Majority wins
```

#### Output Classes
- **Positive** 😊
- **Neutral** 😐
- **Negative** 😞

#### Advanced Preprocessing Pipeline

**Stage 1: Text Normalization**
- Emoji interpretation (😊 → "happy", 😡 → "angry")
- URL and mention removal
- HTML tag cleaning
- Special character filtering
- Whitespace normalization

**Stage 2: Linguistic Processing**
- Hinglish detection and translation (using `facebook/nllb-200-distilled-600M`)
- Domain-specific noise word removal (67 custom terms)
- Slang expansion ("lol" → "funny", "imo" → "in my opinion")
- Stopword removal
- Lemmatization (WordNet)
- Stemming (Porter Stemmer)

**Stage 3: Security Validation**
- Input length limits (max 3000 characters)
- Jailbreak pattern detection
- Output validation (whitelist-based)

### 2. Text Summarization - BART Model

**Model**: `facebook/bart-large-cnn` (fine-tuned on custom dataset)

#### Capabilities

**Individual Comment Summarization**
- Dynamic length adjustment (15-80 tokens)
- Context-aware compression

**Group Summarization** (Hierarchical)
1. **Chunk Processing**: Split into groups of 50 comments
2. **Intermediate Summaries**: Generate summary per chunk (30-200 tokens)
3. **Final Aggregation**: Combine into executive summary (40-150 tokens)

### 3. WordCloud Visualization

- Customizable dimensions and color schemes
- Frequency-based word sizing
- API-secured generation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  User Panel  │  │ Admin Panel  │  │   Minister   │      │
│  │ React + TS   │  │ React + TS   │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services Layer                    │
│  ┌──────────────┐                    ┌──────────────┐       │
│  │ User Backend │                    │Admin Backend │       │
│  │   Express    │                    │   Express    │       │
│  │  Port 5046   │                    │  Port 5000   │       │
│  └──────────────┘                    └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      AI Services Layer                       │
│  ┌────────────────────────────────────────────────────┐     │
│  │         FastAPI AI Service (Port 8364)             │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │     │
│  │  │  Sentiment   │  │ Summarization│  │WordCloud│ │     │
│  │  │   Ensemble   │  │  BART Model  │  │   API   │ │     │
│  │  └──────────────┘  └──────────────┘  └─────────┘ │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│              PostgreSQL (Neon Cloud Database)                │
│         ┌──────────────┐  ┌──────────────────────┐          │
│         │  documents   │  │  bill_X_comments     │          │
│         │   (bills)    │  │  (submissions)       │          │
│         └──────────────┘  └──────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon Cloud)
- **Database Client**: pg (node-postgres)

### AI/ML Services
- **Framework**: FastAPI
- **Deep Learning**: PyTorch
- **NLP Library**: Hugging Face Transformers
- **Preprocessing**: NLTK, emoji, regex
- **Visualization**: matplotlib, wordcloud

### Models
- **Sentiment**: XLM-RoBERTa, RoBERTa, DistilBERT (ensemble)
- **Summarization**: BART-Large-CNN
- **Translation**: NLLB-200-Distilled-600M

## 📊 Database Schema

### `documents` Table
Stores bill metadata and AI-generated summaries

```sql
- document_id (PK)
- title, description
- publish_date, end_date, status
- summary (overall)
- positive_summary, negative_summary
- section_1_summary, section_2_summary, section_3_summary
- section1_positive, section1_negative
- section2_positive, section2_negative
- section3_positive, section3_negative
```

### `bill_X_comments` Tables
Individual comment submissions with AI enrichment

```sql
- comments_id (PK)
- document_id (FK)
- section
- commenter_name, commenter_email, commenter_phone
- stakeholder_type
- comment_data (original text)
- sentiment (AI-predicted)
- summary (AI-generated)
- confidence_score
- supported_doc, supported_doc_filename
- created_at
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- Python 3.9+
- PostgreSQL database
- CUDA-compatible GPU (recommended for AI services)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/saaransh.git
cd saaransh
```

#### 2. Setup User Panel
```bash
cd UserPanel/Frontend-2
npm install
cp .env.sample .env
# Configure environment variables
npm run dev

# In another terminal
cd UserPanel/Backend-2
npm install
cp .env.sample .env
# Configure DATABASE_URL
npm run dev
```

#### 3. Setup Admin Panel
```bash
cd AdminPanel/Frontend
npm install
cp .env.sample .env
npm run dev

# In another terminal
cd AdminPanel/Backend
npm install
cp .env.sample .env
# Configure DATABASE_URL
npm run dev
```

#### 4. Setup AI Services
```bash
cd econsult_api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Download NLTK data
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"

# Start FastAPI service
uvicorn app:app --host 0.0.0.0 --port 8364 --reload
```

#### 5. Setup WordCloud API
```bash
# In project root
pip install fastapi uvicorn wordcloud matplotlib pillow
uvicorn wordcloud_api:app --host 0.0.0.0 --port 8365 --reload
```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:5432/database
PORT=5000
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

#### AI Service
```env
# Configured in app.py
MODEL_DIR=./models
DEVICE=cuda  # or cpu
```

## 📖 API Documentation

### Admin Backend Endpoints

#### Comments
- `GET /api/comments/:bill` - Fetch comments for a bill
- `POST /api/comments/:bill` - Add new comment
- `POST /api/submit-comment` - Unified submission endpoint

#### Analytics
- `GET /api/sentiment/:bill` - Sentiment distribution
- `GET /api/summaries/:bill` - Overall/positive/negative summaries
- `GET /api/sections/:bill` - Section-wise summaries
- `GET /api/section-sentiments/:bill` - Section sentiment breakdowns

#### Consultations
- `GET /api/consultations` - List all consultations with metadata
- `GET /api/recent-activity` - Recent comments across all bills

#### AI Generation
- `POST /api/generate-overview/:bill` - Generate summaries (overall/positive/negative/section-wise)

#### Minister Dashboard
- `GET /api/minister/dashboard-summary` - Executive overview
- `GET /api/minister/top-comments` - Highest confidence comments
- `GET /api/minister/consultation/:bill` - Bill-specific summary

### AI Service Endpoints

#### Sentiment Analysis
```bash
POST http://localhost:8364/predict_sentiment
Content-Type: application/json

{
  "comment": "This bill will greatly benefit small businesses."
}

Response:
{
  "comment": "This bill will greatly benefit small businesses.",
  "preprocessed_text": "bill greatli benefit small busi",
  "predicted_sentiment": "POSITIVE"
}
```

#### Summarization
```bash
POST http://localhost:8364/api/summarize
Content-Type: application/json

{
  "comments": [
    "Long comment text here...",
    "Another detailed comment..."
  ]
}

Response:
{
  "cleaned": ["cleaned text 1", "cleaned text 2"],
  "summaries": ["summary 1", "summary 2"]
}
```

#### Group Summarization
```bash
POST http://localhost:8364/api/summarize_group
Content-Type: application/json

{
  "comments": ["comment1", "comment2", ..., "comment100"]
}

Response:
{
  "cleaned_comments": [...],
  "chunk_summaries": ["chunk1 summary", "chunk2 summary"],
  "final_summary": "Overall aggregated summary"
}
```

## 🔒 Security Features

- ✅ Input validation (length limits, pattern matching)
- ✅ Jailbreak attempt detection
- ✅ SQL injection prevention (parameterized queries)
- ✅ Output validation (sentiment label whitelisting)
- ✅ CORS configuration
- ✅ API key authentication (WordCloud service)

## 📈 Performance

- **Sentiment Analysis**: ~200ms per comment (GPU), ~800ms (CPU)
- **Summarization**: ~500ms per comment (GPU), ~2s (CPU)
- **Group Summary**: ~3-5s for 100 comments (GPU)
- **Database Queries**: <50ms (indexed)

## 🎓 Research & Training

### Dataset
- **Source**: Custom-collected legal/policy consultation comments
- **Size**: [Specify your dataset size]
- **Preprocessing**: Multi-stage pipeline with domain-specific optimizations
- **Annotation**: [Specify annotation methodology]

### Training Details
- **Sentiment Models**: Fine-tuned on custom dataset using Hugging Face Trainer
- **Summarization Model**: Fine-tuned BART-Large-CNN on legal text
- **Validation**: Cross-validation with stratified splits
- **Metrics**: Accuracy, F1-score, ROUGE scores

### Benchmark Results
| Model | Accuracy | F1-Score |
|-------|----------|----------|
| Baseline (Research Paper) | ~65% | - |
| **Our Ensemble** | **72%** | **0.71** |

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**SYNTAX_SAVANTS** - Team ID: 111498

This project was built during the **Smart India Hackathon (SIH) 2024 Grand Finale** under the guidance of the **Ministry of Corporate Affairs**.

### Team Members

- **Tishya Jha** - Custom dataset creation & presentation, Deployment of Final Expert Sentiment Model and Summarisation and WordCloud models via FastAPI
- **Yuvraj Singh** - FastAPI integration & full-stack development
- **Aarna Kumar** - Training and Development of ML Models
- **Ishaan Saxena** - UI/UX design & frontend development
- **Abhay Raj** - Backend development
- **Ritik Lodhi** - Frontend & backend support

## 🙏 Acknowledgments

- Research paper that served as baseline for sentiment analysis
- Hugging Face for transformer models and libraries
- Open-source community for tools and frameworks

## 📧 Contact

For questions or support, please open an issue or contact the team.

---

<div align="center">
  <strong>Built for better governance and civic engagement</strong>
  <br>
  <sub>Empowering citizens, informing policymakers</sub>
</div>

# 🏛️ Saaransh - AI-Powered Public Consultation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
