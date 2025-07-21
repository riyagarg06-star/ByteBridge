const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // frontend origin
    methods: ["GET", "POST"],
  },
});

const rooms = {}; // { roomId: { users: Set(), spectators: Set() } }

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = { users: new Set(), spectators: new Set() };
    }
    rooms[roomId].users.add(socket.id);

    const otherUsers = [...rooms[roomId].users].filter((id) => id !== socket.id);
    socket.emit("all-users", otherUsers);

    socket.to(roomId).emit("user-joined", { callerId: socket.id });
  });

  socket.on("join-as-spectator", (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = { users: new Set(), spectators: new Set() };
    }
    rooms[roomId].spectators.add(socket.id);
    console.log(`👀 Spectator joined room ${roomId}: ${socket.id}`);
  });

  socket.on("send-signal", ({ to, signalData }) => {
    io.to(to).emit("receive-signal", {
      from: socket.id,
      signalData,
    });
  });

  socket.on("return-signal", ({ to, signalData }) => {
    io.to(to).emit("receiving-returned-signal", {
      id: socket.id,
      signal: signalData,
    });
  });

  // Handle signal sent by spectator to peer
  socket.on("spectator-return-signal", ({ to, signal }) => {
    io.to(to).emit("spectator-signal", {
      from: socket.id,
      signal,
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);

    for (const roomId in rooms) {
      const room = rooms[roomId];

      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        socket.to(roomId).emit("user-disconnected", socket.id);
      }

      if (room.spectators.has(socket.id)) {
        room.spectators.delete(socket.id);
      }

      if (room.users.size === 0 && room.spectators.size === 0) {
        delete rooms[roomId]; // clean up empty room
      }
    }
  });
});

server.listen(3001, () => {
  console.log("🚀 Signaling server running on http://localhost:3001");
});
