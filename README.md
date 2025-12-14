## Executive Overview

This service demonstrates how modern AI systems can securely interact with real data and internal tools using the Model Context Protocol (MCP).

It exposes a small set of AI-accessible capabilities — generating embeddings, indexing documents, and performing semantic search — backed by a vector database. An AI agent can use these tools to retrieve relevant information on demand, rather than relying on static training data.

In practical terms, this pattern enables use cases such as:
- internal knowledge assistants
- customer support copilots
- AI-powered search over company documents
- agent workflows that safely access enterprise data

This project mirrors how AI tooling is deployed in production environments where models must interact with real systems in a controlled, auditable way.

# MCP Tooling Lab (Node.js)

This project implements a custom **Model Context Protocol (MCP)** server in Node.js that exposes tools for:

- generating embeddings using OpenAI
- indexing documents into a vector database (Chroma)
- performing semantic vector search with optional metadata filters

The server is designed to be used by MCP-compatible hosts (e.g. Claude Desktop) and demonstrates real-world agent tooling patterns used in modern AI systems.

---

## Why this exists

This lab demonstrates hands-on experience with:

- MCP server implementation
- tool schemas and validation
- embedding pipelines
- vector database integration
- agent-accessible retrieval infrastructure

This mirrors how AI tooling is deployed in customer-facing and forward-deployed engineering contexts.

---

## Tools exposed

### embed_text
Generates OpenAI embeddings for an array of input strings.

**Input**
```json
{
  "texts": ["string", "..."]
}
```

---

### index_documents
Embeds and indexes documents into a Chroma collection.

**Input**
```json
{
  "docs": [
    {
      "id": "doc-id",
      "text": "document text",
      "metadata": { "optional": "metadata" }
    }
  ]
}
```

---

### vector_search
Performs semantic search over indexed documents using embeddings.

**Input**
```json
{
  "query": "search query",
  "topK": 5,
  "where": { "optional": "metadata filter" }
}
```

---

## Tech stack

- Node.js + TypeScript
- OpenAI Embeddings (text-embedding-3-small)
- Chroma vector database
- MCP SDK (@modelcontextprotocol/sdk)
- Zod for schema validation
- Docker (for local Chroma)

---

## Running locally

### 1. Start Chroma
```bash
docker run --rm -p 8000:8000 chromadb/chroma
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Configure environment
Create a `.env` file:

```bash
OPENAI_API_KEY=your_openai_key
CHROMA_URL=http://localhost:8000
CHROMA_COLLECTION=mcp_tooling_lab
OPENAI_EMBED_MODEL=text-embedding-3-small
```

### 4. Run the MCP server
```bash
pnpm dev
```

---

## Using with Claude Desktop (MCP host)

Claude Desktop launches MCP servers in an isolated environment. Required environment variables must be passed explicitly via the config file.

### Example claude_desktop_config.json
```json
{
  "mcpServers": {
    "mcp-tooling-lab": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/dist/server.js"
      ],
      "env": {
        "OPENAI_API_KEY": "your_openai_key"
      }
    }
  }
}
```

> Note: The server must be built before use with Claude Desktop:
```bash
pnpm build
```

---

## Example workflow

1. Index documents:
   - Refunds are allowed within 30 days.
   - Enterprise customers receive priority support.

2. Query:
   - What is the refund policy?

The host agent will automatically call the appropriate MCP tools to retrieve context and generate a grounded response.

---

## Next steps

Planned extensions in follow-up labs:

- RAG pipeline with evaluation
- Agentic workflows using function calling + retrieval
- Metadata filtering and chain-style orchestration
- PGVector-backed retrieval

---

## Disclaimer

This is a learning and demonstration project intended to showcase MCP-based AI tooling patterns.
