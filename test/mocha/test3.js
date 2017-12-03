// const kafka = require('kafka-node');
// const async = require('async');
const {expect} = require('chai');
const async = require('async');
const {KafkaProducer,KafkaConsumer,manager} = require('../../index');
const ZK_HOST = process.env.ZOOKEEPER_PEERS;
const KAFKA_HOST = process.env.KAFKA_PEERS;
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
            delayInterval:DELAY_INTERVAL,
            kafkaHost:KAFKA_HOST,
            zookeeperHost:ZK_HOST
        });
        const begin = new Date().getTime();
        kafkaProducer.addData(FIST_DATA);
        kafkaProducer.on(KafkaProducer.EVENT_DELAY_MESSAGE_SEND_FINISHED,function(err) {
            expect(new Date().getTime() - begin).to.be.at.least(DELAY_INTERVAL);
            done(err);
        });

    });
    
        it('create a consumer to consume '+TOPIC_NAME1+ ' delay message',function(done) {
            setTimeout(function() {
                let hasDone = false;
                new KafkaConsumer({
                    name: 'kafka3',
                    zookeeperHost:ZK_HOST,
                    kafkaHost:KAFKA_HOST,
                    topics: [{
                        topic: TOPIC_NAME1,
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
                            //expect(data).to.have.property('a').and.equal(1);
                            console.log('recieve data',data);
                            if (!hasDone) {
                                done();hasDone = true;
                            }
                            
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
        
                // setTimeout(function() {
                //     if (!hasDone) {
                //         console.log('this may be not data');
                //         done();
                //     }
                    
                // },1000*10);
            },DELAY_INTERVAL*5);
        });
    //


    it('use manager to create  producer to send multi data delay', function(done) {
        const begin = new Date().getTime();
        const len = 10000;
        const task = new Array(len);
        const option = {
            name : SCHEDULE_NAME1,
            topic: TOPIC_NAME1,
            delayInterval:DELAY_INTERVAL,
            kafkaHost:KAFKA_HOST,
            zookeeperHost:ZK_HOST
        };
        const data = {"content":"对于经常出差的人们来说，提着个笨重的行李箱、还要拿出笔记本找个舒适的姿势工作，绝不是一件轻松的事情。不过一款名为 Smartoo 的小玩意，或许能够给你带来意外的惊喜。1507884372122","avatar_url":"http://ss.bdimg.com/static/superman/img/logo/logo_white_fe6da1ec.png","created_at":1507884371865};

        for (let i=0;i<len;i++) {
            task[i] = function(next) {
                manager.addKafkaSchedule(option,data,function(err) {
                    if (err) {
                        console.error('create schedule error',err);
                        return next('create schedule  error');
                    }
                    next();
                });
            };
        }
        async.race(task,function(err) {
            if (err) {
                return done(err);
            }
            manager.getProducerByScheduleName(SCHEDULE_NAME1).on(KafkaProducer.EVENT_DELAY_MESSAGE_SEND_FINISHED,function(err,pubLen) {
                if (err) {
                    return done(err);
                }
                expect(new Date().getTime() - begin).to.be.at.least(DELAY_INTERVAL);
                setTimeout(function() {
                    expect(pubLen).to.be.equal(len);
                    done();
                },DELAY_INTERVAL*2);
            });
        });
    });
});
