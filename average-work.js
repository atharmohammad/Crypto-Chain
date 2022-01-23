const BlockChain = require("./blockchain")

const times = [];
const blockchain = new BlockChain();
blockchain.addBlock({ data: 'initial' });
console.log('first block', blockchain.chain[blockchain.chain.length-1]);
let last_block , newBlock , timeDiff , avg;

for(let i = 0; i<1000; i++){
    last_block = blockchain.chain[blockchain.chain.length - 1];
    blockchain.addBlock({data:`Block ${i}`});
    newBlock = blockchain.chain[blockchain.chain.length - 1];

    timeDiff = newBlock.timestamp - last_block.timestamp;
    times.push(timeDiff);

    avg =  times.reduce((total,newItem)=>(total + newItem))/times.length;
    console.log(`Block - ${i} Time to mine block ${timeDiff} ms . Difficulty ${newBlock.difficulty}. Average time ${avg}`)
}