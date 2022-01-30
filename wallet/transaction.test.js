const { REWARD_INPUT, MINING_REWARD } = require("../config");
const { verifySignature } = require("../utils");
const Wallet = require("./index");
const Transaction = require("./transaction");

describe("Transaction ",()=>{
    let transaction , senderWallet , recipient , amount;
    beforeEach(()=>{
        senderWallet = new Wallet();
        recipient = 'recipient-public-key';
        amount = 50;
        transaction = new Transaction({senderWallet,recipient,amount});
    })
    test("has an `id`",()=>{
        expect(transaction).toHaveProperty('id');
    })
    describe('outputMap',()=>{
        test("has an `outputMap`",()=>{
            expect(transaction).toHaveProperty('outputMap');
        })
        test('outputs the amount to the recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });
        test('outputs the remaining balance for the `senderWallet`', () => {
            expect(transaction.outputMap[senderWallet.publicKey])
                .toEqual(senderWallet.balance - amount);
        });
    })
    describe("input",()=>{
        test("has an `input`",()=>{
            expect(transaction).toHaveProperty('input');
        })
        test("transaction input has a `timestamp`",()=>{
            expect(transaction.input).toHaveProperty('timestamp');
        })
        test("transaction input `amount` is equal to balance of senders wallet",()=>{
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        })
        test("sets address to `sender's wallet` public key",()=>{
            expect(transaction.input.address).toEqual(senderWallet.publicKey)
        })
        test("verifies signature",()=>{
            expect(verifySignature({
                publicKey: senderWallet.publicKey,
                data: transaction.outputMap,
                signature: senderWallet.sign(transaction.outputMap)
            })).toBe(true)
        })
    })
    describe("validTransaction()",()=>{
        beforeEach(()=>{
            errorMock = jest.fn();
            global.console.error = errorMock
        })
        describe("when the transaction is valid",()=>{
            test("returns true",()=>{
                expect(Transaction.validTransaction(transaction)).toBe(true);
            })
        })
        describe("when the transaction is invalid",()=>{
            test("returns false and logs an error",()=>{
                transaction.outputMap[senderWallet.publicKey] = 99999;

                expect(Transaction.validTransaction(transaction)).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            })
        })
        describe("when the transaction input signature is invalid",()=>{
            test("return false and logs an error",()=>{
                transaction.input.signature = (new Wallet()).sign("fake data")

                expect(Transaction.validTransaction(transaction)).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            })
        })
    })
    describe("update()",()=>{
        let originalSenderOutput,originalSignature,nextRecipient,nextAmount;
        beforeEach(()=>{
            originalSignature = transaction.input.signature;
            originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
            nextRecipient = "next-recipient";
            nextAmount = 40;

            transaction.update({
                senderWallet,recipient:nextRecipient,amount:nextAmount
            });
        })
        test("outputs the amount to the next recipient",()=>{
            expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
        })
        test("subtracts the amount from the sendersWallet",()=>{
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount);
        })
        test("maintains total output balace equal to input amount",()=>{
            const totalOutput = Object.values(transaction.outputMap).reduce((outputTotal,outputAmount)=>{
                return outputTotal + outputAmount;
            })
            expect(totalOutput).toEqual(transaction.input.amount)
        })
        test("re-signs the transaction",()=>{
            expect(transaction.input.signature).not.toEqual(originalSignature)
        })
        describe("add another update for the same recipient",()=>{
            let addedAmount;
            beforeEach(()=>{
                addedAmount = 5;
                transaction.update({
                    senderWallet,recipient:nextRecipient,amount:addedAmount
                });
            })
            test("adds to recipient amount",()=>{
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount+addedAmount);
            })
            test("subtracts the amount from sender wallet output amount",()=>{
                expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount - addedAmount)
            })
        })
    })
    describe("rewardTransaction()",()=>{
        let minerWallet , rewardTransaction;
        beforeEach(()=>{
            minerWallet = new Wallet();
            rewardTransaction = Transaction.rewardTransaction(minerWallet);
        })
        test("creates transaction with the reward input",()=>{
            expect(rewardTransaction.input).toEqual(REWARD_INPUT);
        })
        test("creates transaction with the mining reward",()=>{
            expect(rewardTransaction.outputMap[minerWallet.publicKey])
            .toEqual(MINING_REWARD)
        })
    })
})
