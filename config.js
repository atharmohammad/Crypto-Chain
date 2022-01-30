const INITIAL_DIFFICULTY = 1;
const MINE_RATE = 1000;
const STARTING_BALANCE = 100;
const GENESIS_DATA = {
    timestamp:1,
    data:"Creation of genesis block",
    lastHash:"root of chain",
    hash:"<s> ",
    difficulty:INITIAL_DIFFICULTY,
    nonce:0
}

const REWARD_INPUT = {address:"*authorized-reward*"};
const MINING_REWARD = 10;

module.exports = {GENESIS_DATA,MINE_RATE,STARTING_BALANCE,REWARD_INPUT,MINING_REWARD};