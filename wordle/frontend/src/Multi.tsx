import { useState, useEffect } from "react";
import "./Multi.css";
import Game from "./Game";
import OppGame from "./OppGame";
import socket from "./Socket-setting";

function Multi({ roomCode }: { roomCode: string }) {
  const [message, setMessage] = useState("");
  const [page, setPage] = useState("ready?");
  const [countDraw, setCountDraw] = useState(0);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  useEffect(() => {
    const handleStartGame = async () => {
      setMessage("Game is starting...");
      console.log("Received startGame event");
      try {
        const response = await fetch(`${API_BASE_URL}/game/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          console.log("Game started successfully from Multi.tsx:", data);
        } else {
          console.error("Game start failed");
        }
      } catch (error) {
        console.error("Error occurred during game start:", error);
      }
      setPage("start");
      setMessage("");
    };

    const handleWaitingForPlayers = ({ roomId }: { roomId: string }) => {
      console.log(`Received waitingForPlayers event for room ${roomId}`);
      setMessage(`Waiting for other players in room ${roomId}...`);
    };

    const handleGameResult = (data: any) => {
      console.log("Received gameResult event:", data);
      if (data.isCorrect) {
        setMessage(`Correct! ${data.username} wins!`);
        return;
      }
      if (countDraw === 2) {
        setMessage(`Game over! It's a draw!`);
        setCountDraw(0);
        return;
      }
      if (!data.isCorrect) {
        console.log("Player draw detected");
        setCountDraw((prev) => prev + 1);
      }
    };

    socket.on("startGame", handleStartGame);
    socket.on("waitingForPlayers", handleWaitingForPlayers);
    socket.on("gameResult", handleGameResult);

    // Cleanup all listeners
    return () => {
      socket.off("startGame", handleStartGame);
      socket.off("waitingForPlayers", handleWaitingForPlayers);
      socket.off("gameResult", handleGameResult);
    };
  }, [roomCode]);


  const handleReady = () => {
    socket.emit("ready", {
      accessToken: localStorage.getItem("accessToken"),
      roomId: roomCode,
    });
  };

  return (
    <>
      {page === "ready?" && (
        <div>
          <h2>Are you ready?</h2>
          <button onClick={handleReady}>I'm Ready</button>
          <h1>{message}</h1>
        </div>
      )}
      {page === "start" && (
        <div className="game-panel">
          <Game isDuo={true} roomCode={roomCode} />
          <h1>{message}</h1>
          <OppGame />
        </div>
      )}
    </>
  );
}

export default Multi;
