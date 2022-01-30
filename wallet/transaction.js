const { assert } = require('elliptic/lib/elliptic/utils');
const { v1 : uuidv1 }=  require('uuid');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const {verifySignature} = require("../utils/index");

class Transaction{
    constructor({senderWallet,recipient,amount,outputMap,input}){
        this.id = uuidv1();
        this.outputMap = outputMap || this.createOutputMap({senderWallet,recipient,amount});
        this.input = input || this.createInput({senderWallet,outputMap:this.outputMap})
    }
    static validTransaction(transaction){
        const { input: { address, amount, signature }, outputMap } = transaction;

        const outputTotal = Object.values(outputMap)
        .reduce((total, outputAmount) => total + outputAmount);

        if (amount !== outputTotal) {
        console.error(`Invalid transaction from ${address}`);
        return false;
        }

        if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
        console.error(`Invalid signature from ${address}`);
        return false;
        }

        return true;
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
    update({senderWallet,recipient,amount}){
        if(amount > senderWallet.balance){
            throw Error("Don't have enough money to compelete this transaction !");
        }
        if(!this.outputMap[recipient]){
            this.outputMap[recipient] = amount;
        }else{
            this.outputMap[recipient] = this.outputMap[recipient] + amount;
        }
        this.outputMap[senderWallet.publicKey] = this.outputMap[this.input.address] - amount;
        this.input = this.createInput({senderWallet,outputMap:this.outputMap})
    }
    static rewardTransaction(minerWallet){
        return new this({
            outputMap:{[minerWallet.publicKey]:MINING_REWARD},
            input:REWARD_INPUT
        })
    }
}

module.exports = Transaction