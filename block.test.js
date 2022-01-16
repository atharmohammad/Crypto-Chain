const Block = require("./block")
const {GENESIS_DATA} = require("./config")
const cryptoHash = require("./crypto-hash")

describe("Block",()=>{
    const block = {
        timestamp:22,
        data:"transaction of $44",
        lastHash:"last block hash",
        hash:"current block hash"
    }

    test("block with correct fields",()=>{
        const newBlock = new Block(block);
        expect(newBlock).toEqual(block)
    })

    describe("genesis()",()=>{
        test("Genesis block instance",()=>{
            const genesis_block = Block.genesis();
            expect(genesis_block instanceof Block).toBe(true);
        })
        test("Genesis Block Data",()=>{
            const genesis_block = Block.genesis();
            expect(genesis_block).toEqual(GENESIS_DATA);
        })
    })
})

describe("Mine Block",()=>{
    const last_block = Block.genesis();
    const data = "mined data"
    const mined_block = Block.mineBlock({last_block,data});
    test("return a Block instance",()=>{
        expect(mined_block instanceof Block).toBe(true);
    })
    test("sets `lastHash` to `hash` of lastBlock",()=>{
        expect(mined_block.lastHash).toEqual(last_block.hash)
    })
    test("sets `timestamp`",()=>{
        expect(mined_block.timestamp).not.toEqual(undefined)
    })
    test("sets `data`",()=>{
        expect(mined_block.data).not.toEqual(undefined)
    })
    test("create a `SHA256` hash with proper inputs",()=>{
        expect(mined_block.hash).toEqual(cryptoHash(mined_block.timestamp,mined_block.lastHash,mined_block.data))
    })
})