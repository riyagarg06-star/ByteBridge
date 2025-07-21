import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:3001");

const SpectatorRoom = () => {
  const { roomId } = useParams();
  const peersRef = useRef({});
  const [remoteStreams, setRemoteStreams] = useState([]);

  useEffect(() => {
    socket.emit("join-as-spectator", roomId); // ✅ Correct join event

    socket.on("all-users", (users) => {
      users.forEach((userId) => {
        if (!peersRef.current[userId]) {
          const peer = createReceiveOnlyPeer(userId);
          peersRef.current[userId] = peer;
        }
      });
    });

    socket.on("user-joined", ({ callerId }) => {
      if (!peersRef.current[callerId]) {
        const peer = createReceiveOnlyPeer(callerId);
        peersRef.current[callerId] = peer;
      }
    });

    socket.on("receive-signal", ({ from, signalData }) => {
      let peer = peersRef.current[from];
      if (!peer) {
        peer = createReceiveOnlyPeer(from);
        peersRef.current[from] = peer;
      }
      peer.signal(signalData);
    });

    socket.on("receive-returned-signal", ({ from, signalData }) => {
      const peer = peersRef.current[from];
      if (peer) peer.signal(signalData);
    });

    socket.on("user-disconnected", (userId) => {
      const peer = peersRef.current[userId];
      if (peer) peer.destroy();
      delete peersRef.current[userId];
      setRemoteStreams((prev) => prev.filter((v) => v.id !== userId));
    });

    return () => {
      socket.disconnect();
      Object.values(peersRef.current).forEach((peer) => peer.destroy());
    };
  }, [roomId]);

  const createReceiveOnlyPeer = (userId) => {
    const peer = new Peer({ initiator: true, trickle: false });

    peer.on("signal", (signal) => {
      socket.emit("send-signal", { to: userId, signalData: signal });
    });

    peer.on("stream", (remoteStream) => {
      setRemoteStreams((prev) => {
        const alreadyExists = prev.find((v) => v.id === userId);
        if (alreadyExists) return prev;

        return [...prev, { id: userId, stream: remoteStream }];
      });
    });

    peer.on("close", () => {
      setRemoteStreams((prev) => prev.filter((v) => v.id !== userId));
    });

    return peer;
  };

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <h2>👀 Spectator View (Read-Only)</h2>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
        {remoteStreams.map(({ stream, id }) => (
          <video
            key={id}
            autoPlay
            playsInline
            muted
            ref={(video) => {
              if (video && video.srcObject !== stream) {
                video.srcObject = stream;
              }
            }}
            style={{ width: "300px", border: "2px solid green", borderRadius: "8px" }}
          />
        ))}
      </div>
    </div>
  );
};

export default SpectatorRoom;
