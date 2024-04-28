import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function embed(input) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: input,
    encoding_format: "float",
  });
  if (embedding.embedding?.length === 1) return embedding.embedding[0];
  else return embedding.embedding;
}

module.exports = {
    embed
}