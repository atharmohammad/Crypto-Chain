const Wallet = require("./index")
const {verifySignature} = require("../utils/index");
const Transaction = require("./transaction");

describe("Wallet ",()=>{
    const wallet = new Wallet();
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
                    recipient:"fake-recipient-public-key"
                }))
                .toThrow("Don't have enough balance");
            })
        })
        describe("and the amount is valid",()=>{
            let transaction,amount,recipient;
            beforeEach(()=>{
                amount = 50;
                recipient="fake-recipient-public-key";
                transaction = wallet.createTransaction({amount,recipient})
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
    })
})