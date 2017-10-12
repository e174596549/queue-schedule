// const kafka = require('kafka-node');
const {expect} = require('chai');
const {manager,KafkaProducer,KafkaConsumer} = require('../../index');
const ZK_HOST = process.env.ZOOKEEPER_PEERS;
const FIST_DATA = {a:1,b:2};
const SCHEDULE_NAME1 = 'schedule1';
const TOPIC_NAME1 = 'topic.1';
const PARTITION1 = 0;

describe('kafka schedule test# ', function() {
    it('create a consumer',function(done) {
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
            idleCheckInter: 10 * 1000
        }).on(KafkaConsumer.EVENT_CONSUMER_ERROR,function(err) {
            console.error('consumer error',err);
            hasDone = true;
            done(err);
        }).on(KafkaConsumer.EVENT_CLIENT_READY,function() {
            console.log('the consumer client is ready');
        });;


        new KafkaProducer({
            name : SCHEDULE_NAME1,
            topic: TOPIC_NAME1,
            partition:PARTITION1,
            zookeeperHost:ZK_HOST
        }).addData(FIST_DATA,function(err) {
            if (err) {
                console.error('write to queue error',err);
                return done('write to queue error');
            }
            console.info('write to kafka finished');
        }).on(KafkaProducer.EVENT_CLIENT_READY,function() {
            console.log('the producer client is ready');
        }).on(KafkaProducer.EVENT_PRODUCER_READY,function() {
            console.log('the producer self is ready');
        });

        

        setTimeout(function() {
            if (!hasDone) {
                console.log('this may be not data');
                done();
            }
            
        },1000*10);
    });

    it('use manager to create a producer', function(done) {

            manager.addKafkaSchedule({
                name : SCHEDULE_NAME1,
                topic: TOPIC_NAME1,
                partition:PARTITION1,
                host:ZK_HOST
            },FIST_DATA,function(err) {
                if (err) {
                    console.error('write to queue error',err);
                    return done('write to queue error');
                }
                done();
            });
            
        });

});
