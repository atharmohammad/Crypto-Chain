const redis = require("redis")

const CHANNELS = {
    BLOCKCHAIN:"BLOCKCHAIN"
}

class PubSub{
    constructor({blockchain}){
        this.blockchain = blockchain
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
        // console.log(`Message recieved. Channel : ${channel} Message : ${message}`);
        if(channel == CHANNELS.BLOCKCHAIN){
            this.blockchain.replace(JSON.parse(message));
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
}


module.exports = PubSub