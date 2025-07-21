import './App.css';
import VideoChat from "./pages/VideoChat";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from "./Login";

function App() {
  console.log("App.js loaded");
  return (
    <Router>
      <div className="App">
        <h1 style={{ textAlign: 'center', marginTop: '20px' }}>🚀 Welcome to ByteBridge</h1>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/room/:roomId" element={<VideoChat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
