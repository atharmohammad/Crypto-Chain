const EC = require("elliptic").ec;
const cryptoHash = require("./crypto-hash");

const ec = new EC("secp256k1");

const verifySignature = ({publicKey,data,signature})=>{
    const derSign = signature.toDER();
    const key = ec.keyFromPublic(publicKey, 'hex')
    return key.verify(cryptoHash(data), derSign)
}

module.exports = {ec,verifySignature};
