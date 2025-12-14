import { ChromaClient } from "chromadb";

export type ChromaDoc = {
  id: string;
  text: string;
  metadata?: Record<string, any>;
};

export function makeChromaClient() {
  const url = process.env.CHROMA_URL || "http://localhost:8000";
  return new ChromaClient({ path: url });
}

export async function getCollection(client: ChromaClient) {
  const name = process.env.CHROMA_COLLECTION || "mcp_tooling_lab";
  return client.getOrCreateCollection({ name });
}