const {GENESIS_DATA} = require('./config');
const cryptoHash = require('./crypto-hash');

class Block{
    constructor(args){
        this.timestamp = args.timestamp,
        this.data = args.data,
        this.lastHash = args.lastHash,
        this.hash = args.hash
    }
    static genesis(){
        return new Block(GENESIS_DATA)
    }
    static mineBlock({last_block,data}){
        const timestamp = new Date();
        const lastHash = last_block.hash;
        return new Block({
            timestamp,
            data,
            lastHash,
            hash:cryptoHash(timestamp,lastHash,data)
        })
    }
}

const block = new Block({
    timestamp:new Date(),
    data:"transaction of $44",
    lastHash:"last block hash",
    hash:"current block hash"
})

module.exports = Block