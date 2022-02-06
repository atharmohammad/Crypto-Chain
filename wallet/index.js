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
    createTransaction({amount,recipient,chain}){
        if(chain){
            this.balance = Wallet.calculateBalance({chain,address:this.publicKey})
        }
        if(this.balance < amount){
            throw new Error("Don't have enough balance");
        }
        const transaction = new Transaction({senderWallet:this,recipient,amount});
        return transaction;
    }
    static calculateBalance({chain,address}){
        let outputTotal = 0,hasConductedTransaction = false;

        for(let i = chain.length - 1; i>0; i--){
            const block = chain[i];
            for(let transaction of block.data){
                if(transaction.input.address == address){
                    hasConductedTransaction = true;
                }
                const addressOutput = transaction.outputMap[address];
                if(addressOutput){
                    outputTotal = outputTotal + transaction.outputMap[address];
                }
            }
            if(hasConductedTransaction)break;
        }
        return hasConductedTransaction ? outputTotal : outputTotal + STARTING_BALANCE;
    }
}

module.exports = Wallet