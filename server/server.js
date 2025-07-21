const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 New user connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`👥 User ${socket.id} joined room ${roomId}`);

    // List all users already in the room (except current)
    const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    const otherUsers = usersInRoom.filter((id) => id !== socket.id);
    socket.emit("all-users", otherUsers);

    // Inform others in the room
    socket.to(roomId).emit("user-joined", socket.id);

    // Handle signaling
    socket.on("send-signal", ({ to, signalData }) => {
      io.to(to).emit("receive-signal", {
        from: socket.id,
        signalData,
      });
    });

    socket.on("return-signal", ({ to, signalData }) => {
      io.to(to).emit("receive-returned-signal", {
        from: socket.id,
        signalData,
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      socket.to(roomId).emit("user-disconnected", socket.id);
    });
  });
});

server.listen(3001, () => {
  console.log("🚀 Signaling server running on http://localhost:3001");
});
