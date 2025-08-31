const express = require("express");
const router = express.Router();
const gameController = require("../controllers/game-controller");
const authMiddleware = require("../middleware/auth-middleware");
const multiMiddleware = require("../middleware/mulit-middleware");

// Start a new game
router.post("/start", authMiddleware, gameController.startGame);

// Make a guess
router.post("/guess", authMiddleware, multiMiddleware, gameController.makeGuess);

// Review the secret word
router.post("/result", authMiddleware, multiMiddleware, gameController.reviewTheSecretWord);

module.exports = router;
