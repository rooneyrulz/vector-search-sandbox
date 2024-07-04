const { ChromaClient, DefaultEmbeddingFunction } = require("chromadb");

const client = new ChromaClient();
const default_emd = new DefaultEmbeddingFunction();

async function getOrCreateCollection(collectionName) {
  const collection = await client.getOrCreateCollection({
    name: collectionName,
    embeddings: default_emd,
  });

  return collection;
}

async function generateEmbedding(texts) {
  const embeddingsData = await default_emd.generate(texts);
  return embeddingsData;
}

module.exports = { getOrCreateCollection, generateEmbedding };
