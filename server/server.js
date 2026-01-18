const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { getRoom } = require("./rooms");

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "../client")));

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", socket => {
  socket.on("join-room", rawRoomId => {
    // 🔥 getRoom returns normalized room instance
    const room = getRoom(rawRoomId);
    const roomId = room.roomId; // normalized ID

    console.log(
      `🧠 Join room: raw="${rawRoomId}" normalized="${roomId}"`
    );

    socket.join(roomId);

    // Send persisted state
    socket.emit("sync", room.history);

    socket.on("draw", op => {
      room.add(op);
      socket.to(roomId).emit("draw-op", op);
    });

    socket.on("undo", () => {
      const state = room.undo();
      io.to(roomId).emit("sync", state);
    });

    socket.on("redo", () => {
      const state = room.redo();
      io.to(roomId).emit("sync", state);
    });

    socket.on("ping-check", t =>
      socket.emit("pong-check", t)
    );

    socket.on("disconnect", () => {
      console.log(`❌ Left room ${roomId}`);
    });
  });
});

server.listen(3000, () =>
  console.log("✅ App running at http://localhost:3000")
);
