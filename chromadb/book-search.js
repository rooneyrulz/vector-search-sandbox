const {
  getOrCreateCollection,
  generateEmbedding,
} = require("./config/chromadb");
const { books } = require("./data/books");

const COLLECTION_NAME = "book_collection_new";

async function main() {
  try {
    const collection = await getOrCreateCollection(COLLECTION_NAME);
    const bookRatings = books.map((book) => book.rating.toString());
    const embeddingsData = await generateEmbedding(bookRatings);
    await collection.add({
      ids: books.map((book) => book.id),
      bookNames: books.map((book) => book.name),
      documents: books.map((book) => book.rating.toString()),
      embeddings: embeddingsData,
    });
    const allItems = await collection.get();
    // const allItems = await collection.get({include:["documents", "embeddings", "metadatas"]});
    await performSimilaritySearch(collection, allItems);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function performSimilaritySearch(collection, allItems) {
  try {
    const queryTerm = "4.4";
    const results = await collection.query({
      collection: COLLECTION_NAME,
      queryTexts: [queryTerm],
      n: 3,
    });
    if (!results || results.length === 0) {
      console.log(`No books found with experience similar to ${queryTerm}`);
      return;
    }
    const queryTermScore = results.distances[0][0];
    console.log(`Score for query term "${queryTerm}": ${queryTermScore}`);
    console.log(`Top 3 books with experience similar to ${queryTerm}:`);
    for (let i = 0; i < 3; i++) {
      const id = results.ids[0][i]; // Get ID from 'ids' array
      const score = results.distances[0][i]; // Get score from 'distances' array

      const book = books.find((bk) => bk.id === id);
      if (!book) {
        console.log(` - ID: ${id}, Score: ${score}`);
      } else {
        console.log(
          ` - ID: ${book.id}, Title: '${book.title}', Rating: ${book.rating}, Score: ${score}`
        );
      }
    }
  } catch (error) {
    console.error("Error during similarity search:", error);
  }
}

main();
