const Block = require("./block")
const cryptoHash = require('./crypto-hash');

class BlockChain{
    constructor(){
        this.chain = [Block.genesis()]
    }

    addBlock({data}){
        const newBlock = Block.mineBlock({
          last_block: this.chain[this.chain.length - 1],
          data,
        });
        this.chain.push(newBlock);
    }

    static isValidChain(chain){
        if(JSON.stringify(chain[0]) != JSON.stringify(Block.genesis())){
            return false;
        }

        for(let i = 1; i<chain.length; i++){
            if (
                chain[i].lastHash != chain[i - 1].hash ||
                chain[i].hash !=
                cryptoHash(
                    chain[i].timestamp,
                    chain[i].lastHash,
                    chain[i].data
                )
            ) {
              return false;
            }
        }
        return true;
    }

    replace(newchain){
        if(newchain.length <= this.chain.length){
            console.error("chain must be longer !");
            return;
        }
        if(!BlockChain.isValidChain(newchain)){
            console.error("chain must be valid !");
            return;
        }
        this.chain = newchain;
        console.log("chain is replace with ",newchain)
        return;
    }

}

module.exports = BlockChain