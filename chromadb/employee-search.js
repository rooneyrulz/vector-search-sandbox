const {
  getOrCreateCollection,
  generateEmbedding,
} = require("./config/chromadb");
const { employees } = require("./data/employees");

const COLLECTION_NAME = "employee_collection_new";

async function main() {
  try {
    const collection = await getOrCreateCollection(COLLECTION_NAME);
    const empExperiences = employees.map((emp) => emp.experience.toString());
    const embeddingsData = await generateEmbedding(empExperiences);
    await collection.add({
      ids: employees.map((emp) => emp.id),
      employeeNames: employees.map((emp) => emp.name),
      documents: employees.map((emp) => emp.experience.toString()),
      embeddings: embeddingsData,
    });
    // const allItems = await collection.get();
    // const allItems = await collection.get({include:["documents", "embeddings", "metadatas"]});
    // console.log(allItems);
    await performSimilaritySearch(collection, employees);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function performSimilaritySearch(collection, employeeList) {
  try {
    const queryTerm = "8";
    const results = await collection.query({
      collection: COLLECTION_NAME,
      queryTexts: [queryTerm],
      n: 3,
    });
    if (!results || results.length === 0) {
      console.log(`No employees found with experience similar to ${queryTerm}`);
      return;
    }
    const queryTermScore = results.distances[0][0];
    console.log(`Score for query term "${queryTerm}": ${queryTermScore}`);
    console.log(`Top 3 employees with experience similar to ${queryTerm}:`);
    for (let i = 0; i < 3; i++) {
      const id = results.ids[0][i]; // Get ID from 'ids' array
      const score = results.distances[0][i]; // Get score from 'distances' array

      const employee = employeeList.find((emp) => emp.id === id);
      if (!employee) {
        console.log(` - ID: ${id}, Score: ${score}`);
      } else {
        console.log(
          ` - ID: ${employee.id}, Name: '${employee.name}', Exp: ${employee.experience}, Score: ${score}`
        );
      }
    }
  } catch (error) {
    console.error("Error during similarity search:", error);
  }
}

main();
