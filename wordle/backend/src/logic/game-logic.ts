// game logic of the Wordle game
const isWord = require('is-word');
const randomWords = require('random-words');
const theGuess = isWord('american-english');

interface Game{
    startNewGame(): void;
    makeGuess(word: string): boolean;
    isGameOver(): boolean;
    getCurrentState(): GameState;
    getResult(): Color;
}

interface Color{
    isEnd: boolean;
    isCorrect: boolean;
    timesOfGuess: number;
    green: number[];
    yellow: number[];
    grey: number[];
}

interface GameState {
    secretWord: string;
    maxAttempts: number;
    currentAttempt: number;
    guessedLetters: string[];
    currentGuess: string;
}

class WordleGame implements Game {
    private secretWord: string;
    private maxAttempts: number;
    private currentAttempt: number;
    private guessedLetters: string[];
    private currentGuess: string;
    private green: number[];
    private yellow: number[];
    private grey: number[];

    // randomWords.generate({ minLength: 5, maxLength: 5 }
    constructor(secretWord: string = randomWords.generate({ minLength: 5, maxLength: 5 }), maxAttempts: number = 6) {
        this.secretWord = secretWord;
        this.maxAttempts = maxAttempts;
        this.currentAttempt = 0;
        this.currentGuess = "";
        this.guessedLetters = [];
        this.green = [];
        this.yellow = [];
        this.grey = [];
    }

    startNewGame(): void {
        this.currentAttempt = 0;
        this.guessedLetters = [];
    }

    makeGuess(word: string): boolean {
        if (!theGuess.check(word)) {
            return false; // Invalid guess
        }
        this.currentGuess = word;
        
        this.green = []; // clear the array
        this.yellow = [];
        this.grey = [];
        for (let i = 0; i < word.length; i++) {
            if (word[i] === this.secretWord[i]) {
                this.green.push(i);
            } else if (this.secretWord.includes(word[i] ?? " ")) {
                this.yellow.push(i);
            } else {
                this.grey.push(i);
            }
        }
        this.guessedLetters.push(word);
        this.currentAttempt++;
        return true; // Valid guess
    }

    isGameOver(): boolean {
        return this.currentAttempt >= this.maxAttempts || this.currentGuess === this.secretWord;
    }

    getCurrentState(): GameState {
        return {
            secretWord: this.secretWord,
            maxAttempts: this.maxAttempts,
            currentAttempt: this.currentAttempt,
            currentGuess: this.currentGuess,
            guessedLetters: [...this.guessedLetters]
        };
    }

    getResult(): Color {
        return {
            isEnd: this.isGameOver(),
            isCorrect: this.currentGuess === this.secretWord,
            timesOfGuess: this.currentAttempt,
            green: this.green,
            yellow: this.yellow,
            grey: this.grey
        };
    }
}



module.exports = {
    WordleGame
};
