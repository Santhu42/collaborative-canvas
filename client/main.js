import { socket, initSocket } from "./websocket.js";
import { CanvasManager } from "./canvas.js";

/* =======================
   Canvas setup
======================= */
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const manager = new CanvasManager(canvas);

/* =======================
   DOM elements
======================= */
const toolSelect = document.getElementById("tool");
const colorInput = document.getElementById("color");
const widthInput = document.getElementById("width");
const textInput = document.getElementById("textInput");
const imageInput = document.getElementById("imageInput");
const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");
const fpsEl = document.getElementById("fps");
const latencyEl = document.getElementById("latency");

/* =======================
   Room
======================= */
const roomId =
  new URLSearchParams(window.location.search).get("room") || "default";

/* =======================
   State
======================= */
let tool = "brush";
let color = "#000000";
let width = 3;

let drawing = false;
let isDrawing = false;
let startPoint = null;

let previewOp = null;        // shapes preview
let activeImage = null;     // Image element for preview
let activeImageOp = null;   // image operation

let text = "";

let lastSyncedOps = [];
let hasInitialSync = false;

/* =======================
   Toolbar bindings
======================= */
toolSelect.onchange = e => tool = e.target.value;
colorInput.onchange = e => color = e.target.value;
widthInput.oninput = e => width = +e.target.value;
textInput.oninput = e => text = e.target.value;

/* =======================
   Image loader (IMPORTANT)
======================= */
imageInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    activeImage = new Image();
    activeImage.src = reader.result;
  };
  reader.readAsDataURL(file);
};

/* =======================
   WebSocket init
======================= */
initSocket(roomId, {
  // incremental updates from others
  draw: op => manager.draw(op),

  // authoritative sync
  sync: ops => {
    lastSyncedOps = ops;

    if (!hasInitialSync) {
      manager.redraw(ops);
      hasInitialSync = true;
      return;
    }

    if (isDrawing) return;

    manager.redraw(ops);
  },

  pong: sent => {
    latencyEl.innerText =
      `Latency: ${Math.round(performance.now() - sent)}ms`;
  }
});

/* =======================
   Pointer events
======================= */
canvas.addEventListener("pointerdown", e => {
  drawing = true;
  isDrawing = true;
  startPoint = { x: e.offsetX, y: e.offsetY };
  canvas.setPointerCapture(e.pointerId);

  // start image placement
  if (tool === "image" && activeImage) {
    activeImageOp = {
      tool: "image",
      src: activeImage.src,
      from: startPoint,
      width: activeImage.width,
      height: activeImage.height
    };
  }
});

canvas.addEventListener("pointermove", e => {
  if (!drawing) return;

  const current = { x: e.offsetX, y: e.offsetY };

  /* =======================
     Brush / Eraser
  ======================= */
  if (tool === "brush" || tool === "eraser") {
    const op = {
      tool,
      color,
      width,
      from: startPoint,
      to: current
    };

    manager.draw(op);
    socket.emit("draw", op);
    startPoint = current;
    return;
  }

  /* =======================
     Image preview (MOVE)
  ======================= */
  if (tool === "image" && activeImageOp) {
    activeImageOp.from = current;
    manager.redraw(lastSyncedOps);
    manager.draw(activeImageOp);
    return;
  }

  /* =======================
     Shape / Text preview
  ======================= */
  previewOp = {
    tool,
    color,
    width,
    from: startPoint,
    to: current,
    text
  };

  manager.redraw(lastSyncedOps);
  manager.draw(previewOp);
});

canvas.addEventListener("pointerup", e => {
  drawing = false;
  isDrawing = false;
  canvas.releasePointerCapture(e.pointerId);

  /* =======================
     Commit image
  ======================= */
  if (tool === "image" && activeImageOp) {
    manager.draw(activeImageOp);
    socket.emit("draw", activeImageOp);
    activeImageOp = null;
    return;
  }

  /* =======================
     Commit shape / text
  ======================= */
  if (previewOp) {
    manager.draw(previewOp);
    socket.emit("draw", previewOp);
    previewOp = null;
  }
});

canvas.addEventListener("pointercancel", () => {
  drawing = false;
  isDrawing = false;
  previewOp = null;
  activeImageOp = null;
});

/* =======================
   Undo / Redo
======================= */
undoBtn.onclick = () => socket.emit("undo");
redoBtn.onclick = () => socket.emit("redo");

/* =======================
   Resize handling
======================= */
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (lastSyncedOps.length) manager.redraw(lastSyncedOps);
});

/* =======================
   FPS Counter
======================= */
let frames = 0;
let lastTime = performance.now();

(function fpsLoop(now) {
  frames++;
  if (now - lastTime >= 1000) {
    fpsEl.innerText = `FPS: ${frames}`;
    frames = 0;
    lastTime = now;
  }
  requestAnimationFrame(fpsLoop);
})(performance.now());

/* =======================
   Latency Ping
======================= */
setInterval(() => {
  socket.emit("ping-check", performance.now());
}, 2000);
