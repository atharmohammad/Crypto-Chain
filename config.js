const INITIAL_DIFFICULTY = 1;
const MINE_RATE = 1000;

const GENESIS_DATA = {
    timestamp:1,
    data:"Creation of genesis block",
    lastHash:"root of chain",
    hash:"<s> ",
    difficulty:INITIAL_DIFFICULTY,
    nonce:0
}

module.exports = {GENESIS_DATA,MINE_RATE}