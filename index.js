const express = require("express");
const BlockChain = require("./blockchain")
const PubSub = require("./app/pubsub")
const Transaction = require("./wallet/transaction")
const TransactionPool = require("./wallet/transaction-pool");
const Wallet = require("./wallet/index");
const axios = require("axios");
const req = require("express/lib/request");
const app = express();

const DEFAULT_PORT = 8000;
const ROOT_NODE_PORT = DEFAULT_PORT;

const transactionPool = new TransactionPool();
const blockchain = new BlockChain();
const pubsub = new PubSub({blockchain,transactionPool});
const wallet = new Wallet();

const syncWithRootState = (async()=>{
    console.log("syncing state")
    try{
        const response = await axios.get(`http://localhost:${ROOT_NODE_PORT}/api/blocks`)
        const chain = response.data
        blockchain.replace(chain)
    }catch(e){
        console.log(e);
    }

    try{
        const response = await axios.get(`http://localhost:${ROOT_NODE_PORT}/api/transaction-pool-map`);
        const transaction_pool_map = response.data;
        transactionPool.setMap(transaction_pool_map); 
    }catch(e){
        console.log(e);
    }
    console.log('chain ', blockchain.chain);
    console.log('transaction-pool-map ', transactionPool.transactionMap);

})


app.use(express.json());

app.get("/api/blocks",(req,res)=>{
    return res.status(200).send(blockchain.chain);
})

app.post("/api/mine",(req,res)=>{
    const {data} = req.body;
    blockchain.addBlock({data});
    pubsub.broadcastChain()
    return res.redirect("/api/blocks");
})

app.post("/api/transact",(req,res)=>{
    try{
        const {amount,recipient} = req.body;
        let transaction = transactionPool
                            .existingTransaction({inputAddress:wallet.publicKey})
        
        if(transaction){
            transaction.update({senderWallet:wallet,recipient,amount});
        }else{
            transaction = wallet.createTransaction({amount,recipient});
            transactionPool.setTransaction(transaction);
        }
        pubsub.broadcastTransaction(transaction);
        return res.status(200).send(transaction); 
    }catch(e){
        return res.status(400).send(e);
    }
})

app.get("/api/transaction-pool-map",(req,res)=>{
    return res.status(200).send(transactionPool.transactionMap);
})

let PEER_PORT;
if(process.env.GENERATE_PEER_PORT == 'true'){
    PEER_PORT = DEFAULT_PORT + Math.floor(Math.random()*1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT,()=>{
    console.log(`Connected at port ${PORT}`);
    if(PORT != DEFAULT_PORT){
        syncWithRootState();
    }
});