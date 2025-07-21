import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username.trim()) {
      alert("Please enter your name.");
      return;
    }

    // Save to session
    sessionStorage.setItem("username", username);

    // ✅ Navigate to Home page (ByteBridge landing screen)
    navigate("/home");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>🔐 Secure Login</h2>
      <input
        type="text"
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          padding: "10px",
          fontSize: "16px",
          width: "250px",
          borderRadius: "4px",
        }}
      />
      <br />
      <button
        onClick={handleLogin}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Continue to ByteBridge
      </button>
    </div>
  );
};

export default Login;
