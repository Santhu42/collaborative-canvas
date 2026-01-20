import { socket, initSocket } from "./websocket.js";
import { CanvasManager } from "./canvas.js";

/* Canvas */
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const manager = new CanvasManager(canvas);

/* UI */
const toolSelect = document.getElementById("tool");
const colorInput = document.getElementById("color");
const widthInput = document.getElementById("width");
const textInput = document.getElementById("textInput");
const imageInput = document.getElementById("imageInput");
const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");

/* State */
let tool = "brush";
let color = "#000";
let width = 3;

let drawing = false;
let lastPoint = null;
let previewOp = null;
let imageSrc = null;

let ops = [];                 // server truth
let localCommittedOps = [];   // 🔥 local cache

/* Toolbar */
toolSelect.onchange = e => tool = e.target.value;
colorInput.onchange = e => color = e.target.value;
widthInput.oninput = e => width = +e.target.value;

imageInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => imageSrc = reader.result;
  reader.readAsDataURL(file);
};

/* Socket */
const roomId =
  new URLSearchParams(window.location.search).get("room") || "default";

initSocket(roomId, {
  draw: op => {
    localCommittedOps.push(op);
    manager.draw(op);
  },
  sync: serverOps => {
    ops = serverOps;
    localCommittedOps = [...serverOps];
    manager.redraw(localCommittedOps);
  }
});

/* Drawing */
canvas.addEventListener("pointerdown", e => {
  const point = { x: e.offsetX, y: e.offsetY };

  if (tool === "text") {
    const text = textInput.value.trim();
    if (!text) return;

    const op = { tool: "text", text, color, width, from: point };
    localCommittedOps.push(op);
    manager.draw(op);
    socket.emit("draw", op);
    return;
  }

  drawing = true;
  lastPoint = point;
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;
  const current = { x: e.offsetX, y: e.offsetY };

  if (tool === "brush" || tool === "eraser") {
    const op = { tool, color, width, from: lastPoint, to: current };
    localCommittedOps.push(op);
    manager.draw(op);
    socket.emit("draw", op);
    lastPoint = current;
    return;
  }

  previewOp = {
    tool,
    color,
    width,
    from: lastPoint,
    to: current,
    src: tool === "image" ? imageSrc : undefined
  };

  manager.redraw(localCommittedOps); // 🔥 stable base
  manager.draw(previewOp);
});

canvas.addEventListener("pointerup", () => {
  if (!previewOp) {
    drawing = false;
    lastPoint = null;
    return;
  }

  localCommittedOps.push(previewOp);
  manager.draw(previewOp);
  socket.emit("draw", previewOp);

  previewOp = null;
  drawing = false;
  lastPoint = null;
});

/* Undo / Redo */
undoBtn.onclick = () => socket.emit("undo");
redoBtn.onclick = () => socket.emit("redo");

/* Resize */
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  manager.redraw(localCommittedOps);
});
