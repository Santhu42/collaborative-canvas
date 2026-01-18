const fs = require("fs");
const path = require("path");

class DrawingState {
  constructor(roomId) {
    this.roomId = roomId;

    // Store outside client folder
    this.file = path.join(__dirname, "..", "data", `${roomId}.json`);
    fs.mkdirSync(path.dirname(this.file), { recursive: true });

    this.history = [];
    this.redoStack = [];

    // Load previous session if exists
    if (fs.existsSync(this.file)) {
      try {
        this.history = JSON.parse(fs.readFileSync(this.file, "utf-8"));
      } catch {
        this.history = [];
      }
    }

    // Debounced save (important)
    this.saveTimer = null;
  }

  scheduleSave() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      fs.writeFileSync(this.file, JSON.stringify(this.history));
    }, 1000); // save at most once per second
  }

  add(op) {
    this.history.push(op);
    this.redoStack = [];
    this.scheduleSave();
  }

  undo() {
    if (this.history.length) {
      this.redoStack.push(this.history.pop());
      this.scheduleSave();
    }
    return this.history;
  }

  redo() {
    if (this.redoStack.length) {
      this.history.push(this.redoStack.pop());
      this.scheduleSave();
    }
    return this.history;
  }
}

module.exports = { DrawingState };
