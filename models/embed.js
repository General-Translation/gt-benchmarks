import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function embed(input) {
  const result = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: input,
    encoding_format: "float",
  });
  const embedding = result?.data[0]?.embedding;
  if (embedding?.length === 1) return embedding[0];
  else return embedding;
}