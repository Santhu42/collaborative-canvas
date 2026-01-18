/* global io */

// DO NOT put localhost or any URL here
export const socket = io({
  autoConnect: false,
  transports: ["websocket"] // avoids polling fallback
});

export function initSocket(roomId, handlers) {
  socket.removeAllListeners();

  socket.connect();

  socket.on("connect", () => {
    console.log("✅ Connected to server:", socket.id);
    socket.emit("join-room", roomId);
  });

  socket.on("draw", handlers.draw);
  socket.on("sync", handlers.sync);
  socket.on("pong-check", handlers.pong);

  socket.on("connect_error", err => {
    console.error("❌ Socket connection error:", err.message);
  });
}
