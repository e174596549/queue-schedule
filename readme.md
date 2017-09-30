# Queue Shedule

Kafka is a high avaliable message queue, but it lacks of consuming message with a slow speed. Some of task with no need to finish it at none, and we want to complete it with a small cost. This is just the reason why we develop `Queue Shedule`.

## Install

```npm install queue-schedule```

## How to use

A basic example is showed as follows:

```javascript
const kafka = require('kafka-node');
const {expect} = require('chai');
const {KafkaProducer,KafkaConsumer} = require('queue-schedule');
const ZK_HOST = process.env.ZOOKEEPER_PEERS;
const FIST_DATA = {a:1,b:2};
const SCHEDULE_NAME1 = 'schedule1';
const TOPIC_NAME1 = 'topic.1';
const PARTITION1 = 0;

function _createProducer(topic,callback) {
    const client = new kafka.Client(ZK_HOST);
    const producer = new kafka.Producer(client);

    producer.on('ready', function(err) {
        if (err) {
            console.error('producer init fail',err);
            return callback(err);
        }
        callback(null,producer);
        
    }); 
    producer.on('error',function(err) {
        console.error('error occured',err);
        callback(err);
    });
}

const client = new kafka.Client(ZK_HOST);
client.on('ready',function() {
    console.log('The client is ready');
});

const consumer = new kafka.Consumer(//The consumer
    client, [{
        topic: TOPIC_NAME1,
        partition: PARTITION1,
    }], {
        autoCommit: true,
        fetchMaxWaitMs: 1000,
        fromOffset: false,
        fetchMaxBytes: 1024*1024,
    }
);
consumer.on('error',function(err) {
    console.error('consumer error',err);
});
let hasDone = false;
new KafkaConsumer({
    name: 'kafka',
    consumer,
    doTask:function(messages,callback) {
        console.log(messages);
        callback();
    },
    readCount : 1,
    pauseTime : 500,
    idleCheckInter: 10 * 1000
});

_createProducer(TOPIC_NAME1,function(err,producer) {
    if (err) {
        return console.error(err);
    }
    new KafkaProducer({//The producer
        name : SCHEDULE_NAME1,
        topic: TOPIC_NAME1,
        partition:PARTITION1,
        producer
    }).addData(FIST_DATA,function(err) {
        if (err) {
            console.error('write to queue error',err);            
        }
    });
    
});
```