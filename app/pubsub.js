const redis = require("redis")

const CHANNELS = {
    BLOCKCHAIN:"BLOCKCHAIN",
    TRANSACTION:"TRANSACTION"
}

class PubSub{
    constructor({blockchain,transactionPool}){
        this.blockchain = blockchain
        this.transactionPool = transactionPool

        this.publisher = redis.createClient({
            host: '127.0.0.1',
            port: 6379
        });
        this.subscriber = redis.createClient({
            host: '127.0.0.1',
            port: 6379
        });

        this.subcribeChannel();
        this.subscriber.on("message",(channel,message)=>this.handleMessage(channel,message))
    }

    handleMessage(channel,message){
        console.log(`Message recieved. Channel : ${channel} Message : ${message}`);
        const parsedMessage = JSON.parse(message);
        switch(channel){
            case CHANNELS.BLOCKCHAIN:
                this.blockchain.replaceChain(parsedMessage);
                break;
            case CHANNELS.TRANSACTION:
                this.transactionPool.setTransaction(parsedMessage);
                break;
            default:
                return;
        }
    }
    subcribeChannel(){
        Object.values(CHANNELS).forEach(channel=>{
            this.subscriber.subscribe(channel);
        })
    }
    publish({channel,message}){
        this.subscriber.unsubscribe(channel,()=>{
            this.publisher.publish(channel,JSON.stringify(message),()=>{
                this.subscriber.subscribe(channel)
            });
        })
    }
    broadcastChain(){
        this.publish({
            channel:CHANNELS.BLOCKCHAIN,
            message:this.blockchain.chain
        })
    }
    broadcastTransaction(transaction){
        this.publish({
            channel:CHANNELS.TRANSACTION,
            message:transaction
        })
    }
}


module.exports = PubSub