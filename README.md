# Industrial-Knowledge-Platform

The **Industrial Knowledge Platform** is a powerful Retrieval-Augmented Generation (RAG) based document intelligence system. It allows users to upload PDF documents, automatically processes and indexes them using a multi-stage NLP pipeline, and provides semantic search and chat-based Q&A capabilities over the uploaded knowledge base.

## Features

* **Document Processing:** Robust PDF parsing using Docling and PyMuPDF, with fallback mechanisms.
* **Element Extraction:** Automatically detects and extracts tables, figures, images, and text chunks from documents.
* **Vector Search & Chat:** Uses ChromaDB for vector storage and Groq LLMs (via LangChain) for highly accurate semantic search and conversational Q&A.
* **Smart Deduplication:** Hashes and checks documents upon upload to prevent redundant processing.
* **Interactive Dashboard:** View storage usage, recent activity, and document statistics.
* **Modern UI/UX:** Built with React, Tailwind CSS, and shadcn/ui for a seamless user experience.

## Technology Stack

### Backend
* **Framework:** FastAPI (Python)
* **PDF Parsing:** Docling, PyMuPDF
* **OCR:** PaddleOCR
* **Vector Database:** ChromaDB
* **LLM & Embeddings:** Groq, SentenceTransformers, LangChain

### Frontend
* **Framework:** React 19 + TypeScript + Vite
* **State Management:** React Query (TanStack)
* **Styling:** Tailwind CSS + shadcn/ui

## Getting Started

### Prerequisites
* Node.js (v18+)
* Python (3.10+)
* A Groq API Key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended).
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your `.env` file with your Groq API key:
   ```env
   GROQ_API_KEY=your_api_key_here
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn app:app --reload --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`.

## Architecture Overview

The platform uses a robust multi-stage pipeline to handle documents:

1. **Upload & Queue:** Files are uploaded, validated, checked for duplicates, and queued.
2. **Extraction & Chunking:** Text and elements (tables/figures) are extracted and chunked semantically.
3. **Embedding & Indexing:** Chunks are embedded and upserted into ChromaDB.
4. **Chat & Search:** The frontend queries the FastAPI endpoints, which retrieves context from ChromaDB and generates responses using the LLM.

For a deeper dive into the system's architecture, please refer to [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
