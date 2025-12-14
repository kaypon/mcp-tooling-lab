import "dotenv/config";
import { z } from "zod";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { makeOpenAIClient } from "./openai.js";
import { makeChromaClient } from "./chroma.js";
import { toolEmbedText, toolIndexDocuments, toolVectorSearch } from "./tools.js";

const openai = makeOpenAIClient();
const chroma = makeChromaClient();
const embedModel = process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small";

const server = new McpServer({
  name: "mcp-tooling-lab",
  version: "0.1.0"
});

/**
 * embed_text
 * Input: { texts: string[] }
 * Output: JSON string containing embeddings
 */
server.tool(
  "embed_text",
  "Generate OpenAI embeddings for an array of texts.",
  {
    texts: z.array(z.string().min(1)).min(1)
  },
  async ({ texts }) => {
    const out = await toolEmbedText({
      openai,
      model: embedModel,
      texts
    });

    return {
      content: [{ type: "text", text: JSON.stringify(out, null, 2) }]
    };
  }
);

/**
 * index_documents
 * Input: { docs: { id: string, text: string, metadata?: object }[] }
 * Output: { indexed: number }
 */
server.tool(
  "index_documents",
  "Embed and index documents into Chroma.",
  {
    docs: z
      .array(
        z.object({
          id: z.string().min(1),
          text: z.string().min(1),
          metadata: z.record(z.any()).optional()
        })
      )
      .min(1)
  },
  async ({ docs }) => {
    const out = await toolIndexDocuments({
      openai,
      model: embedModel,
      chroma,
      docs
    });

    return {
      content: [{ type: "text", text: JSON.stringify(out, null, 2) }]
    };
  }
);

/**
 * vector_search
 * Input: { query: string, topK?: number, where?: object }
 * Output: { hits: [...] }
 */
server.tool(
  "vector_search",
  "Semantic search using embeddings + Chroma. Optional metadata filter via `where`.",
  {
    query: z.string().min(1),
    topK: z.number().int().min(1).max(20).optional(),
    where: z.record(z.any()).optional()
  },
  async ({ query, topK, where }) => {
    const out = await toolVectorSearch({
      openai,
      model: embedModel,
      chroma,
      query,
      topK: topK ?? 5,
      where
    });

    return {
      content: [{ type: "text", text: JSON.stringify(out, null, 2) }]
    };
  }
);

async function main() {
  // MCP servers typically run over stdio so hosts (Claude Desktop, etc.) can spawn them.
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server failed to start:", err);
  process.exit(1);
});