const imageCache = new Map();

export class CanvasManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
  }

  draw(op) {
    const ctx = this.ctx;
    ctx.save();

    ctx.strokeStyle = op.color || "#000";
    ctx.fillStyle = op.color || "#000";
    ctx.lineWidth = op.width || 2;
    ctx.globalCompositeOperation =
      op.tool === "eraser" ? "destination-out" : "source-over";

    if (op.tool === "brush" || op.tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(op.from.x, op.from.y);
      ctx.lineTo(op.to.x, op.to.y);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (op.tool === "rect") {
      ctx.strokeRect(
        op.from.x,
        op.from.y,
        op.to.x - op.from.x,
        op.to.y - op.from.y
      );
    }

    if (op.tool === "circle") {
      const r = Math.hypot(
        op.to.x - op.from.x,
        op.to.y - op.from.y
      );
      ctx.beginPath();
      ctx.arc(op.from.x, op.from.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (op.tool === "text" && typeof op.text === "string") {
      ctx.font = `${op.width * 6}px Arial`;
      ctx.fillText(op.text, op.from.x, op.from.y);
    }

    if (op.tool === "image") {
      let img = imageCache.get(op.src);
      if (!img) {
        img = new Image();
        img.src = op.src;
        imageCache.set(op.src, img);
      }

      const drawImg = () => {
        ctx.drawImage(
          img,
          op.from.x,
          op.from.y,
          op.to.x - op.from.x,
          op.to.y - op.from.y
        );
      };

      img.complete ? drawImg() : (img.onload = drawImg);
    }

    ctx.restore();
  }

  redraw(ops) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ops.forEach(op => this.draw(op));
  }
}
