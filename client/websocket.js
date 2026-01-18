/* global io */

export const socket = io({
  autoConnect: false,
  transports: ["websocket"]
});

export function initSocket(roomId, handlers) {
  socket.removeAllListeners();

  socket.connect();

  socket.on("connect", () => {
    console.log("✅ Connected:", socket.id);
    socket.emit("join-room", roomId);
  });

  // 🔥 LIVE draw events
  socket.on("draw", handlers.draw);

  // 🔥 Full sync (undo / redo / join)
  socket.on("sync", handlers.sync);

  socket.on("pong-check", handlers.pong);
}
