import { useState } from "react";
import Alert from "@mui/material/Alert";
import socket from "./Socket-setting";
import "./Game.css";

interface GameProps {
  isDuo?: boolean;
  roomCode?: string;
}

function Game({ isDuo = false, roomCode = "" }: GameProps) {
  const [word, setWord] = useState("");
  const [wordList, setWordList] = useState<string[]>([]);
  const [warning, setWarning] = useState("");
  const [triggerWarning, setTriggerWarning] = useState(false);
  const [success, setSuccess] = useState("");
  const [triggerSuccess, setTriggerSuccess] = useState(false);
  const [numOfAttempts, setNumOfAttempts] = useState(0);

  // Store color states for each row
  const [rowColors, setRowColors] = useState<string[][]>(
    Array.from({ length: 6 }, () => Array(5).fill("white"))
  );

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  const rows = 6;
  const cols = 5;
  const twoDArray: string[][] = Array.from({ length: rows }, () =>
    Array(cols).fill("")
  );

  // Update twoDArray with submitted words and current word
  wordList.forEach((w, i) => {
    w.split("").forEach((char, j) => {
      twoDArray[i][j] = char;
    });
  });
  if (numOfAttempts < rows) {
    word.split("").forEach((char, j) => {
      twoDArray[numOfAttempts][j] = char;
    });
  }

  const handleAddLetterClick = async (letter: string) => {
    if (word.length >= 5) return;
    setWord((prev) => prev + letter);
  };

  const handleDeleteLetterClick = async () => {
    if (word.length <= 0) return;
    setWord((prev) => prev.slice(0, -1));
  };

  const handleColorTiles = (rowIndex: number, colIndex: number): string => {
    if (rowIndex < wordList.length) {
      // for solo player mode
      return rowColors[rowIndex][colIndex];
    }

    return "white";
  };

  const getSecretWord = async (): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/game/result`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          isSolo: !isDuo,
          roomId: roomCode,
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch secret word");
      const data = await response.json();
      return data.secretWord;
    } catch (error) {
      console.error("Error fetching secret word:", error);
      return "apple"; // Fallback secret word
    }
  };

  const handleSubmit = async () => {
    if (word.length !== 5) {
      setWarning("Word must be 5 letters");
      setTriggerWarning(true);
      setTimeout(() => setTriggerWarning(false), 2500);
      return;
    }

    if (numOfAttempts >= 6) return;

    try {
      console.log("test Submitting guess:", word);
      const response = await fetch(`${API_BASE_URL}/game/guess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          guess: word,
          isSolo: !isDuo,
          roomId: roomCode,
          socketId: socket.id,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Guess successful:", data);
        const newRowColors = [...rowColors];
        const currentRow = wordList.length; // Row to color (before adding new word)
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

        setWordList((prev) => [...prev, word]);
        setNumOfAttempts((prev) => prev + 1);
        setWord("");

        if (data.isCorrect) {
          setSuccess("Congratulations! You guessed the word.");
          setTriggerSuccess(true);
        }else if (data.isEnd) {
          setSuccess(`Game over! The secret word is ${await getSecretWord()}`);
          setTriggerSuccess(true);
        }
      } else {
        console.error("Guess failed");
        setWarning("Wrong spelling");
        setTriggerWarning(true);
        setTimeout(() => setTriggerWarning(false), 2500);
        setWord("");
      }
    } catch (error) {
      console.error("Error occurred during guess:", error);
    }
  };

  return (
    <div className="game-container">
      <div className="wordle-grid">
        {twoDArray.map((row, i) => (
          <div key={i} className="wordle-row">
            {row.map((letter, j) => (
              <div
                key={`${i}-${j}`}
                className={`wordle-tile ${handleColorTiles(i, j)}`}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>
      
        <div className="wordle-keyboard">
          {Array.from("qwertyuiop").map((letter) => (
            <button key={letter} onClick={() => handleAddLetterClick(letter)}>
              {letter}
            </button>
          ))}
          <br />
          {Array.from("asdfghjkl").map((letter) => (
            <button key={letter} onClick={() => handleAddLetterClick(letter)}>
              {letter}
            </button>
          ))}
          <br />
          {Array.from("zxcvbnm").map((letter) => (
            <button key={letter} onClick={() => handleAddLetterClick(letter)}>
              {letter}
            </button>
          ))}
          <button onClick={() => handleSubmit()}>ENTER</button>
          <button onClick={() => handleDeleteLetterClick()}>BACK</button>
        </div>
      
      {triggerWarning && (
        <Alert className="warning-toast" severity="warning">
          {warning}
        </Alert>
      )}
      {triggerSuccess && (
        <Alert className="success-toast" severity="success">
          {success}
        </Alert>
      )}
    </div>
  );
}

export default Game;
