const TransactionPool = require("./transaction-pool")
const Transaction = require("./transaction");
const Wallet = require("./index");
const BlockChain = require("../blockchain");

describe("TransactionPool",()=>{
    let transactionPool , transaction , senderWallet;
    beforeEach(()=>{
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = new Transaction({
            senderWallet,
            amount:5,
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
    describe('validTransactions()', () => {
        let validTransactions, errorMock;
    
        beforeEach(() => {
          validTransactions = [];
          errorMock = jest.fn();
          global.console.error = errorMock;
    
          for (let i=0; i<10; i++) {
            transaction = new Transaction({
              senderWallet,
              recipient: 'any-recipient',
              amount: 30
            });
    
            if (i%3===0) {
              transaction.input.amount = 999999;
            } else if (i%3===1) {
              transaction.input.signature = new Wallet().sign('foo');
            } else {
              validTransactions.push(transaction);
            }
    
            transactionPool.setTransaction(transaction);
          }
        });
    
        test('returns valid transaction', () => {
          expect(transactionPool.validTransactions()).toEqual(validTransactions);
        });
    
        test('logs errors for the invalid transactions', () => {
          transactionPool.validTransactions();
          expect(errorMock).toHaveBeenCalled();
        });
    });
    describe("clear()",()=>{
      test("clear all the transactions in transaction map",()=>{
        transactionPool.clear();
        expect(transactionPool.transactionMap).toEqual({})
      })
    })
    describe("clearBlockChainTransactions()",()=>{
      test("it clears all the transactions that are in the blockchain",()=>{
        const blockchain = new BlockChain();
        const expectedTransactions = {};
        for(let i = 0; i<6; i++){
          let transaction = new Wallet().createTransaction({
            amount:10,
            recipient:`recipient-${i}`,
            chain:blockchain.chain
          });
          transactionPool.setTransaction(transaction);
          if(i%2 === 1){
            expectedTransactions[transaction.id] = transaction;
          }else{
            blockchain.addBlock({data:[transaction]});
          }
        }
        transactionPool.clearBlockChainTransactions({chain:blockchain.chain});
        expect(transactionPool.transactionMap).toEqual(expectedTransactions)
      })
    })
})