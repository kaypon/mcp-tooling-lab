import type OpenAI from "openai";
import { ChromaClient } from "chromadb";
import { getCollection, type ChromaDoc } from "./chroma.js";
import { embedTexts } from "./openai.js";

export async function toolEmbedText(args: {
  openai: OpenAI;
  model: string;
  texts: string[];
}) {
  const embeddings = await embedTexts({
    client: args.openai,
    model: args.model,
    inputs: args.texts
  });

  return {
    model: args.model,
    count: embeddings.length,
    embeddings
  };
}

export async function toolIndexDocuments(args: {
  openai: OpenAI;
  model: string;
  chroma: ChromaClient;
  docs: ChromaDoc[];
}) {
  const collection = await getCollection(args.chroma);

  const ids = args.docs.map((d) => d.id);
  const documents = args.docs.map((d) => d.text);
  const metadatas = args.docs.map((d) => d.metadata ?? {});

  // Embed everything (Chroma can embed for you, but we want explicit OpenAI embeddings for the lab)
  const embeddings = await embedTexts({
    client: args.openai,
    model: args.model,
    inputs: documents
  });

  // Chroma add: ids + documents + embeddings + metadatas.  [oai_citation:5‡Chroma Docs](https://docs.trychroma.com/getting-started?utm_source=chatgpt.com)
  await collection.add({
    ids,
    documents,
    embeddings,
    metadatas
  });

  return { indexed: ids.length };
}

export async function toolVectorSearch(args: {
  openai: OpenAI;
  model: string;
  chroma: ChromaClient;
  query: string;
  topK: number;
  where?: Record<string, any>;
}) {
  const collection = await getCollection(args.chroma);

  const [queryEmbedding] = await embedTexts({
    client: args.openai,
    model: args.model,
    inputs: [args.query]
  });

  // Chroma query using queryEmbeddings.
  const res = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: Math.max(1, Math.min(args.topK, 20)),
    where: args.where
  });

  // Normalize the response into a clean list
  const hits = (res.ids?.[0] ?? []).map((id, i) => ({
    id,
    document: res.documents?.[0]?.[i] ?? null,
    metadata: res.metadatas?.[0]?.[i] ?? null,
    distance: res.distances?.[0]?.[i] ?? null
  }));

  return {
    query: args.query,
    topK: args.topK,
    hits
  };
}