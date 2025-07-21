const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const SECRET_KEY = "bytebridge_secure_key"; // You can change this

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

// ✅ LOGIN route to issue token
app.post("/api/login", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // true if using https
    sameSite: "Lax",
  });
  res.json({ success: true });
});

// ✅ Middleware for session validation
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ✅ Protected test route
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}` });
});

// ✅ SOCKET.IO logic with room joining
io.on("connection", (socket) => {
  console.log("🔌 New user connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    const otherUsers = usersInRoom.filter((id) => id !== socket.id);
    socket.emit("all-users", otherUsers);

    socket.to(roomId).emit("user-joined", socket.id);

    socket.on("send-signal", ({ to, signalData }) => {
      io.to(to).emit("receive-signal", { from: socket.id, signalData });
    });

    socket.on("return-signal", ({ to, signalData }) => {
      io.to(to).emit("receive-returned-signal", {
        from: socket.id,
        signalData,
      });
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", socket.id);
    });
  });
});

server.listen(3001, () => {
  console.log("🚀 Server running on http://localhost:3001");
});
