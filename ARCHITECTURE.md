### Data Flow
Mouse → Stroke → Socket → Server → Broadcast → Canvas

### WebSocket Protocol
draw, undo, redo, cursor, init-state

### Undo/Redo
Operation-based global stack

### Conflict Resolution
Operations are append-only and replayed

### Performance
- Batched points
- No bitmap sync
- Server authoritative
