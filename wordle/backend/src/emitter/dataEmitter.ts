const { EventEmitter } = require("events");
const dataEmitter = new EventEmitter();

const state = {
    isWordGuessListenerRegistered: false
};

module.exports = { dataEmitter, state };
