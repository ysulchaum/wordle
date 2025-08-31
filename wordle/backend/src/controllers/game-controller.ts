import type { Request, Response } from 'express';
import dist = require('socket.io');
const {dataEmitter, state} = require("../emitter/dataEmitter");
const game = require('../logic/game-logic');

declare global {
    namespace Express {
        interface Request {
            userInfo?: any;
            isSoloMode?: boolean;
            sendRoomId?: string;
            socketId?: string;
        }
    }
}

const userGames = new Map<string, any>(); // Store game instances per user ID

const startGame = async (req: Request, res: Response) => {
    try {
        const { userId } = req.userInfo; // Get user ID from request
        const wordleGame = new game.WordleGame();
        wordleGame.startNewGame();
        userGames.set(userId, wordleGame);
        res.json({
            success: true,
            message: "New game started"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const makeGuess = async (req: Request, res: Response) => {
    try {
        const { userId, username } = req.userInfo; // Get user ID from request
        const wordleGame = userGames.get(userId);
        const { guess } = req.body;
        if (!wordleGame) {
            return res.status(400).json({
                success: false,
                message: "Game not started"
            });
        }

        const executeTheGuess = wordleGame.makeGuess(guess); // execute the guess
        if (!executeTheGuess) { // check if the guess was valid
            return res.status(400).json({
                success: false,
                message: "Invalid word! Please try again."
            });
        }

        const result = wordleGame.getResult(); // get the result of the guess
        console.log(`show mode: ${JSON.stringify(req.isSoloMode)}`)
        if (!req.isSoloMode) {
            // Handle multi-player mode specific logic
            // pass the json data to multi-player-routes.ts
            // and then using socket.io to emit the event
            console.log("makeGuess game controller: ", req.socketId);
            state.isWordGuessListenerRegistered = false;
            dataEmitter.emit("wordGuessInter", { //don't know why emit 4 times? need to fix
                resultData: {
                    success: true,
                    message: "Guess received",
                    username: username,
                    isCorrect: result.isCorrect,
                    isEnd: result.isEnd, // check if the game is over
                    timesOfGuess: result.timesOfGuess,
                    green: result.green,
                    yellow: result.yellow,
                    grey: result.grey
                },
                roomId: req.sendRoomId,
                socketId: req.socketId
            });
        }

        res.json({
            success: true,
            message: "Guess received",
            isCorrect: result.isCorrect,
            isEnd: result.isEnd, // check if the game is over
            timesOfGuess: result.timesOfGuess,
            green: result.green,
            yellow: result.yellow,
            grey: result.grey
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const reviewTheSecretWord = async (req: Request, res: Response) => {
    try {
        const { userId, username } = req.userInfo; // Get user ID from request
        const wordleGame = userGames.get(userId);

        if (!wordleGame) { // Check if the game is started
            return res.status(400).json({
                success: false,
                message: "Game not started"
            });
        }
        if (!wordleGame.getResult().isEnd) { // Prevent revealing secret word if game is not over
            return res.status(400).json({
                success: false,
                message: "Game has not ended"
            });
        }
        const result = wordleGame.getResult(); // get the result of the guess
        const getCurrentState = wordleGame.getCurrentState();
        state.isWordGuessListenerRegistered = false;
        if (!req.isSoloMode) {
            // Handle multi-player mode specific logic
            // pass the json data to multi-player-routes.ts
            // and then using socket.io to emit the event
            dataEmitter.emit("gameResult", {
                secretWord: getCurrentState.secretWord,
                roomId: req.sendRoomId,
                isCorrect: result.isCorrect,
                username: username
            });
        }

        res.json({
            success: true,
            message: "Revealing secret word",
            secretWord: getCurrentState.secretWord,    
        });

        if (userGames.get(userId)) {
            userGames.delete(userId); // Clear the game instance after revealing the word
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    startGame,
    makeGuess,
    reviewTheSecretWord
};
