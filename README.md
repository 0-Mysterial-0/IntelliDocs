<div align="center">
  <h1>🚇 KMRL IntelliDocs</h1>
  <p><strong>AI-Powered Intelligent Document Management System</strong></p>
  <p>Kochi Metro Rail Limited (KMRL) Enterprise Solution</p>

  ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)
  ![React](https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178c6?style=flat-square&logo=typescript)
  ![Python](https://img.shields.io/badge/Python-3.12-3776ab?style=flat-square&logo=python)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
  ![Docker](https://img.shields.io/badge/Docker-Compose-2496ed?style=flat-square&logo=docker)
</div>

---

## 🎯 Enterprise Problem Statement

Kochi Metro Rail Limited (KMRL) manages thousands of operational documents across departments daily — safety reports, financial statements, tender documents, maintenance logs, HR policies, and vendor contracts. Traditional manual document management leads to:

- ❌ Document overload and retrieval delays
- ❌ Inconsistent classification and metadata
- ❌ No intelligent search or text extraction capabilities
- ❌ Missed contract expiry deadlines & SLA penalties
- ❌ Manual approval bottlenecks
- ❌ No audit trail or compliance tracking

## ✅ Solution: KMRL IntelliDocs

An enterprise-grade, AI-powered document management platform featuring:

| Feature | Technology |
|---------|-----------|
| 🔍 **OCR Extraction** | EasyOCR (English + Malayalam) |
| 🤖 **AI Classification** | Llama 3 / Gemini 1.5 Flash |
| 📜 **Contract Intelligence** | Automated Expiry Tracking & SLA Alerts |
| 📑 **Duplicate Detection** | Jaccard & Vector Similarity Engine |
| 📝 **Smart Summarization** | RAG + Llama 3 / Gemini |
| 🔎 **Semantic & Content Search** | ChromaDB + Sentence Transformers |
| 💬 **AI Chat Assistant** | RAG pipeline + Ollama |
| ✅ **Approval Workflows** | Role-based (Employee → Manager → Admin) |
| 📊 **Analytics Dashboard** | Recharts with real-time data |
| 🔐 **Enterprise Security** | JWT + RBAC + Audit Logs |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│         (Vite · TypeScript · Tailwind · shadcn/ui)      │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────┐
│                  FastAPI Backend                         │
│              (Python 3.12 · SQLAlchemy 2.0)              │
├─────────────┬────────────────┬───────────────────────────┤
│  PostgreSQL │   ChromaDB     │   Ollama + Gemini          │
│  (Primary   │   (Vector      │   (LLM + Embeddings)       │
│   Database) │    Search)     │                            │
├─────────────┴────────────────┴───────────────────────────┤
│          MinIO (S3-compatible File Storage)               │
│          Redis (Caching + Rate Limiting)                  │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (required)
- [Git](https://git-scm.com/)

### 1. Start All Services

```bash
# Start containers
docker compose up -d

# Check status
docker compose ps
```

### 2. Initialize Database & Seed Data

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.db.seed
```

### 3. Access the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| 🌐 **Frontend Web App** | http://localhost:5173 | 1-Click Demo Buttons on Login |
| 📚 **API Docs** | http://localhost:8000/docs | — |
| 🗄️ **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin123 |
| 🔴 **ChromaDB** | http://localhost:8001 | — |

---

## 🤖 AI Features

### Dual AI Backend

KMRL IntelliDocs uses a **dual AI strategy**:

1. **Primary: Ollama (Llama 3)** — Runs locally, no data leaves the organization
2. **Fallback: Google Gemini API** — Used when local LLM is unconfigured or offline

### AI Pipeline (triggered on upload)

```
Upload → OCR (EasyOCR) → Text Extraction → Classification → Summarization → Vector Embedding (ChromaDB) → Duplicate Check
```

---

## 🔐 Security

- JWT Authentication with refresh tokens
- Role-Based Access Control (Admin / Manager / Employee)
- Bcrypt password hashing
- Full audit logging & CORS protection

---

## 🏢 Organization

Built for **Kochi Metro Rail Limited (KMRL)**.

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.
