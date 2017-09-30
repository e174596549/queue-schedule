const kafka = require('kafka-node');
// const async = require('async');
const {expect} = require('chai');
const {KafkaProducer,KafkaConsumer} = require('../../index');
const ZK_HOST = process.env.ZOOKEEPER_PEERS;
const FIST_DATA = {a:1,b:2};
const SCHEDULE_NAME1 = 'schedule3';
const TOPIC_NAME1 = 'topic.5';
const PARTITION1 = 0;
const DELAY_INTERVAL = 1000;
let kafkaProducer = null;

function _createProducer(topic,callback) {
    const client = new kafka.Client(ZK_HOST);
    const producer = new kafka.Producer(client);

    producer.on('ready', function(err) {
        if (err) {
            console.error('producer init fail',err);
            return callback(err);
        }
        // client.refreshMetadata([topic], function(err) {
        //     if (err) {
        //         console.warn('Error refreshing kafka metadata', err);
        //         return callback('Error refreshing kafka metadata');
        //     }
        //     callback(null,producer);
        // });
        callback(null,producer);
        
    }); 
    producer.on('error',function(err) {
        console.error('error occured',err);
        callback(err);
    });
}

describe('kafka schedule with delay producer test # ', function() {

    it('create a delay producer', function(done) {
        _createProducer(TOPIC_NAME1,function(err,producer) {
            if (err) {
                return done(err);
            }
            kafkaProducer = new KafkaProducer({
                name : SCHEDULE_NAME1,
                topic: TOPIC_NAME1,
                partition:PARTITION1,
                delayInterval:DELAY_INTERVAL,
                producer
            });
            for (let i=0;i<100;i++) {
                kafkaProducer.addDateDelay(FIST_DATA);
            }
            kafkaProducer.on(KafkaProducer.EVENT_DELAY_MESSAGE_SEND_FINISHED,function(err) {
                done(err);
            });

        });
    });

    it('create a consumer to consume '+TOPIC_NAME1+':'+PARTITION1+ ' delay message',function(done) {
        const client = new kafka.Client(ZK_HOST);
        const consumer = new kafka.Consumer(
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
        });

        setTimeout(function() {
            if (!hasDone) {
                console.log('this may be not data');
                done();
            }
            
        },1000*10);
    });


});
