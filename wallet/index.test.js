const Wallet = require("./index")
const {verifySignature} = require("../utils/index")

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
    })
})