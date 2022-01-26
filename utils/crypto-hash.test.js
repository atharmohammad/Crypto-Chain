const { createHash } = require("crypto")
const cryptoHash = require("./crypto-hash")

describe("Crypto Hash",()=>{
    test("hash data in different order gives same hash",()=>{
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('three','one','two'));
    })
    test("produces a unique hash when properties of input data is changes",()=>{
        const foo = {};
        const originalHash = cryptoHash(foo);
        foo['a'] = 'fake';
        expect(cryptoHash(foo)).not.toEqual(originalHash)
    })
})