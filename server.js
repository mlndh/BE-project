const http = require("http");
const endpoints = require("./routes/endpoints");
var fs = require("fs");

require("dotenv").config();
const { connectDB, getDB } = require("./config/db");

(async () => {
  await connectDB();
  const db = getDB();
  const todosCollection = db.collection("todos");

  const server = http.createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/") {
      fs.readFile("./public/index.html", (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Error loading HTML file");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        }
      });
    }
    else {
      await endpoints(req, res);
      if (!res.writableEnded) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Leon har bitit av sladden");
      }
    }
  });

  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();
