const Block = require("../blockchain/block");
const Transaction = require("./transaction");

class TransactionPool{
    constructor(){
        this.transactionMap = {}
    }
    setTransaction(transaction){
        this.transactionMap[transaction.id] = transaction
    }
    setMap(transactionMap){
        this.transactionMap = transactionMap
    }
    existingTransaction({inputAddress}){
        const transaction = Object.values(this.transactionMap);
        return transaction.find(t=>(t.input.address===inputAddress))
    }
    validTransactions(){
        const list = Object.values(this.transactionMap).filter(
            transaction=>Transaction.validTransaction(transaction)
        );
        return list;
    }
    clear(){
        this.transactionMap = {};
    }
    clearBlockChainTransactions({chain}){
        for(let i = 1; i<chain.length; i++){
           const block = chain[i];
           for(let transaction of block.data){
               if(this.transactionMap[transaction.id]){
                   delete this.transactionMap[transaction.id];
               }
           }
        }
    }
}

module.exports = TransactionPool