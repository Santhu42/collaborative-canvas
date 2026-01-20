# Real-Time Collaborative Drawing Canvas

A real-time collaborative drawing application where multiple users can draw simultaneously on a shared canvas using WebSockets.

# Setup Instructions

# Prerequisites

Node.js (v18 or above)

npm

# Steps to Run the Project

1. Clone the repository:

   git clone https://github.com/Santhu42/collaborative-canvas
   cd collaborative-canvas


2. Install dependencies:

   npm install

3. Start the server:

   npm start


4. Open the application in a browser:

   http://localhost:3000/index.html


The project should run successfully using only:

npm install && npm start

# How to Test with Multiple Users

1. Open the application in two or more browser tabs or different devices.

2. Use the same room name in the URL:

    http://localhost:3000/index.html?room=room1


3. Draw on the canvas from different tabs/devices.

4. All users in the same room will see drawings update in real time.

5. Open a different room name (e.g., room2) to test isolated canvases.

# Known Limitations / Bugs

No user authentication (users are anonymous).

Undo/redo is global across all users.

Drawings are stored in server memory (not a database).

Large drawings may affect performance.

No object selection or movement after drawing.

Time Spent on the Project

# Total Time: 4 days