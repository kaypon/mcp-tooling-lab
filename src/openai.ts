import OpenAI from "openai";

export function makeOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY in env");
  return new OpenAI({ apiKey });
}

export async function embedTexts(opts: {
  client: OpenAI;
  model: string;
  inputs: string[];
}): Promise<number[][]> {
  const { client, model, inputs } = opts;

  // OpenAI embeddings endpoint supports an array of strings.  [oai_citation:3‡OpenAI Platform](https://platform.openai.com/docs/api-reference/embeddings?utm_source=chatgpt.com)
  const res = await client.embeddings.create({
    model,
    input: inputs
  });

  return res.data.map((d) => d.embedding as number[]);
}