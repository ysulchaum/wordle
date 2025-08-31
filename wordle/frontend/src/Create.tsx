import { useState } from "react";
import Multi from "./Multi";
import socket from "./Socket-setting";


function Create() {
  const [message, setMessage] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [page, setPage] = useState("create");

  const createRoom = async (roomCode: string) => {
    try {
      if (roomCode.trim() === "") {
        setMessage("Room code cannot be empty");
        return;
      }
      socket.emit("createRoom", {
        accessToken: localStorage.getItem("accessToken"),
        roomId: roomCode,
      });
    } catch (error) {
      setMessage("Error creating room");
    }
  };
  socket.on("roomCreated", (data) => {
    if (!data) {
      setMessage("Error creating room");
      return;
    }
    setMessage(`<${data.roomId}> Room created by ${data.username}`);
    setPage("multi");
  });

  return (
    <>
      {page === "create" && (
        <div>
            <div>
                <h2>Create Game</h2>
            </div>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Enter room code"
          />
          <button onClick={() => createRoom(roomCode)}>Create Room</button>
          <div>{message}</div>
        </div>
      )}

      {page === "multi" && (
        <Multi roomCode={roomCode}/>
      )}
    </>

  );
}

export default Create;
