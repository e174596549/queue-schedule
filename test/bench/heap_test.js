// const {expect} = require('chai');
// const async = require('async');
const slogger = require('node-slogger').init({flashInterval:500});
const {KafkaProducer,} = require('../../index');
// const ZK_HOST = process.env.ZOOKEEPER_PEERS;
const KAFKA_HOST = process.env.KAFKA_PEERS;
const SCHEDULE_NAME1 = 'scheduleBench';
const TOPIC_NAME1 = 'topic.5';
const DELAY_INTERVAL = 1000;
const MAX_AGE = 60 * 1000 * 1;
const MAX_COUNT_SEND = 10;

const begin = new Date().getTime();
// const len = 10000;

const data = {"content":"对于经常出差的人们来说，提着个笨重的行李箱、还要拿出笔记本找个舒适的姿势工作，绝不是一件轻松的事情。不过一款名为 Smartoo 的小玩意，或许能够给你带来意外的惊喜。1507884372122","avatar_url":"http://ss.bdimg.com/static/superman/img/logo/logo_white_fe6da1ec.png","created_at":1507884371865};

const kafkaProducer = new KafkaProducer({
    name : SCHEDULE_NAME1,
    topic: TOPIC_NAME1,
    delayInterval:DELAY_INTERVAL,
    kafkaHost:KAFKA_HOST,
    // zookeeperHost:ZK_HOST
});
const NAMES = [SCHEDULE_NAME1];
for(let name of NAMES) {
    kafkaProducer.on(KafkaProducer.EVENT_CLIENT_ERROR,function(err) {
        slogger.error(`create kafka${name} queue fail`,err);
    }).on(KafkaProducer.EVENT_PRODUCER_ERROR,function(err) {
        slogger.error(`producer ${name} run error`,err);
    }).on(KafkaProducer.EVENT_SEND_ERROR,function(err,data) {
        console.error(`send data to ${name} fail`,err,data);//will lead to memory leak
        data = null;
    }).on(KafkaProducer.EVENT_DELAY_MESSAGE_SEND_FINISHED,function(err) {
        slogger.debug('send data over');
    });
}

let isEnd = false;
function test() {
    if (Date.now() - begin > MAX_AGE) {
        // 
       if (!isEnd) {
            console.error('test end');
            isEnd =true;
       } else {
            
       }
    } else {
        for(var i=0;i<MAX_COUNT_SEND;i++) {
            kafkaProducer.addData(data);
        }
        
    }    
    
    setTimeout(function() {
        test();
    },0);
    // setImmediate(function() {
    //     test();
    // });

}
setImmediate(function() {
    test();
});
// test();
        
        
        