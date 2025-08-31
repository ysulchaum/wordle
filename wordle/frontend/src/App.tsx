import { useState } from "react";
import "./App.css";
import Game from "./Game";
import Create from "./Create";
import Join from "./Join";

function App() {
  const [page, setPage] = useState("login");

  const [loginPassword, setLoginPassword] = useState("");
  const [loginUsername, setLoginUsername] = useState("");

  const [registerPassword, setRegisterPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Login successful:", data);

        localStorage.setItem("accessToken", data.accessToken);
        setPage("home");
      } else {
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Error occurred during login:", error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: registerUsername,
          password: registerPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Registration successful:", data);
        setPage("login");
      } else {
        console.error("Registration failed");
      }
    } catch (error) {
      console.error("Error occurred during registration:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setPage("login");
  };

  const handleGameStart = async () => {
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
        console.log("Game started successfully from App.tsx:", data);
      } else {
        console.error("Game start failed");
      }
    } catch (error) {
      console.error("Error occurred during game start:", error);
    }
  };

  return (
    <>
      <div>
        <h1>Wordle</h1>
      </div>
      {page === "login" && (
        <div className="login">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div>
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            <p>
              Don't have an account?{" "}
              <a
                style={{ cursor: "pointer" }}
                onClick={() => setPage("register")}
              >
                Register
              </a>
            </p>
            <button type="submit">Login</button>
          </form>
        </div>
      )}

      {page === "register" && (
        <div className="register">
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <div>
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                onChange={(e) => setRegisterUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
            </div>
            <p>
              Already have an account?{" "}
              <a style={{ cursor: "pointer" }} onClick={() => setPage("login")}>
                Login
              </a>
            </p>
            <button type="submit">Register</button>
          </form>
        </div>
      )}

      {page === "home" && (
        <div className="home">
          <h2>Choose your mode</h2>
          <div className="mode-selection">
            <div
              className="single-player-button"
              onClick={() => {
                setPage("single-player");
                handleGameStart();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="white"
                className="bi bi-person-fill"
                viewBox="0 0 16 16"
              >
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
              </svg>
              Single-player
            </div>

            <div
              className="multi-player-button"
              onClick={() => setPage("multi-player-lobby")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="white"
                className="bi bi-people-fill"
                viewBox="0 0 16 16"
              >
                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
              </svg>
              Multi-player
            </div>
          </div>
          <div className="logout-button" onClick={handleLogout}>
            Logout
          </div>
        </div>
      )}

      {page === "single-player" && (
        <div className="single-player">
          <div className="game-title">
            <h2>Single-player</h2>
            <button onClick={() => setPage("home")}>Home</button>
          </div>
          <Game />
        </div>
      )}

      {page === "multi-player-lobby" && (
        <div className="multi-player">
          <div className="game-title">
            <h2>Multi-player</h2>
            <button onClick={() => setPage("home")}>Home</button>
          </div>
          <div className="mode-selection">
            <div
              className="create-game-button"
              onClick={() => setPage("create-game")}
            >
              Create a game
            </div>
            <div
              className="join-game-button"
              onClick={() => setPage("join-game")}
            >
              Join a game
            </div>
          </div>
        </div>
      )}

      {page === "create-game" && (
        <div>
          <button onClick={() => setPage("home")}>Home</button>
          <Create />
        </div>
      )}

      {page === "join-game" && (
        <div>
          <button onClick={() => setPage("home")}>Home</button>
          <Join />
        </div>
      )}
    </>
  );
}

export default App;
