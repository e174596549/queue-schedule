const kafka = require('kafka-node');
const {expect} = require('chai');
const {manager,KafkaProducer,KafkaConsumer} = require('../../index');
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

describe('kafka schedule test# ', function() {

    it('create a producer', function(done) {
        _createProducer(TOPIC_NAME1,function(err,producer) {
            if (err) {
                return done(err);
            }
            new KafkaProducer({
                name : SCHEDULE_NAME1,
                topic: TOPIC_NAME1,
                partition:PARTITION1,
                producer
            }).addData(FIST_DATA,function(err) {
                if (err) {
                    console.error('write to queue error',err);
                    return done('write to queue error');
                }
                done();
            });
            
        })
    });

    it('create a consumer',function(done) {
        const client = new kafka.Client(ZK_HOST);
        const consumer = new kafka.Consumer(
            client, [{
                topic: TOPIC_NAME1,
                partition: PARTITION1,
                offset: 0
            }], {
                autoCommit: true,
                fetchMaxWaitMs: 1000,
                fromOffset: false,
                fetchMaxBytes: 200,
            }
        );
        consumer.on('error',function(err) {
            console.error('consumer error',err);
        });
        let hasDone = false;
        new KafkaConsumer({
            name: 'kafka',
            consumer,
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
        });

        setTimeout(function() {
            if (!hasDone) {
                console.log('this may be not data');
                done();
            }
            
        },5000);
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
