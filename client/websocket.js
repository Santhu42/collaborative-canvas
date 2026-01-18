export const socket = io("http://localhost:3000", {
  autoConnect: false
});

export function initSocket(roomId, handlers) {
  // Remove old listeners (Live reload safety)
  socket.removeAllListeners();

  socket.connect();

  // 🔥 WAIT for actual connection
  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket.id);
    console.log("📡 Joining room:", roomId);

    socket.emit("join-room", roomId);
  });

  // Incremental draw (NO redraw)
  socket.on("draw-op", handlers.draw);

  // Full sync (join / undo / redo)
  socket.on("sync", handlers.sync);

  // Latency
  socket.on("pong-check", handlers.pong);
}
