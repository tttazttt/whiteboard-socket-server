const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 3001;

let history = [];
let redoHistory = [];

let previousClientsCount = io.engine.clientsCount;

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.emit("history", { history, redoHistory });

  socket.on("drawing", (data) => {
    socket.broadcast.emit("drawing", data);
  });

  socket.on(
    "history",
    ({ history: newHistory, redoHistory: newRedoHistory }) => {
      history = newHistory;
      redoHistory = newRedoHistory;
      socket.broadcast.emit("history", { history, redoHistory });
    }
  );

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

setInterval(() => {
  const currentClientsCount = io.engine.clientsCount;

  if (currentClientsCount !== previousClientsCount) {
    console.log(`Active connections: ${currentClientsCount}`);
    previousClientsCount = currentClientsCount;
  }
}, 10000);

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
