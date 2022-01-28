const TransactionPool = require("./transaction-pool")
const Transaction = require("./transaction");
const Wallet = require("./index");

describe("TransactionPool",()=>{
    let transactionPool , transaction , senderWallet;
    beforeEach(()=>{
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = new Transaction({
            senderWallet,
            amount:50,
            recipient:"reciever-id"
        });
    })

    describe("setTransaction()",()=>{
        test("It adds a `transaction`",()=>{
            transactionPool.setTransaction(transaction);            
            expect(transactionPool.transactionMap[transaction.id])
            .toBe(transaction)
        });
        test("returns an existing transaction given an input address",()=>{
            transactionPool.setTransaction(transaction);
            expect(transactionPool
                .existingTransaction({inputAddress:senderWallet.publicKey})).toBe(transaction)
        })
    })

})