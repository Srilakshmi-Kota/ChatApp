import { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./App.css";
const socket = io("http://localhost:5000");

function App() {
  // Authentication State
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [isLogin, setIsLogin] = useState(false);

  // User Details
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Chat State
  const [message, setMessage] = useState("");
  const [receivedMessage, setReceivedMessage] = useState("");
  
  // Socket.IO Connection
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("receive_message", (data) => {
      setReceivedMessage(data);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  // Register
  const handleRegister = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/register",
        {
          username,
          email,
          password,
        }
      );

      alert(res.data.message);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || err.message);
    }
  };

  // Login
  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/login",
        {
          email,
          password,
        }
      );
      console.log(res.data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", res.data.username);
      setLoggedIn(true);

      alert("Login Successful!");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || err.message);
    }
  };

  // Send Chat Message
  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send_message", message);
      setMessage("");
    }
  };

  // Logged In Screen
  if (loggedIn) {
  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">🚀 Chat Application</h1>
       <p className="welcome">
  👋 Welcome back, {localStorage.getItem("username")}!
</p>
        <div className="message-row">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button className="send-btn" onClick={sendMessage}>
            Send
          </button>
        </div>

        <div className="chat-box">
          <h3>💬 Latest Message</h3>
          <p className="chat-message">
            {receivedMessage || "No messages yet..."}
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("isLoggedIn");
            setLoggedIn(false);
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

  // Login / Register Screen
 return (
  <div className="app-container">
    <div className="card">
      <h1 className="title">🚀 Chat Application</h1>
      <p className="subtitle">
        Real-time messaging with MERN & Socket.IO
      </p>

      <button
        className="toggle-btn"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Go to Register" : "Go to Login"}
      </button>

      {!isLogin ? (
        <>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="main-btn" onClick={handleRegister}>
            Register
          </button>
        </>
      ) : (
        <>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="main-btn" onClick={handleLogin}>
            Login
          </button>
        </>
      )}
    </div>
  </div>
 
);
}
export default App;