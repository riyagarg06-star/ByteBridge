import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "../components/Editor";
import VideoChat from "../components/VideoChat";
import SmartAssist from "../components/SmartAssist";
import socket from "../socket"; // make sure this exists and is correctly configured
import "../styles/EditorRoom.css";

function EditorRoom() {
  const { roomId } = useParams();
  const [code, setCode] = useState("");

  useEffect(() => {
    socket.emit("join-room", roomId);

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("code-change", { roomId, code: newCode });
  };

  return (
    <div className="editor-room">
      <div className="room-header">
        <span>Room ID: #{roomId}</span>
        <button
          onClick={() => navigator.clipboard.writeText(roomId)}
          className="copy-btn"
        >
          📋 Copy
        </button>
      </div>
      <div className="room-content">
        <div className="left-panel">
          <Editor code={code} onCodeChange={handleCodeChange} />
        </div>
        <div className="right-panel">
          <VideoChat />
          <SmartAssist />
        </div>
      </div>
    </div>
  );
}

export default EditorRoom;
