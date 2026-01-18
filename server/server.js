const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { getRoom } = require("./rooms");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Serve frontend
app.use(express.static("client"));

io.on("connection", socket => {
  socket.on("join-room", roomId => {
    const room = getRoom(roomId);
    socket.join(roomId);

    // Send full state to new user
    socket.emit("sync", room.history);

    // Live draw
    socket.on("draw", op => {
      room.add(op);
      socket.to(roomId).emit("draw", op);
    });

    socket.on("undo", () => {
      io.to(roomId).emit("sync", room.undo());
    });

    socket.on("redo", () => {
      io.to(roomId).emit("sync", room.redo());
    });

    socket.on("ping-check", t => {
      socket.emit("pong-check", t);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
