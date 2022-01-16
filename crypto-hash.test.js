const { createHash } = require("crypto")
const cryptoHash = require("./crypto-hash")

describe("Crypto Hash",()=>{
    test("hash data in different order gives same hash",()=>{
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('three','one','two'));
    })
})