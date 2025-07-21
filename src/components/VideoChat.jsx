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
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const addRemoteStream = useCallback((remoteStream, userId) => {
    setRemoteStreams((prev) => {
      if (prev.find((v) => v.id === userId)) return prev;
      return [...prev, { stream: remoteStream, id: userId }];
    });
  }, []);

  const createPeer = useCallback((userToSignal, stream) => {
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
  }, [addRemoteStream]);

  const addPeer = useCallback((userId, stream, incomingSignal) => {
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
  }, [addRemoteStream]);

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

        socket.on("user-joined", (userId) => {
          // user joined, wait for their signal
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
        console.error("Media access error:", err);
        alert("⚠️ Please allow camera/mic access.");
      }
    };

    init();

    return () => {
      socket.disconnect();
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [roomId, createPeer, addPeer]);

  // Toggle mic on/off
  const toggleMic = () => {
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  // Toggle cam on/off
  const toggleCam = () => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamOn(videoTrack.enabled);
    }
  };

  return (
    <div className="video-chat">
      <h2>ByteBridge Video Chat</h2>
      <div className="videos" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
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
            ref={(video) => {
              if (video && !video.srcObject) video.srcObject = stream;
            }}
            style={{ width: "250px", border: "2px solid green", borderRadius: "8px" }}
          />
        ))}
      </div>

      <div style={{ marginTop: "15px" }}>
        <button onClick={toggleMic} style={{ marginRight: "10px" }}>
          {micOn ? "Mute Mic 🎤" : "Unmute Mic 🔇"}
        </button>
        <button onClick={toggleCam}>
          {camOn ? "Turn Off Camera 📷" : "Turn On Camera 🚫"}
        </button>
      </div>
    </div>
  );
};

export default VideoChat;
