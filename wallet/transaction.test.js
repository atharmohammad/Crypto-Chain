const { send } = require("express/lib/response");
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
    
})
