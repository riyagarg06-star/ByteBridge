import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "../socket"; // same socket client
import "../styles/Editor.css";

function SpectatorRoom() {
  const { roomId } = useParams();
  const [code, setCode] = useState("");

  useEffect(() => {
    socket.on("code-change", (newCode) => {
      setCode(newCode);
    });

    return () => {
      socket.off("code-change");
    };
  }, []);

  return (
    <div className="editor-room">
      <h2>Spectating Room: #{roomId}</h2>
      <textarea
        className="editor-box"
        rows={20}
        cols={60}
        value={code}
        readOnly
      />
    </div>
  );
}

export default SpectatorRoom;
