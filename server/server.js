require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const User = require("./models/User");
const Message = require("./models/Message");
const app = express();
const server = http.createServer(app);

app.use(cors());
// Middleware
app.use(express.json());

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

// Test Route
app.get("/", (req, res) => {
  res.send("Chat App Server Running");
});

// =========================
// Register API
// =========================
app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User Registered Successfully",
    });
  } catch (error) {
    console.log("ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// =========================
// Login API
// =========================
app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token:token,
      username: user.username
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
});
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
let onlineUsers = 0;
// =========================
// Socket.IO
// =========================
io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);
  onlineUsers++;
io.emit("online_users", onlineUsers);
  socket.on("send_message", async (data) => {
  console.log("📩 Message Received:", data);

  const newMessage = new Message({
    sender: data.sender,
    text: data.text,
  });

  await newMessage.save();

  io.emit("receive_message", {
    sender: data.sender,
    text: data.text,
    timestamp: newMessage.timestamp,
  });
});

  socket.on("disconnect", () => {
  console.log("🔴 User Disconnected:", socket.id);

  onlineUsers--;
  io.emit("online_users", onlineUsers);
});
});
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// =========================
// Server Start
// =========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});