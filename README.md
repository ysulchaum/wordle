# Wordle Game

## Overview
Wordle is a web-based word guessing game inspired by the popular Wordle game. It supports both **single-player** and **duo-player** modes, allowing users to play solo or compete with another player in real-time. The game is built using **React** with **TypeScript** for the frontend and **Node.js** with **Express** and **Socket.IO** for the backend, providing a seamless multiplayer experience. Players guess a 5-letter word within 6 attempts, receiving color-coded feedback (green, yellow, grey) to guide their guesses.

## Features
- **Single-Player Mode**: Play against a randomly generated 5-letter word.
- **Duo-Player Mode**: Compete with another player in real-time to guess the same secret word.
- **User Authentication**: Register and log in to access the game, with secure token-based authentication.
- **Real-Time Multiplayer**: Create or join game rooms using Socket.IO for live interaction.
- **Responsive UI**: Built with React and styled with CSS, featuring a clean and intuitive interface.
- **Feedback System**: Visual feedback with green (correct letter, correct position), yellow (correct letter, wrong position), and grey (incorrect letter) tiles.
- **Game State Management**: Tracks guesses, attempts, and game outcomes, with alerts for invalid words or game results.

## Tech Stack
- **Frontend**:
  - React with TypeScript
  - Material-UI (MUI) for alerts
  - Socket.IO client for real-time communication
  - Tailwind CSS (optional, if used in `App.css`, `Game.css`, or `Multi.css`)
- **Backend**:
  - Node.js with Express
  - Socket.IO for real-time multiplayer functionality
  - MongoDB (assumed, based on `connectToDB` in `server.ts`) for user data storage
- **Dependencies**:
  - `is-word` and `random-words` for word validation and generation
  - `dotenv` for environment variable management
  - `cors` for cross-origin resource sharing

## Installation
To run the Wordle game locally, follow these steps:

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Steps
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd wordle-game
   ```

2. **Install Dependencies**:
   - For the backend:
     ```bash
     cd backend
     npm install
     ```
   - For the frontend:
     ```bash
     cd frontend
     npm install
     ```

3. **Set Up Environment Variables**:
   - Create a `.env` file in the `backend` directory with the following:
     ```env
     PORT=3000
     MONGODB_URI=<your-mongodb-connection-string>
     VITE_API_BASE_URL=http://localhost:3000/api
     ```
   - Ensure `VITE_API_BASE_URL` is set in the frontend's `.env` file if needed.

4. **Run the Backend**:
   ```bash
   cd backend
   npm start
   ```
   The server will run on `http://localhost:3000` (or the specified `PORT`).

5. **Run the Frontend**:
   ```bash
   cd frontend
   npm start
   ```
   The React app will run on `http://localhost:5173` (default Vite port).

6. **Access the Game**:
   - Open `http://localhost:5173` in your browser.
   - Register a new account or log in to start playing.

## Usage
1. **Login/Register**:
   - On the landing page, register with a username and password or log in with existing credentials.
   - After logging in, you’ll be directed to the home page to choose a game mode.

2. **Single-Player Mode**:
   - Select "Single-player" from the home page.
   - Guess a 5-letter word using the on-screen keyboard.
   - Submit guesses to receive color-coded feedback.
   - Win by guessing the word within 6 attempts, or lose to reveal the secret word.

3. **Duo-Player Mode**:
   - Select "Multi-player" from the home page.
   - Choose to **create** a game (generates a room code) or **join** a game (enter a room code).
   - Click "I'm Ready" to start the game.
   - Compete to guess the word first, with real-time updates via Socket.IO.
   - The game ends when one player guesses correctly or both players exhaust their attempts (resulting in a draw).

4. **Logout**:
   - Click the "Logout" button on the home page to clear the session and return to the login screen.

## Project Structure
```
wordle-game/
frontend/src/
├── App.css
├── App.tsx
├── assets
├── Create.tsx
├── Game.css
├── Game.tsx
├── index.css
├── Join.tsx
├── main.tsx
├── Multi.css
├── Multi.tsx
├── OppGame.css
├── OppGame.tsx
├── Socket-setting.tsx
└── vite-env.d.ts
backend/src/
├── controllers
├── database
├── emitter
├── logic
├── middleware
├── models
├── routes
└── server.ts

```

## API Endpoints
- **Authentication**:
  - `POST /api/auth/register`: Register a new user.
  - `POST /api/auth/login`: Log in and receive an access token.
- **Game**:
  - `POST /api/game/start`: Start a new game (single or multiplayer).
  - `POST /api/game/guess`: Submit a guess and receive feedback.
  - `POST /api/game/result`: Retrieve the secret word (after game ends).

## Socket.IO Events
- **Emitted by Client**:
  - `ready`: Signals that a player is ready in a multiplayer game.
- **Emitted by Server**:
  - `startGame`: Notifies clients to start the multiplayer game.
  - `waitingForPlayers`: Informs clients that the game is waiting for players.
  - `gameResult`: Broadcasts the game outcome (win, loss, or draw).

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License
This project is licensed under the MIT License.

## Contact
For questions or support, please open an issue on the GitHub repository.
