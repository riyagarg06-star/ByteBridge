import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/Home.css";

function Home() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (roomId.trim() !== "") {
      navigate(`/editor/${roomId}`);
    } else {
      alert("Please enter a valid Room ID");
    }
  };

  return (
    <div className="home-container">
      <h1 className="home-title">ByteBridge</h1>
      <p className="home-subtitle">Code Together. Smarter.</p>

      <button
  className="start-btn"
  onClick={() => {
    const id = Math.random().toString(36).substring(2, 8);
    navigate(`/editor/${id}`);
  }}
>
  Start New Collaboration
</button>


      <div className="join-room-section">
        <input
          type="text"
          className="room-input"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button className="join-btn" onClick={handleJoin}>
          Join Room
        </button>
      </div>
    </div>
  );
}

export default Home;
