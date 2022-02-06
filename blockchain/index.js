const Block = require("./block")
const cryptoHash = require('../utils/crypto-hash');
const {REWARD_INPUT,MINING_REWARD} = require("../config")
const Transaction = require("../wallet/transaction")
const Wallet = require("../wallet")

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
                    chain[i].data,
                    chain[i].nonce,
                    chain[i].difficulty
                )
            ) {
              return false;
            }
        }
        if(Math.abs(chain[chain.length - 1].difficulty - chain[chain.length - 2].difficulty) > 1){
            return false;
        }
        return true;
    }

    validTransactionData({ chain }) {
        for (let i=1; i<chain.length; i++) {
            const block = chain[i];
            const transactionSet = new Set();
            let rewardTransactionCount = 0;
      
            for (let transaction of block.data) {
              if (transaction.input.address === REWARD_INPUT.address) {
                rewardTransactionCount += 1;
      
                if (rewardTransactionCount > 1) {
                  console.error('Miner rewards exceed limit');
                  return false;
                }
      
                if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                  console.error('Miner reward amount is invalid');
                  return false;
                }
              } else {
                if (!Transaction.validTransaction(transaction)) {
                  console.error('Invalid transaction');
                  return false;
                }
      
                const trueBalance = Wallet.calculateBalance({
                  chain: this.chain,
                  address: transaction.input.address
                });
      
                if (transaction.input.amount !== trueBalance) {
                  console.error('Invalid input amount');
                  return false;
                }
      
                if (transactionSet.has(transaction)) {
                  console.error('An identical transaction appears more than once in the block');
                  return false;
                } else {
                  transactionSet.add(transaction);
                }
              }
            }
          }
      
          return true;
      } 

    replace(newchain,validateTransactions , onSuccess){
        if(newchain.length <= this.chain.length){
            console.error("chain must be longer !");
            return;
        }
        if(!BlockChain.isValidChain(newchain)){
            console.error("chain must be valid !");
            return;
        }

        if(validateTransactions && !this.validTransactionData({chain:newchain})){
            console.error("The chain data is not valid");
            return ;
        }

        if(onSuccess)onSuccess();

        this.chain = newchain;
        console.log("chain is replace with ",newchain)
        return;
    }

}

module.exports = BlockChain