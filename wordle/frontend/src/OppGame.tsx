import { useState, useEffect } from "react";
import "./OppGame.css";
import socket from "./Socket-setting";

function OppGame() {
  // opponent game panel for display only
  const [wordList, setWordList] = useState<string[]>([]);
  const [opponentIsState, setOpponentIsState] = useState("");
  const [rowColors, setRowColors] = useState<string[][]>(
    Array.from({ length: 6 }, () => Array(5).fill("white"))
  );

  const rows = 6;
  const cols = 5;
  const twoDArray: string[][] = Array.from({ length: rows }, () =>
    Array(cols).fill("")
  );

  useEffect(() => {
    // Handle opponent's guess render color
    const handleWordGuess = (data: any) => {
      console.log(`Opponent's guess: ${data}, socket: ${socket.id}`);
      const newRowColors = [...rowColors];
      const currentRow = wordList.length; // Row to color
      newRowColors[currentRow] = Array(5).fill("white"); // Reset row colors
      data.green.forEach((index: number) => {
        newRowColors[currentRow][index] = "green";
      });
      data.yellow.forEach((index: number) => {
        newRowColors[currentRow][index] = "yellow";
      });
      data.grey.forEach((index: number) => {
        newRowColors[currentRow][index] = "grey";
      });
      setRowColors(newRowColors);

      console.log("Green indices:", data.green);
      console.log("Yellow indices:", data.yellow);
      console.log("Grey indices:", data.grey);

      setWordList((prev) => [...prev, data.guess || ""]);
    };

    setOpponentIsState(
      opponentWin(rowColors)
        ? "won"
        : opponentDraw(rowColors)
        ? "draw"
        : "playing"
    );
    console.log("Opponent state:", opponentIsState);

    socket.on("wordGuess", handleWordGuess);

    // Cleanup listener on unmount
    return () => {
      socket.off("wordGuess", handleWordGuess);
    };
  }, [wordList, rowColors]);

  const handleColorTiles = (rowIndex: number, colIndex: number): string => {
    if (rowIndex < wordList.length) {
      // for solo player mode
      return rowColors[rowIndex][colIndex];
    }

    return "white";
  };

  const opponentWin = (twoDArray: string[][]) => {
    return twoDArray.some((row) => row.every((cell) => cell === "green"));
  };

  const opponentDraw = (twoDArray: string[][]) => {
    return (
      !twoDArray.some((row) => row.every((color) => color === "green")) &&
      !twoDArray.flat().includes("white")
    );
  };

  return (
    <>
      <div>
        <h3>Opponent's Guesses</h3>

        <div className="Owordle-grid">
          {twoDArray.map((row, i) => (
            <div key={i} className="Owordle-row">
              {row.map((letter, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`Owordle-tile ${handleColorTiles(i, j)}`}
                >
                  {letter}
                </div>
              ))}
            </div>
          ))}
          <div>
            {opponentIsState === "won" && (
              <h2 className="opponent-win">Your opponent has won!</h2>
            )}
            {opponentIsState === "draw" && (
              <h2 className="opponent-draw">Your opponent cannot guess the word!</h2>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default OppGame;
