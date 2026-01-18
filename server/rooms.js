const { DrawingState } = require("./drawing-state");

const rooms = new Map();

function normalizeRoomId(roomId) {
  return roomId
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function getRoom(rawRoomId) {
  const normalizedId = normalizeRoomId(rawRoomId);

  if (!rooms.has(normalizedId)) {
    rooms.set(normalizedId, new DrawingState(normalizedId));
  }

  return rooms.get(normalizedId);
}

module.exports = { getRoom };
