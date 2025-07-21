import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login"; // ✅ Path sahi hai
import Home from "./pages/Home";
import JoinRoom from "./pages/JoinRoom";
import EditorRoom from "./pages/EditorRoom";
import SpectatorRoom from "./pages/SpectatorRoom";
import BroadcasterRoom from "./pages/BroadcasterRoom";
import VideoChat from "./components/VideoChat";

function MainRouter() {
  return (
    <Router>
      <Routes>
        {/* ✅ Root path pe Login page dikhayenge */}
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/editor/:roomId" element={<EditorRoom />} />
        <Route path="/spectate/:roomId" element={<SpectatorRoom />} />
        <Route path="/broadcast/:roomId" element={<BroadcasterRoom />} />
        <Route path="/room/:roomId" element={<VideoChat />} />
      </Routes>
    </Router>
  );
}

export default MainRouter;
