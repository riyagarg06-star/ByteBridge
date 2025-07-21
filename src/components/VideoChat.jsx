import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:3001");

const VideoChat = () => {
  const { roomId } = useParams();
  const userVideo = useRef();
  const [peers, setPeers] = useState([]);
  const peersRef = useRef([]);
  const [stream, setStream] = useState(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(currentStream => {
      setStream(currentStream);
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }

      socket.emit("join-room", roomId);

      socket.on("all-users", users => {
        const peers = [];
        users.forEach(userID => {
          const peer = createPeer(userID, socket.id, currentStream);
          peersRef.current.push({ peerID: userID, peer });
          peers.push({ peerID: userID, peer });
        });
        setPeers(peers);
      });

      socket.on("user-joined", ({ callerId }) => {
        const peer = addPeer(callerId, currentStream);
        peersRef.current.push({ peerID: callerId, peer });
        setPeers(prev => [...prev, { peerID: callerId, peer }]);
      });

      socket.on("receive-signal", ({ from, signalData }) => {
        const item = peersRef.current.find(p => p.peerID === from);
        if (item) item.peer.signal(signalData);
      });

      socket.on("user-disconnected", userID => {
        const peerObj = peersRef.current.find(p => p.peerID === userID);
        if (peerObj) peerObj.peer.destroy();
        peersRef.current = peersRef.current.filter(p => p.peerID !== userID);
        setPeers(prev => prev.filter(p => p.peerID !== userID));
      });
    });

    return () => {
      socket.disconnect();
      peersRef.current.forEach(p => p.peer.destroy());
    };
  }, [roomId]);

  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on("signal", signal => {
      socket.emit("send-signal", { to: userToSignal, signalData: signal });
    });
    return peer;
  };

  const addPeer = (incomingSignalUser, stream) => {
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on("signal", signal => {
      socket.emit("return-signal", { to: incomingSignalUser, signalData: signal });
    });
    return peer;
  };

  const toggleMic = () => {
    stream.getAudioTracks()[0].enabled = !micOn;
    setMicOn(!micOn);
  };

  const toggleCam = () => {
    stream.getVideoTracks()[0].enabled = !camOn;
    setCamOn(!camOn);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>🎥 Live Video Chat</h2>
      <div>
        <button onClick={toggleMic} style={btnStyle}>
          {micOn ? "Mute Mic" : "Unmute Mic"}
        </button>
        <button onClick={toggleCam} style={btnStyle}>
          {camOn ? "Turn Off Camera" : "Turn On Camera"}
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginTop: "20px" }}>
        <video muted ref={userVideo} autoPlay playsInline style={videoStyle} />
        {peers.map(({ peerID, peer }) => (
          <Video key={peerID} peer={peer} />
        ))}
      </div>
    </div>
  );
};

const Video = ({ peer }) => {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", stream => {
      if (ref.current && !ref.current.srcObject) {
        ref.current.srcObject = stream;
      }
    });

    return () => {
      peer.removeAllListeners("stream");
    };
  }, [peer]);

  return <video playsInline autoPlay ref={ref} style={videoStyle} />;
};

const videoStyle = {
  width: "250px",
  margin: "10px",
  borderRadius: "8px",
  border: "2px solid #4caf50"
};

const btnStyle = {
  margin: "10px",
  padding: "10px 20px",
  fontSize: "16px",
  borderRadius: "5px",
  border: "none",
  backgroundColor: "#2196F3",
  color: "white",
  cursor: "pointer"
};

export default VideoChat;

