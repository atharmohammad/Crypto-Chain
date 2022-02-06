const Transaction = require("../wallet/transaction");

class TransactionMiner{
    constructor({blockchain,transactionPool,wallet,pubsub}){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }
    mineTransaction(){
        const validTransaction = this.transactionPool.validTransactions();

        // reward the miner for transaction mining 
        //and push it in valid transaction
        validTransaction.push(
            Transaction.rewardTransaction(this.wallet)          
        )

        //add the valid transactions in the chain
        this.blockchain.addBlock({data:[validTransaction]});

        // broadcast the chain
        this.pubsub.broadcastChain({
            blockchain:this.blockchain,
            transactionPool:this.transactionPool
        })
        //clear the transaction map
        this.transactionPool.clear();
    }
}

module.exports = TransactionMiner;