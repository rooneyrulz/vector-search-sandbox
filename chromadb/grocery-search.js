const {
  getOrCreateCollection,
  generateEmbedding,
} = require("./config/chromadb");
const { groceries } = require("./data/groceries");

const COLLECTION_NAME = "my_grocery_collection11";

async function main() {
  try {
    const collection = await getOrCreateCollection(COLLECTION_NAME);
    const ids = groceries.map((_, index) => `document_${index + 1}`);
    const embeddingsData = await generateEmbedding(groceries);
    await collection.add({
      ids: ids,
      documents: groceries,
      embeddings: embeddingsData,
    });
    const allItems = await collection.get();
    await performSimilaritySearch(collection, allItems);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function performSimilaritySearch(collection, allItems) {
  try {
    const queryTerm = ["eggs", "banana", "apple"].join(" AND "); // Replace with your query term
    const results = await collection.query({
      collection: COLLECTION_NAME,
      queryTexts: queryTerm,
      n: 3, // Retrieve top 3 results
    });
    console.log(results);
    if (!results || results.length === 0) {
      console.log(`No documents found similar to "${queryTerm}"`);
      return; // Exit the function if no results are found
    }
    console.log(`Top 3 similar documents to "${queryTerm}":`);
    for (let i = 0; i < 3; i++) {
      const id = results.ids[0][i]; // Get ID from 'ids' array
      const score = results.distances[0][i]; // Get score from 'distances' array

      const text = allItems.documents[allItems.ids.indexOf(id)];
      if (!text) {
        console.log(
          ` - ID: ${id}, Text: 'Text not available', Score: ${score}`
        );
      } else {
        console.log(` - ID: ${id}, Text: '${text}', Score: ${score}`);
      }
    }
  } catch (error) {
    console.error("Error during similarity search:", error);
  }
}

main();
