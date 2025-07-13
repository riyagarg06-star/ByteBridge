import { useEffect, useState } from "react";
import socket from "../socket";
import "../styles/Editor.css";

function Editor() {
  const [code, setCode] = useState("");

  const handleChange = (e) => {
    setCode(e.target.value);
    socket.emit("code-change", e.target.value); // emit code change
  };

  useEffect(() => {
    socket.on("code-change", (newCode) => {
      setCode(newCode);
    });

    return () => {
      socket.off("code-change");
    };
  }, []);

  const handleRun = () => {
    alert("🔧 Output:\n\n" + code);
  };

  return (
    <div className="editor-box">
      <h3>Live Code Editor</h3>
      <textarea
        rows={20}
        cols={60}
        value={code}
        onChange={handleChange}
        placeholder="Start coding here..."
      />
      <br />
      <button onClick={handleRun}>▶️ Run</button>
    </div>
  );
}

export default Editor;
