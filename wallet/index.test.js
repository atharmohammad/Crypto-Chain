const Wallet = require("./index")
const {verifySignature} = require("../utils/index");
const Transaction = require("./transaction");
const Blockchain = require("../blockchain");
const {STARTING_BALANCE} = require("../config");

describe("Wallet ",()=>{
    const wallet = new Wallet();
    const blockchain = new Blockchain();

    test("Contains a `balance`",()=>{
        expect(wallet).toHaveProperty('balance');
    })
    test("Contains a `publicKey`",()=>{
        expect(wallet).toHaveProperty('publicKey');
    })
    describe("`Signing` data",()=>{
        const data = "test";
        test("verfies a `signature`",()=>{
            expect(verifySignature({
                publicKey:wallet.publicKey,
                data,
                signature:wallet.sign(data)
            })).toBe(true);
        })
        test("doest not verfies a invalid `signature`",()=>{
            expect(verifySignature({
                publicKey:wallet.publicKey,
                data,
                signature:(new Wallet).sign(data)
            })).toBe(false);
        })
    });
    describe("createTransaction()",()=>{
        describe("and the amount increases the sender wallets balance",()=>{
            test("It throws an Error",()=>{
                expect(()=>wallet.createTransaction({
                    amount:99999,
                    recipient:"fake-recipient-public-key",
                    chain:blockchain.chain
                }))
                .toThrow("Don't have enough balance");
            })
        })
        describe("and the amount is valid",()=>{
            let transaction,amount,recipient;
            beforeEach(()=>{
                amount = 50;
                recipient="fake-recipient-public-key";
                transaction = wallet.createTransaction({
                    amount,
                    recipient,
                    chain:blockchain.chain
                })
            })
            test("creates a `transaction` instance",()=>{
                expect(transaction instanceof Transaction).toBe(true);
            })
            test("matches the `transaction` input with the `wallet`",()=>{
                expect(transaction.input.address).toEqual(wallet.publicKey)
            })
            test("outputs the amount of recipient",()=>{
                expect(transaction.outputMap[recipient]).toEqual(amount);
            })
        })
        describe("there are no outputs for the balance",()=>{
            test("returns `STARTING_BALANCE`",()=>{
                expect(Wallet.calculateBalance({
                    chain:blockchain.chain,
                    address:wallet.publicKey,
                })).toEqual(STARTING_BALANCE);
            })
        })
        describe("there are outputs for the balance",()=>{
            let transactionOne , transactionTwo;
            beforeEach(()=>{
                transactionOne = new Wallet().createTransaction({
                    amount:20,
                    recipient:wallet.publicKey
                })
                transactionTwo = new Wallet().createTransaction({
                    amount:40,
                    recipient:wallet.publicKey
                })
                blockchain.addBlock({
                    data:[transactionOne,transactionTwo]
                })
            })
            test("returns sum of all output for the balance",()=>{
                expect(Wallet.calculateBalance({
                    chain:blockchain.chain,
                    address:wallet.publicKey
                })).toEqual(STARTING_BALANCE 
                    + transactionOne.outputMap[wallet.publicKey]
                    + transactionTwo.outputMap[wallet.publicKey]
                );
            })
        })
        describe("calculate Balance after Each transaction",()=>{
            test("it calls `calculateBalance`",()=>{
                const mockCalculateBalance = jest.fn();
                const originalCalculateBalance = Wallet.calculateBalance
                Wallet.calculateBalance = mockCalculateBalance
                wallet.createTransaction({
                    amount:10,
                    recipient:'test',
                    chain:blockchain.chain
                })
                expect(Wallet.calculateBalance).toHaveBeenCalled();
                Wallet.calculateBalance = originalCalculateBalance;
            })
        })
        describe("and the wallet has made transaction",()=>{
            let recentTransaction;
            beforeEach(()=>{
                recentTransaction = wallet.createTransaction({
                    amount:10,
                    recipient:'test',
                    chain:blockchain.chain
                });
                blockchain.addBlock({data:[recentTransaction]});
            })
            test("it returns the output amount of recent transaction",()=>{
                expect(Wallet.calculateBalance({
                    chain:blockchain.chain,
                    address:wallet.publicKey
                })).toEqual(recentTransaction.outputMap[wallet.publicKey])
            });
            describe("and there are ouputs next to and after the recent transactions",()=>{
                let sameBlockTransaction , nextBlockTransaction , recentTransaction;
                beforeEach(()=>{
                    recentTransaction = wallet.createTransaction({
                        amount:10,
                        recipient:'test',
                        chain:blockchain.chain
                    })
                    sameBlockTransaction = Transaction.rewardTransaction(wallet);
                    blockchain.addBlock({
                        data:[recentTransaction,sameBlockTransaction]
                    })
                    nextBlockTransaction = new Wallet().createTransaction({
                        amount:24,
                        recipient:wallet.publicKey,
                        chain:blockchain.chain
                    });
                    blockchain.addBlock({
                        data:[nextBlockTransaction]
                    })
                })
                test("it includes output amounts in the returned balance",()=>{
                    expect(Wallet.calculateBalance({
                        chain:blockchain.chain,
                        address:wallet.publicKey
                    })).toEqual(recentTransaction.outputMap[wallet.publicKey]+
                        sameBlockTransaction.outputMap[wallet.publicKey]+
                        nextBlockTransaction.outputMap[wallet.publicKey]
                    )
                })
            })
        })
    })
})