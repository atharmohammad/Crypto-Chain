const {STARTING_BALANCE} = require("../config");
const {ec} = require("../utils/index");
const cryptoHash = require("../utils/crypto-hash");
const Transaction = require("./transaction");

class Wallet{
    constructor(){
        this.balance = STARTING_BALANCE;
        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }
    sign(data){
        return this.keyPair.sign(cryptoHash(data));
    }
    createTransaction({amount,recipient}){
        if(this.balance < amount){
            throw new Error("Don't have enough balance");
        }
        const transaction = new Transaction({senderWallet:this,recipient,amount});
        return transaction;
    }
}

module.exports = Wallet