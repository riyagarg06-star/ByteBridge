import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await axios.post(
        "http://localhost:3001/api/login",
        { username },
        { withCredentials: true }
      );
      navigate("/room/main");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Secure Login</h2>
      <input
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: "8px", marginBottom: "10px" }}
      />
      <br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
