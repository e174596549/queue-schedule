// const kafka = require('kafka-node');
// const async = require('async');
const {expect} = require('chai');
const {KafkaProducer,KafkaConsumer} = require('../../index');
const ZK_HOST = process.env.ZOOKEEPER_PEERS;
const FIST_DATA = {a:1,b:2};
const SCHEDULE_NAME1 = 'schedule3';
const TOPIC_NAME1 = 'topic.5';
const PARTITION1 = 0;
const DELAY_INTERVAL = 1000;

describe('kafka schedule with delay producer test # ', function() {

    it('create a delay producer', function(done) {

        const kafkaProducer = new KafkaProducer({
            name : SCHEDULE_NAME1,
            topic: TOPIC_NAME1,
            partition:PARTITION1,
            delayInterval:DELAY_INTERVAL,
            zookeeperHost:ZK_HOST
        });
        const begin = new Date().getTime();
        kafkaProducer.addData(FIST_DATA);
        kafkaProducer.on(KafkaProducer.EVENT_DELAY_MESSAGE_SEND_FINISHED,function(err) {
            expect(new Date().getTime() - begin).to.be.at.least(DELAY_INTERVAL);
            done(err);
        });

    });

    it('create a consumer to consume '+TOPIC_NAME1+':'+PARTITION1+ ' delay message',function(done) {
        let hasDone = false;
        new KafkaConsumer({
            name: 'kafka',
            zookeeperHost:ZK_HOST,
            topics: [{
                topic: TOPIC_NAME1,
                partition: PARTITION1,
            }],
            consumerOption:{
                autoCommit: true,
                fetchMaxWaitMs: 1000,
                fromOffset: false,
                fetchMaxBytes: 1024*1024,
            },
            doTask:function(messages,callback) {//console.log(messages);
                if (!hasDone) {
                    const value = messages[0].value;
                    let data = null;
                    try {
                        data = JSON.parse(value);
                    } catch (e) {
                        hasDone = true;
                        console.error('parse message error',e);
                        return done('parse message error');
                    }
                    expect(data).to.have.property('a').and.equal(1);
                    console.log('recieve data',data);
                    hasDone = true;
                    done();
                }
                callback();
            },
            readCount : 1,
            pauseTime : 500,
            idleCheckInter: 5 * 1000
        }).on(KafkaConsumer.EVENT_CONSUMER_ERROR,function(err) {
            console.error('consumer error',err);
            hasDone = true;
            done(err);
        });;

        setTimeout(function() {
            if (!hasDone) {
                console.log('this may be not data');
                done();
            }
            
        },1000*10);
    });


});
