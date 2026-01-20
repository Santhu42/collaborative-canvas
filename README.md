🖌️ Real-Time Collaborative Drawing Canvas

A real-time collaborative drawing application where multiple users can draw simultaneously on a shared canvas with live synchronization using WebSockets.

🌐 Live Demo

Home (default room):
https://collaborative-canvas-nggb.onrender.com/

Room-based Canvas Example:
https://collaborative-canvas-nggb.onrender.com/index.html?room=room1

Open the same room URL on multiple devices or browser tabs to test real-time collaboration.

📱 Mobile Touch Support

-Fully supports mobile and tablet devices
-Drawing works using touch gestures
-Implemented using Pointer Events (pointerdown, pointermove, pointerup)
-Works seamlessly across:
    Desktop (mouse)
    Mobile phones (touch)
    Tablets (touch / stylus)
-No separate mobile codebase is required.

🛠️ Setup Instructions

Prerequisites

-Node.js (v18 or above)
-npm

Steps to Run the Project Locally

1.Clone the repository:

git clone https://github.com/Santhu42/collaborative-canvas
cd collaborative-canvas

2.Install dependencies:

npm install

3.Start the server:

npm start

4.Open in browser:

http://localhost:3000/index.html

The project works using:

npm install && npm start

👥 How to Test with Multiple Users

1.Open the application in two or more browser tabs or different devices.
2.Use the same room name in the URL:
  http://localhost:3000/index.html?room=room1
3.Draw on the canvas from multiple tabs/devices.
4.All users in the same room will see drawings update in real time.
5.Change the room name (e.g., room2) to create an isolated canvas.

⚠️ Known Limitations / Bugs

-No user authentication (users are anonymous).
-Undo/redo is global across all users.
-Drawings are stored in server memory (not a database).
-Large drawings may impact performance.
-No selection or movement of already drawn objects.

⏱️ Time Spent on the Project

Total Time: Approximately 4 days

Planning & architecture: ~4 hours

Canvas drawing logic & tools: ~8 hours

Real-time synchronization (Socket.IO): ~6 hours

Undo/redo & room handling: ~4 hours

Debugging, testing & deployment: ~6 hours

📌 Notes

Server acts as the single source of truth

Clients render optimistically for responsiveness

Designed to be simple, readable, and interview-ready

📜 License

This project is created for educational and evaluation purposes.