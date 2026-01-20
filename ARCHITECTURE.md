### Real-Time Collaborative Drawing Canvas – Architecture Overview

This document explains the architectural decisions, data flow, real-time communication protocol, and conflict-handling strategies used in the collaborative drawing application.

1. Data Flow Diagram

Drawing Event Flow

User Input (Mouse / Touch)
        ↓
Canvas Event Handler (pointerdown / pointermove / pointerup)
        ↓
Operation Object Created
        ↓
Local Canvas Render (Immediate Feedback)
        ↓
WebSocket Emit ("draw")
        ↓
Server Receives Event
        ↓
Persist Operation in Room History
        ↓
Broadcast Event to Other Clients
        ↓
Remote Clients Render Operation on Canvas

Key Design Principle

The client renders immediately for responsiveness, while the server remains the source of truth for state synchronization.

2. WebSocket Protocol

Connection & Room Management

Event	                  Direction	                                 Purpose
join-room	           Client → Server	                     Join a specific canvas room
users-update	       Server → Client	                     Update list of online users

Drawing Synchronization

Event	    Direction	                 Payload
draw	 Client → Server	     Drawing operation object
draw	 Server → Client	     Broadcast drawing to others
sync	 Server → Client	     Full canvas state (on join / undo / redo)

Cursor & Performance

Event	         Direction	                        Purpose
cursor	      Client → Server	               Send cursor position
cursor	      Server → Client	               Broadcast cursor position
ping-check	  Client → Server	           Latency measurement
pong-check	  Server → Client	           Latency response

3. Undo / Redo Strategy

Global Operation Model

All drawing actions are stored as immutable operations.

The server maintains:
-history[] – applied operations
-redoStack[] – undone operations

Undo Flow

User clicks Undo
   ↓
Client emits "undo"
   ↓
Server removes last operation from history
   ↓
Server broadcasts updated history via "sync"
   ↓
All clients fully redraw canvas

Why Global Undo?
-Guarantees consistency across all users
-Avoids divergence between client states
-Simplifies conflict handling

4. Performance Decisions

Canvas Optimizations

-Incremental rendering for brush strokes
-Preview vs commit model for shapes and images
-Full redraw only on:
    Undo
    Redo
    Initial sync

Network Optimizations

-Small, serialized operation objects
-No image re-transmission (base64 stored once)
-WebSocket transport forced for low latency

UI Performance

-FPS measured using requestAnimationFrame
-Latency measured via lightweight ping-pong
-Cursor rendering done outside canvas layer

5. Conflict Resolution

Strategy: Operation Ordering + Server Authority

Server is the single source of truth
Operations are applied in arrival order
Overlapping drawings are allowed intentionally

Why This Works

Canvas is a destructive medium
Overlaps are expected behavior
Avoids complex locking or region ownership

Example Scenario
User A draws a line
User B draws a circle in same area
↓
Both operations are applied sequentially
↓
Final canvas reflects both actions


No conflicts are rejected — consistency is prioritized over strict isolation.

6. Scalability Considerations

Rooms isolate state and reduce broadcast scope
Stateless clients enable horizontal scaling
Server memory can be replaced with Redis for persistence
WebSocket namespaces can support thousands of users

7. Summary of Design Choices

Concern	                           Solution
Real-time sync	               WebSockets (Socket.IO)
State authority	                    Server
Undo/redo	                   Operation history
Performance	                   Incremental rendering
Conflicts	                   Sequential operations
Scalability	                     Room isolation

Final Notes

This architecture prioritizes:
- Correctness
- Responsiveness
- Simplicity
- Debuggability

The solution avoids over-engineering while demonstrating real-world system design principles.