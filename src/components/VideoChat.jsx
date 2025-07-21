import React, { useEffect, useRef, useState, useCallback } from "react";
import Peer from "simple-peer";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

const VideoChat = () => {
  const { roomId } = useParams();
  const myVideo = useRef();
  const peersRef = useRef({});
  const [stream, setStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const addRemoteStream = useCallback((remoteStream, userId) => {
    setRemoteStreams((prev) => {
      if (prev.find((v) => v.id === userId)) return prev;
      return [...prev, { stream: remoteStream, id: userId }];
    });
  }, []);

  const createPeer = useCallback(
    (userToSignal, stream) => {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
      });

      peer.on("signal", (signal) => {
        socket.emit("send-signal", {
          to: userToSignal,
          signalData: signal,
        });
      });

      peer.on("stream", (remoteStream) => {
        addRemoteStream(remoteStream, userToSignal);
      });

      return peer;
    },
    [addRemoteStream]
  );

  const addPeer = useCallback(
    (userId, stream, incomingSignal) => {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
      });

      peer.on("signal", (signal) => {
        socket.emit("return-signal", {
          to: userId,
          signalData: signal,
        });
      });

      peer.on("stream", (remoteStream) => {
        addRemoteStream(remoteStream, userId);
      });

      peer.signal(incomingSignal);
      return peer;
    },
    [addRemoteStream]
  );

  useEffect(() => {
    const init = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        socket.emit("join-room", roomId);

        socket.on("all-users", (users) => {
          users.forEach((userId) => {
            const peer = createPeer(userId, currentStream);
            peersRef.current[userId] = peer;
          });
        });

        socket.on("receive-signal", ({ from, signalData }) => {
          const peer = addPeer(from, currentStream, signalData);
          peersRef.current[from] = peer;
        });

        socket.on("receive-returned-signal", ({ from, signalData }) => {
          const peer = peersRef.current[from];
          if (peer) {
            peer.signal(signalData);
          }
        });

        socket.on("user-disconnected", (userId) => {
          if (peersRef.current[userId]) {
            peersRef.current[userId].destroy();
            delete peersRef.current[userId];
            setRemoteStreams((prev) => prev.filter((v) => v.id !== userId));
          }
        });
      } catch (err) {
        console.error("Error accessing camera/mic:", err);
        alert("⚠️ Please allow camera and mic access or check if your device has one.");
      }
    };

    init();

    return () => {
      socket.disconnect();
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [roomId, createPeer, addPeer]);

  const toggleMute = () => {
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsCameraOff(!isCameraOff);
  };

  return (
    <div className="video-chat">
      <h2 style={{ textAlign: "center" }}>🎥 ByteBridge Video Chat</h2>

      <div
        className="videos"
        style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}
      >
        <video
          ref={myVideo}
          autoPlay
          muted
          playsInline
          style={{ width: "250px", border: "2px solid blue", borderRadius: "10px" }}
        />
        {remoteStreams.map(({ stream, id }) => (
          <video
            key={id}
            autoPlay
            playsInline
            ref={(video) => {
              if (video && !video.srcObject) video.srcObject = stream;
            }}
            style={{ width: "250px", border: "2px solid green", borderRadius: "10px" }}
          />
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={toggleMute} style={buttonStyle}>
          {isMuted ? "Unmute" : "Mute"}
        </button>
        <button onClick={toggleCamera} style={buttonStyle}>
          {isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
        </button>
      </div>
    </div>
  );
};

const buttonStyle = {
  margin: "10px",
  padding: "10px 20px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
};

export default VideoChat;
