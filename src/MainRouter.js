import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import JoinRoom from "./pages/JoinRoom";
import EditorRoom from "./pages/EditorRoom";
import SpectatorRoom from "./pages/SpectatorRoom";
import BroadcasterRoom from "./pages/BroadcasterRoom";

function MainRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:roomId" element={<EditorRoom />} />
        <Route path="/join" element={<JoinRoom />} />
        <Route path="/spectate/:roomId" element={<SpectatorRoom />} />
        <Route path="/broadcast/:roomId" element={<BroadcasterRoom />} />
      </Routes>
    </Router>
  );
}

export default MainRouter;
