import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // Make sure backend is on port 3001
export default socket;
