import './App.css';
import VideoChat from "./pages/VideoChat";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <h1 style={{ textAlign: 'center', marginTop: '20px' }}>🚀 Welcome to ByteBridge</h1>
        <Routes>
          <Route path="/room/:roomId" element={<VideoChat />} />
          <Route path="/" element={<Navigate to={`/room/${generateRoomId()}`} />} />
        </Routes>
      </div>
    </Router>
  );
}

// 🔧 Generate random room ID (for demo)
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

export default App;
