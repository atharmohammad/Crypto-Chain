const { v4:uuidv4 } =  require('uuid');
const {verifySignature} = require("../utils/index");

class Transaction{
    constructor({senderWallet,recipient,amount}){
        this.id = uuidv4();
        this.outputMap = this.createOutputMap({senderWallet,recipient,amount});
        this.input = this.createInput({senderWallet,outputMap:this.outputMap})
    }
    createOutputMap({senderWallet,recipient,amount}){
        const outputMap = {};
        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
        return outputMap;
    }
    createInput({senderWallet,outputMap}){
        return {
            amount:senderWallet.balance,
            timestamp:Date.now(),
            address:senderWallet.publicKey,
            signature:senderWallet.sign(outputMap)
        }
    }
    static validTransaction(transaction){
        const {outputMap,input} = transaction;
        const {amount,address,signature} = input;
        const outputTotal = Object.values(outputMap).reduce((total,outputAmount)=>{
            return total+outputAmount;
        })
        if(outputTotal != amount){
            console.error(`Invalid amount from the address ${address}`);
            return false;
        }
        if(!verifySignature({publicKey:address,data:outputMap,signature})){
            console.error(`Invalid Signature from address ${address}`);
            return false;
        }
        return true;
    }
}

module.exports = Transaction