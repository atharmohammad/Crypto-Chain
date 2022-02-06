const BlockChain = require(".")
const Block = require("./block")
const cryptoHash = require("../utils/crypto-hash")
const Wallet = require("../wallet")
const Transaction = require("../wallet/transaction")

let blockchain,errorMock;

describe("BlockChain",()=>{
    beforeEach(()=>{
        blockchain = new BlockChain();
        errorMock = jest.fn();
        global.console.error = errorMock
    })
    
    test("`chain` should be `instance of array`",()=>{
        expect(blockchain.chain instanceof Array).toBe(true);
    })
    test("`First Block` should be a `Genesis Block`",()=>{
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    })
    test("Add a new `Block` to the `BlockChain`",()=>{
        blockchain.addBlock({data:"0X3esamm4"})
        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual("0X3esamm4");
    })
    
    describe("Block chain Validation",()=>{
        beforeEach(()=>{
            blockchain.addBlock({data:"0xedfgadas"})
            blockchain.addBlock({data:"0x342dasdas"})
            blockchain.addBlock({data:"0xdeq342ssd"})
        })
        test("When chain does not starts with `Genesis Block`",()=>{
            blockchain.chain[0] =  {data:"Not Genesis"};
            expect(BlockChain.isValidChain(blockchain.chain)).toBe(false);
        })
        test("When `chain` has multiple `blocks` and `last hash` reference is changed",()=>{
            blockchain.chain[2].lastHash = 'changed hash';
            expect(BlockChain.isValidChain(blockchain.chain)).toBe(false);
        })
        test("When `chain` is correct and dont have any `invalid block`",()=>{
            expect(BlockChain.isValidChain(blockchain.chain)).toBe(true);
        })
    })

    describe("BlockChain.replace()",()=>{
        let newchain , originalchain , logMock;
        beforeAll(()=>{
            logMock = jest.fn();
            global.console.log = logMock
        })
        beforeEach(()=>{
            blockchain = new BlockChain();
            originalchain = blockchain.chain;
            newchain = new BlockChain();
        })

        describe("NewChain is `Shorter`",()=>{
            beforeEach(()=>{
                newchain.chain[0] = {data:"newData"};
                blockchain.replace(newchain.chain)
            })
            test("Don't`Replace` the chain if `NewChain` is shorter or equal to `Current Chain`",()=>{
                expect(blockchain.chain).toEqual(originalchain)
            })
            test("logs an error",()=>{
                expect(errorMock).toHaveBeenCalled()
            })
        })
        
        describe("NewChain is not Valid",()=>{
            beforeEach(()=>{
                newchain.addBlock({data:"longer chain"});
                newchain.chain[1].hash = "x03Fake";
                blockchain.replace(newchain.chain);
            })
            test("Don't `Replace` the chain if NewChain is not valid",()=>{
                expect(blockchain.chain).not.toEqual(newchain.chain)
            })
            test("logs an error",()=>{
                expect(errorMock).toHaveBeenCalled()
            })
        })

        describe("NewChain is `longer` and `Valid`",()=>{
            beforeEach(()=>{
                newchain.addBlock({data:"longer chain"});
                blockchain.replace(newchain.chain);
            })
            test("`Replace` the chain if length of `NewChain` is longer than length `Current Chain`",()=>{
                expect(blockchain.chain).not.toEqual(originalchain)
            })
            test("logs an error",()=>{
                expect(logMock).toHaveBeenCalled()
            })
        })
        
        describe("`Blockchain` contains a block with jumped `Difficulty`",()=>{
            test("returns false",()=>{
                let blockchain = new BlockChain();
                const lastBlock = blockchain.chain[blockchain.chain.length-1];
                const lastHash = lastBlock.hash;
                const timestamp = Date.now();
                const nonce = 0;
                const data = [];
                const difficulty = lastBlock.difficulty - 3;
                const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
                const badBlock = new Block({
                timestamp, lastHash, hash, nonce, difficulty, data
                });
        
                blockchain.chain.push(badBlock);
        
                expect(BlockChain.isValidChain(blockchain.chain)).toBe(false);
            })
        })

        describe('validTransactionData()', () => {
            let transaction, rewardTransaction, wallet;
        
            beforeEach(() => {
                wallet = new Wallet();
                transaction = wallet.createTransaction({ recipient: 'foo-address', amount: 65 });
                rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
            });
        
            describe('and the transaction data is valid', () => {
                it('returns true', () => {
                    newchain.addBlock({ data: [transaction, rewardTransaction] });
            
                    expect(blockchain.validTransactionData({ chain: newchain.chain })).toBe(true);
                    expect(errorMock).not.toHaveBeenCalled();
                });
            });
        
            describe('and the transaction data has multiple rewards', () => {
                it('returns false and logs an error', () => {
                    newchain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] });
            
                    expect(blockchain.validTransactionData({ chain: newchain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        
            describe('and the transaction data has at least one malformed outputMap', () => {
                describe('and the transaction is not a reward transaction', () => {
                    it('returns false and logs an error', () => {
                        transaction.outputMap[wallet.publicKey] = 999999;
                
                        newchain.addBlock({ data: [transaction, rewardTransaction] });
                
                        expect(blockchain.validTransactionData({ chain: newchain.chain })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });
            
                describe('and the transaction is a reward transaction', () => {
                    it('returns false and logs an error', () => {
                        rewardTransaction.outputMap[wallet.publicKey] = 999999;
                
                        newchain.addBlock({ data: [transaction, rewardTransaction] });
                
                        expect(blockchain.validTransactionData({ chain: newchain.chain })).toBe(false);
                        expect(errorMock).toHaveBeenCalled();
                    });
                });
            });
        
            describe('and the transaction data has at least one malformed input', () => {
                it('returns false and logs an error', () => {
                    wallet.balance = 9000;
            
                    const evilOutputMap = {
                    [wallet.publicKey]: 8900,
                    fooRecipient: 100
                    };
            
                    const evilTransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(evilOutputMap)
                    },
                    outputMap: evilOutputMap
                    }
            
                    newchain.addBlock({ data: [evilTransaction, rewardTransaction] });
            
                    expect(blockchain.validTransactionData({ chain: newchain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        
            describe('and a block contains multiple identical transactions', () => {
                it('returns false and logs an error', () => {
                    newchain.addBlock({
                    data: [transaction, transaction, transaction, rewardTransaction]
                    });
            
                    expect(blockchain.validTransactionData({ chain: newchain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

        });
    })
})

