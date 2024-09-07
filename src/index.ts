import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

// Create Express app
const app = express();

// Set up CORS for port 8000
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  next();
});

// Create an HTTP server
const httpServer = createServer(app);

// Create a Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow any origin for simplicity
    methods: ["GET", "POST"],
  },
});

// Serve a basic route
app.get("/", (req, res) => {
  res.send("WebSocket server with Socket.IO is running!");
});

app.get("/api/ping", (req, res) => {
  res.send("pong");
});

const users: string[] = [];

// Listen for WebSocket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  users.push(socket.id);

  io.emit("notification", `User ${socket.id} connected`);
  io.emit("users", users);

  // Listen for a message from the client
  socket.on("message", (message: string) => {
    console.log(`Message received: ${message}`);

    // Send a message back to the client
    socket.emit("message", `Server received your message: ${message}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    users.splice(users.indexOf(socket.id), 1);
    io.emit("users", users);
  });
});

// Start the server
const PORT = process.env.PORT || 8010;
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
