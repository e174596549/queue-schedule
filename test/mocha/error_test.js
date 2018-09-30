const {expect} = require('chai');
const {KafkaProducer} = require('../../index');
// const ZK_HOST = process.env.ZOOKEEPER_PEERS;//console.log(process.env);
const KAFKA_HOST = process.env.KAFKA_PEERS;
// const FIST_DATA = {a:1,b:2};
const SCHEDULE_NAME1 = 'schedule1';
const TOPIC_NAME1 = 'topic.error';

describe.skip('error test#',function() {
    it('use manager to create  producer to send multi data delay', function(done) {
        // const begin = new Date().getTime();
        const len = 10000;

        const data = {"content":"对于经常出差的人们来说，提着个笨重的行李箱、还要拿出笔记本找个舒适的姿势工作，绝不是一件轻松的事情。不过一款名为 Smartoo 的小玩意，或许能够给你带来意外的惊喜。1507884372122","avatar_url":"http://ss.bdimg.com/static/superman/img/logo/logo_white_fe6da1ec.png","created_at":1507884371865};

        const kafkaProducer = new KafkaProducer({
            name : SCHEDULE_NAME1,
            topic: TOPIC_NAME1,
            delayInterval:1000,
            kafkaHost:KAFKA_HOST,
        });
        for (var i=0;i<len;i++) {
            kafkaProducer.addData(data);
        }
        
        kafkaProducer.on(KafkaProducer.EVENT_DELAY_MESSAGE_SEND_FINISHED,function(err) {
            //console.log('finish',err); 
        }).on(KafkaProducer.EVENT_SEND_ERROR,function(err,data) {
            console.log('send error',err);
            expect(err).to.not.be.null;
            expect(data.length).to.be.equal(len);
            done();
        }).on(KafkaProducer.EVENT_PRODUCER_ERROR,function(err) {
            console.log('producer error',err);
        });
        
    });
});