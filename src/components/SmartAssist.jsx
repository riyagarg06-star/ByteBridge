import { useState } from "react";
import "../styles/SmartAssist.css";

function SmartAssist() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleSend = () => {
    let reply = "";

    if (input.startsWith("/fix")) {
      reply = "✅ Fixed: Removed unnecessary semicolon.";
    } else if (input.startsWith("/explain")) {
      reply = "📘 This code defines a function that adds two numbers.";
    } else if (input.startsWith("/optimize")) {
      reply = "🚀 Optimized: Reduced loop complexity from O(n²) to O(n).";
    } else {
      reply = "❓ Unknown command. Try /fix, /explain or /optimize.";
    }

    setResponse(reply);
    setInput(""); // clear input box
  };

  return (
    <div className="smart-assist">
      <h3>Smart Assist</h3>
      <input
        type="text"
        value={input}
        placeholder="Ask the AI... (e.g. /fix)"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button onClick={handleSend}>Send</button>

      <div className="assist-response">
        {response && <p>{response}</p>}
      </div>
    </div>
  );
}

export default SmartAssist;
