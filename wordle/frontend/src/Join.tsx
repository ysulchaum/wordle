import { useState } from "react";
import Multi from "./Multi";
import socket from "./Socket-setting";

function Join() {
  const [message, setMessage] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [page, setPage] = useState("join");

  const joinRoom = async () => {
    try {
      if (roomCode.trim() === "") {
        setMessage("Room code cannot be empty");
        return;
      }
      socket.emit("joinRoom", {
        accessToken: localStorage.getItem("accessToken"),
        roomId: roomCode,
      });
    } catch (error) {
      setMessage("Error joining room");
    }
  };

  const leaveRoom = async () => {
    socket.emit("leaveRoom", {
      accessToken: localStorage.getItem("accessToken"),
      roomId: roomCode,
    });
  };

  socket.on("joinedRoom", (data) => {
    if (!data) {
      setMessage("Error creating room");
      return;
    }
    setMessage(`${data.username} has joined the ${data.roomId}.`);
    setPage("multi");
  });

  socket.on("leftRoom", (data) => {
    setMessage(`${data.username} has left the ${data.roomId}.`);
  });

  return (
    <>
      { page === "join" && (
        <div>
            <div>
                <h2>Join Game</h2>
            </div>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Enter room code"
          />
          <button onClick={joinRoom}>Join Room</button>
          <button onClick={leaveRoom}>Leave Room</button>
          <div>{message}</div>
        </div>
      )}
      { page === "multi" && (
        <Multi roomCode={roomCode} />
      )}
    </>
  );
}

export default Join;
