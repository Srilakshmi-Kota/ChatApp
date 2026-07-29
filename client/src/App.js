import { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./App.css";
const socket = io("https://chatapp-0buu.onrender.com");

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
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const messagesEndRef = useRef(null);
  // Socket.IO Connection
  // Socket.IO Connection
useEffect(() => {
  socket.on("connect", () => {
    console.log("Connected:", socket.id);
  });

  const loadMessages = async () => {
    try {
      const res = await axios.get("https://chatapp-0buu.onrender.com/messages");
      setMessages(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  loadMessages();

  socket.on("receive_message", (data) => {
    setMessages((prevMessages) => [...prevMessages, data]);
  });

  socket.on("online_users", (count) => {
    setOnlineUsers(count);
  });

  return () => {
    socket.off("receive_message");
    socket.off("online_users");
  };
}, []);

  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);
  // Register
  const handleRegister = async () => {
    try {
      const res = await axios.post(
        "https://chatapp-0buu.onrender.com/register",
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
        "https://chatapp-0buu.onrender.com/login",
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
  if (message.trim() === "") return;

  socket.emit("send_message", {
    sender: localStorage.getItem("username"),
    text: message,
  });

  setMessage("");
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
<p className="online-users">
  🟢 {onlineUsers} User{onlineUsers !== 1 ? "s" : ""} Online
</p>
        <div className="message-row">
          <input
  type="text"
  placeholder="Type a message..."
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  }}
/>
          <button className="send-btn" onClick={sendMessage}>
            Send
          </button>
        </div>

        
        <div className="chat-box">
  <h3>💬 Chat History</h3>

  {messages.length === 0 ? (
    <p className="chat-message">No messages yet...</p>
  ) : (
    messages.map((msg, index) => (
      <div
        key={index}
        className={
          msg.sender === localStorage.getItem("username")
            ? "my-message"
            : "other-message"
        }
      >
        <div className="sender-name">
          {msg.sender}
        </div>

        <div>{msg.text}</div>

        <div className="time-stamp">
          {msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </div>
      </div>
    ))
  )}
  <div ref={messagesEndRef}></div>
</div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("username");
            setLoggedIn(false);
          }}
        >
          Logout
        </button>
        <p className="footer-text">
  Built with ❤️ using React, Node.js, MongoDB & Socket.IO
</p>
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