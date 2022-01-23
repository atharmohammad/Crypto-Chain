const {GENESIS_DATA,MINE_RATE} = require('./config');
const cryptoHash = require('./crypto-hash');
const hextohash = require("hex-to-binary")

class Block{
    constructor(args){
        this.timestamp = args.timestamp,
        this.data = args.data,
        this.lastHash = args.lastHash,
        this.hash = args.hash
        this.nonce = args.nonce,
        this.difficulty = args.difficulty
    }
    static genesis(){
        return new Block(GENESIS_DATA)
    }
    static mineBlock({last_block,data}){
        const lastHash = last_block.hash; 
        let nonce = 0 , difficulty,hash,timestamp;
        do{
            timestamp = Date.now();
            nonce++;
            difficulty = Block.adjustDifficulty({original_block:last_block,timestamp})
            hash = cryptoHash(timestamp,lastHash,data,nonce,difficulty);
        }while("0".repeat(difficulty) != hextohash(hash).substring(0,difficulty))

        return new Block({
            timestamp,
            data,
            lastHash,
            nonce,
            difficulty,
            hash
        })
    }
    static adjustDifficulty({original_block,timestamp}){
        const difficulty = original_block.difficulty;
        if(difficulty < 1)return 1;
        
        if((timestamp - original_block.timestamp) > MINE_RATE){
            return difficulty - 1;
        }
        return difficulty + 1;
    }
}

module.exports = Block