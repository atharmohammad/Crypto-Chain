const { v4:uuidv4 } =  require('uuid');

class Transaction{
    constructor({senderWallet,recipient,amount}){
        this.id = uuidv4();
        this.outputMap = this.createOutputMap({senderWallet,recipient,amount});
        this.input = this.createInput({senderWallet,amount})
    }
    createOutputMap({senderWallet,recipient,amount}){
        const outputMap = {};
        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
        return outputMap;
    }
    createInput({senderWallet}){
        return {
            amount:senderWallet.balance,
            timestamp:Date.now(),
            address:senderWallet.publicKey
        }
    }
}

module.exports = Transaction