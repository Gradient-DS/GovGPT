_internal_
_research_ 
# LibreChat Setup Guide

This repository contains [LibreChat](https://librechat.ai), an open-source AI chat interface that supports multiple AI providers including OpenAI, Anthropic, Google, and many others.

## Quick Start with Docker (Recommended)

### Prerequisites

1. **Install Docker**
   - **Windows**: Download [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
   - **macOS**: Download [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
   - **Linux**: Install using your package manager:
     ```bash
     # Ubuntu/Debian
     curl -fsSL https://get.docker.com -o get-docker.sh
     sudo sh get-docker.sh
     
     # Or follow the official guide: https://docs.docker.com/engine/install/
     ```

2. **Verify Docker Installation**
   ```bash
   docker --version
   docker-compose --version
   ```

### Setup Steps

1. **Clone and navigate to the project**
   ```bash
   git clone -b feat/ref_no_module https://gitlab.com/commonground/haven/ai-coordinatie-nederland/safe-gpt.git
   cd safe-gpt/LibreChat
   ```

2. **Create environment configuration**
   ```bash
   # Copy the example environment file for Docker
   cp .env.example .env
   ```

3. **Configure your API keys**
   
   Edit the `.env` file and add your API keys. At minimum, you need one AI provider:

   **For OpenAI:**
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   **For Anthropic (Claude):**
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

   **For Google (Gemini):**
   ```env
   GOOGLE_KEY=your_google_api_key_here
   ```

   > **Source References:**
   > - Environment configuration: [`LibreChat/.env.example`](LibreChat/.env.example)
   > - Docker compose setup: [`LibreChat/docker-compose.yml`](LibreChat/docker-compose.yml)

4. **Start LibreChat**
   ```bash
   docker compose up --build
   ```

5. **Access the application**
   
   Once the containers are running, open your browser and navigate to:
   ```
   http://localhost:3080
   ```

### Getting API Keys

- **OpenAI**: Visit [platform.openai.com](https://platform.openai.com/api-keys) and create an API key
- **Anthropic**: Visit [console.anthropic.com](https://console.anthropic.com/) and create an API key  
- **Google**: Visit [aistudio.google.com](https://aistudio.google.com/) for Gemini API key

## RAG API (Retrieval-Augmented Generation)

LibreChat includes a RAG API service that enables document-based conversations and knowledge retrieval. The RAG API allows you to upload documents and have conversations that reference those documents.

### Included in Docker Setup

The RAG API is **automatically included** when you run the Docker Compose setup. It includes:

- **RAG API Service**: Handles document processing and retrieval
- **Vector Database**: PostgreSQL with pgvector for storing document embeddings
- **Automatic Integration**: Works seamlessly with the main LibreChat interface

No additional setup is required - it's ready to use once you start the Docker containers!

### Running RAG API Separately

If you want to run the RAG API as a standalone container, you can use:

```bash
# Start the vector database first
docker run -d \
  --name vectordb \
  -e POSTGRES_DB=mydatabase \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -v pgdata:/var/lib/postgresql/data \
  ankane/pgvector:latest

# Start the RAG API
docker run -d \
  --name rag_api \
  -p 8000:8000 \
  -e DB_HOST=vectordb \
  -e RAG_PORT=8000 \
  --link vectordb \
  ghcr.io/danny-avila/librechat-rag-api-dev-lite:latest
```

### RAG API Configuration

You can configure the RAG API port in your `.env` file:

```env
# RAG API Configuration
RAG_PORT=8000
RAG_API_URL=http://localhost:8000  # For local development
# RAG_API_URL=http://rag_api:8000  # For Docker Compose (automatic)
```

> **Source Reference:** RAG API configuration in [`LibreChat/docker-compose.yml:55-67`](LibreChat/docker-compose.yml)

## Environment File Strategy

This setup uses separate environment files for different deployment methods:

- **`.env`** - Used by Docker Compose (contains Docker-specific hostnames like `mongodb`, `meilisearch`)
- **`.env.local`** - Used for local development (contains localhost addresses for local services)

This separation prevents configuration conflicts between Docker and local development environments.

## Local Development Setup (Without Docker)

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **MeiliSearch** (optional, for search functionality) - [Download](https://www.meilisearch.com/docs/learn/getting_started/installation)

### Setup Steps

1. **Install dependencies**
   ```bash
   cd LibreChat
   npm install
   ```

   > **Source Reference:** Root package.json manages workspaces for [`api`](LibreChat/api/), [`client`](LibreChat/client/), and [`packages/*`](LibreChat/packages/) - see [`LibreChat/package.json:6-9`](LibreChat/package.json)

2. **Start MongoDB**
   ```bash
   # If installed locally
   mongod
   
   # Or using Docker
   docker run -d --name mongodb -p 27017:27017 mongo
   ```

3. **Start MeiliSearch (optional)**
   ```bash
   # If installed locally
   meilisearch
   
   # Or using Docker
   docker run -d --name meilisearch -p 7700:7700 getmeili/meilisearch:latest
   ```

4. **Configure environment for local development**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and configure for local development:
   ```env
   # Server Configuration
   HOST=localhost
   PORT=3080
   
   # Database (local MongoDB)
   MONGO_URI=mongodb://127.0.0.1:27017/LibreChat
   
   # Search (local MeiliSearch)
   MEILI_HOST=http://127.0.0.1:7700
   MEILI_MASTER_KEY=your_master_key_here
   
   # Domains for local development
   DOMAIN_CLIENT=http://localhost:3080
   DOMAIN_SERVER=http://localhost:3080
   
   # Your API keys
   OPENAI_API_KEY=your_openai_api_key_here
   # or
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   # or
   GOOGLE_KEY=your_google_api_key_here
   ```

   > **Note:** We use `.env.local` for local development to avoid conflicts with the `.env` file used by Docker Compose.

5. **Build the project**
   ```bash
   # Build data provider and API packages
   npm run build:data-provider
   npm run build:data-schemas
   npm run build:api
   
   # Build frontend
   npm run frontend
   ```

   > **Source References:**
   > - Build scripts: [`LibreChat/package.json:31-35`](LibreChat/package.json)
   > - API dependencies: [`LibreChat/api/package.json`](LibreChat/api/package.json)
   > - Client dependencies: [`LibreChat/client/package.json`](LibreChat/client/package.json)

6. **Start the backend server**
   ```bash
   # Load the local environment file
   cp .env.local .env
   npm run backend:dev
   ```

   > **Source Reference:** Backend start script: [`LibreChat/package.json:33`](LibreChat/package.json)
   
   > **Note:** We temporarily copy `.env.local` to `.env` since the backend expects `.env` by default.

7. **Start the frontend development server** (in a new terminal)
   ```bash
   npm run frontend:dev
   ```

   > **Source Reference:** Frontend dev script: [`LibreChat/package.json:38`](LibreChat/package.json)

8. **Access the application**
   
   The application will be available at:
   ```
   http://localhost:3090
   ```

## Project Structure

```
LibreChat/
├── api/              # Backend API server
├── client/           # React frontend application  
├── packages/         # Shared packages
│   ├── data-provider/   # Data access layer
│   ├── data-schemas/    # TypeScript schemas
│   └── api/            # API package
├── config/           # Configuration utilities
├── docker-compose.yml # Docker composition
├── .env.example      # Environment template
└── librechat.yaml    # Main configuration file
```

> **Source References:**
> - Project structure visible in repository root
> - Workspaces defined in [`LibreChat/package.json:6-9`](LibreChat/package.json)

## Configuration

### Supported AI Providers

LibreChat supports numerous AI providers out of the box:

- **OpenAI** (GPT-4, GPT-3.5, DALL-E)
- **Anthropic** (Claude models)
- **Google** (Gemini, PaLM)
- **Azure OpenAI**
- **AWS Bedrock**
- **Local models** via Ollama
- **Custom endpoints** (any OpenAI-compatible API)

> **Source Reference:** Available endpoints configuration: [`LibreChat/.env.example:45`](LibreChat/.env.example)


## License

This project is licensed under the ISC License - see the [LICENSE](LibreChat/LICENSE) file for details.