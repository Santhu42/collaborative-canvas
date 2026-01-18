export class CanvasManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.lineCap = "round";
  }

  draw(op) {
    const ctx = this.ctx;
    ctx.save();

    ctx.lineWidth = op.width;
    ctx.strokeStyle = op.color;
    ctx.fillStyle = op.color;

    if (op.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
    }

    switch (op.tool) {
      case "rect":
        ctx.strokeRect(
          op.from.x,
          op.from.y,
          op.to.x - op.from.x,
          op.to.y - op.from.y
        );
        break;

      case "circle":
        const r = Math.hypot(
          op.to.x - op.from.x,
          op.to.y - op.from.y
        );
        ctx.beginPath();
        ctx.arc(op.from.x, op.from.y, r, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case "text":
        ctx.font = `${op.width * 5}px Arial`;
        ctx.fillText(op.text || "", op.from.x, op.from.y);
        break;

      case "image":
        const img = new Image();
  img.src = op.src;

  img.onload = () => {
    ctx.drawImage(
      img,
      op.from.x,
      op.from.y,
      op.width || img.width,
      op.height || img.height
    );
  };
  break;

      default:
        ctx.beginPath();
        ctx.moveTo(op.from.x, op.from.y);
        ctx.lineTo(op.to.x, op.to.y);
        ctx.stroke();
    }

    ctx.restore();
  }

  redraw(ops) {
    this.ctx.clearRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    ops.forEach(op => this.draw(op));
  }
}
