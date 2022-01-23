const express = require("express");
const BlockChain = require("./blockchain")
const PubSub = require("./pubsub")
const axios = require("axios");
const app = express();

const DEFAULT_PORT = 8000;
const ROOT_NODE_PORT = DEFAULT_PORT;

const blockchain = new BlockChain();
const pubsub = new PubSub({blockchain});

const syncChain = (async()=>{
    try{
        const response = await axios.get(`http://localhost:${ROOT_NODE_PORT}/api/blocks`)
        console.log("syncing chanin .. !")
        const chain = response.data
        blockchain.replace(chain)
    }catch(e){
        console.log(e);
    }
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

let PEER_PORT;
if(process.env.GENERATE_PEER_PORT == 'true'){
    PEER_PORT = DEFAULT_PORT + Math.floor(Math.random()*1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT,()=>{
    console.log(`Connected at port ${PORT}`);
    if(PORT != DEFAULT_PORT){
        syncChain();
    }
});