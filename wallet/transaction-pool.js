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
        return transaction.find(t=>(t.input.address== inputAddress))
    }
}

module.exports = TransactionPool