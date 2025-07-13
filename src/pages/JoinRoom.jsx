// 📄 src/pages/JoinRoom.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/JoinRoom.css";

function JoinRoom() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
     if (roomId.trim() !== "") {
    // Room ID ke saath navigate karo
    navigate(`/editor?room=${roomId}`);
  }
  };

  return (
    <div className="join-room-container">
      <h2>Join a Room</h2>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={handleJoin}>Join Room</button>
    </div>
  );
}

export default JoinRoom;
