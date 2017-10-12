# Queue Shedule

[![NPM version](https://img.shields.io/npm/v/queue-schedule.svg?style=flat-square)](https://www.npmjs.com/package/queue-schedule)
[![Build status](https://travis-ci.org/e174596549/queue-schedule.svg?branch=master)](https://travis-ci.org/e174596549/queue-schedule)

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

let hasDone = false;
new KafkaConsumer({
    name: 'kafka',
    zookeeperHost:ZK_HOST,
    topics: [{
        topic: TOPIC_NAME1,
        partition: PARTITION1,
    }],
    consumerOption: {
        autoCommit: true,
        fetchMaxWaitMs: 1000,
        fromOffset: false,
        fetchMaxBytes: 1024*1024,
    },
    doTask:function(messages,callback) {console.log(messages);
        if (!hasDone) {
            const value = messages[0].value;
            let data = null;
            try {
                data = JSON.parse(value);
            } catch (e) {
                hasDone = true;
                console.error('parse message error',e);
                return;
            }
            expect(data).to.have.property('a').and.equal(1);
            console.log('recieve data',data);
            hasDone = true;
        }
        callback();
    },
    readCount : 1,
    pauseTime : 500,
    idleCheckInter: 10 * 1000
}).on(KafkaConsumer.EVENT_CONSUMER_ERROR,function(err) {
    console.error('consumer error',err);
    hasDone = true;
    
});


new KafkaProducer({
    name : SCHEDULE_NAME1,
    topic: TOPIC_NAME1,
    partition:PARTITION1,
    zookeeperHost:ZK_HOST
}).addData(FIST_DATA,function(err) {
    if (err) {
        console.error('write to queue error',err);
        return ;
    }
    console.info('write to kafka finished');
});
```

## API

For detail usage, see the document online [here](https://doclets.io/e174596549/queue-schedule/master).

## License

[MIT](LICENSE)
