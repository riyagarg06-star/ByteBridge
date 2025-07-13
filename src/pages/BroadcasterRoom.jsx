import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/EditorRoom.css";

function BroadcasterRoom({ onCodeUpdate }) {
  const { roomId } = useParams();
  const [code, setCode] = useState("");

  // Simulate broadcast: store code in localStorage (for now)
  useEffect(() => {
    localStorage.setItem(`broadcast-${roomId}`, code);
  }, [code, roomId]);

  return (
    <div className="editor-room">
      <div className="room-header">You are Broadcasting: #{roomId}</div>
      <div className="room-content">
        <textarea
          rows={20}
          cols={80}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Type here to broadcast..."
        />
      </div>
    </div>
  );
}

export default BroadcasterRoom;
