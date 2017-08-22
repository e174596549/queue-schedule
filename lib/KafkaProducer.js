const slogger = require('node-slogger');

class KafkaProducer {
    constructor({
        name,
        producer,
        topic
    }) {
        this.name = name;
        this.producer = producer;
        this.topic = topic;
    }

    addData(taskData) {
        const producer = this.producer;
        const topic = this.topic;
        producer.send([
            { topic, messages: JSON.stringify(taskData), partition: 0 }
        ], function (err, data) {
            if (err) {
                slogger.error('write to kafka fail', err, data);
            }
            slogger.debug('kafka send: ', data);
        });
    }
}

module.exports = KafkaProducer;
