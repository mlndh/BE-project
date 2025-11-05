const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

async function endpoints(req, res) {
  const db = getDB();
  const todosCollection = db.collection("todos");

  if (req.method === "GET" && req.url === "/todos") {
    try {
      const todos = await todosCollection.find().toArray();
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Set-Cookie": "Mm=cookies; HttpOnly",
      });
      res.end(JSON.stringify(todos));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to fetch todos" }));
    }
  } else if (req.method === "POST" && req.url === "/") {
    await new Promise((resolve) => {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        try {
          const data = JSON.parse(body);
          const result = await todosCollection.insertOne({
            name: data.name,
          });

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "Received",
              name: result.name,
              done: false,
            })
          );
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
        resolve();
      });
    });
  } else if (req.method === "POST" && req.url.startsWith("/todos/done/")) {
    try {
      const id = req.url.split("/").pop();
      const chosenId = new ObjectId(id);

      const todo = await todosCollection.findOne({ _id: chosenId });
      if (!todo) throw new Error("Todo not found");

      const result = await todosCollection.updateOne(
        { _id: chosenId },
        { $set: { done: !todo.done } }
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          done: !todo.done,
        })
      );
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else if (req.method === "DELETE") {
    try {
      const chosenId = new ObjectId(req.url.split("/todos/")[1]);
      const result = await todosCollection.deleteOne({ _id: chosenId });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ deletedCount: result.deletedCount }));
    } catch (error) {
      console.error("Error inserting document:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
  }
}

module.exports = endpoints;
