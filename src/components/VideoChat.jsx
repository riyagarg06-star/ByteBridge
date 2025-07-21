import React, { useEffect, useRef, useState, useCallback } from "react";
import Peer from "simple-peer";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

const VideoChat = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const myVideo = useRef(null);
  const peersRef = useRef({});
  const [stream, setStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);

  const username = sessionStorage.getItem("username");

  const addRemoteStream = useCallback((remoteStream, userId) => {
    setRemoteStreams(prev => {
      if (prev.find(v => v.id === userId)) return prev;
      return [...prev, { stream: remoteStream, id: userId }];
    });
  }, []);

  const createPeer = useCallback((userToSignal, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", signal => {
      socket.emit("send-signal", {
        to: userToSignal,
        signalData: signal,
      });
    });

    peer.on("stream", remoteStream => {
      addRemoteStream(remoteStream, userToSignal);
    });

    return peer;
  }, [addRemoteStream]);

  const addPeer = useCallback((userId, stream, incomingSignal) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", signal => {
      socket.emit("return-signal", {
        to: userId,
        signalData: signal,
      });
    });

    peer.on("stream", remoteStream => {
      addRemoteStream(remoteStream, userId);
    });

    peer.signal(incomingSignal);
    return peer;
  }, [addRemoteStream]);

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }

    let isMounted = true;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(currentStream => {
        if (!isMounted) return;

        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        socket.emit("join-room", roomId);

        socket.on("all-users", users => {
          users.forEach(userId => {
            if (!peersRef.current[userId]) {
              const peer = createPeer(userId, currentStream);
              peersRef.current[userId] = peer;
            }
          });
        });

        socket.on("user-joined", userId => {
          console.log("User joined:", userId);
        });

        socket.on("receive-signal", ({ from, signalData }) => {
          if (!peersRef.current[from]) {
            const peer = addPeer(from, currentStream, signalData);
            peersRef.current[from] = peer;
          }
        });

        socket.on("receive-returned-signal", ({ from, signalData }) => {
          const peer = peersRef.current[from];
          if (peer) {
            peer.signal(signalData);
          }
        });

        socket.on("user-disconnected", userId => {
          if (peersRef.current[userId]) {
            peersRef.current[userId].destroy();
            delete peersRef.current[userId];
            setRemoteStreams(prev => prev.filter(p => p.id !== userId));
          }
        });
      })
      .catch(err => {
        console.error("Error accessing media devices:", err);
        alert("⚠️ Please allow camera and mic access.");
      });

    return () => {
      isMounted = false;
      socket.disconnect();
      Object.values(peersRef.current).forEach(peer => peer.destroy());
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [roomId, username, navigate, createPeer, addPeer]);

  const handleLogout = () => {
    sessionStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="video-chat">
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px" }}>
        <h2>👋 Welcome, {username}</h2>
        <button onClick={handleLogout} style={{
          padding: "6px 14px",
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}>
          Logout
        </button>
      </div>

      <div className="videos" style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
        <video
          ref={myVideo}
          autoPlay
          muted
          playsInline
          style={{ width: "250px", border: "2px solid #00f", borderRadius: "8px" }}
        />
        {remoteStreams.map(({ stream, id }) => (
          <video
            key={id}
            autoPlay
            playsInline
            ref={video => {
              if (video && !video.srcObject) video.srcObject = stream;
            }}
            style={{ width: "250px", border: "2px solid green", borderRadius: "8px" }}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoChat;
