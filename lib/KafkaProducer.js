const slogger = require('node-slogger');

class KafkaProducer {
    constructor({
        name,
        producer,
        topic,
        partition
    }) {
        this.name = name;
        this.producer = producer;
        this.topic = topic;
        this.partition = partition;
    }

    addData(taskData) {
        const producer = this.producer;
        const topic = this.topic;
        const partition = this.partition;

        producer.send([
            { topic, messages: JSON.stringify(taskData), partition}
        ], function (err, data) {
            if (err) {
                slogger.error('write to kafka fail', err, data);
            }
            slogger.debug('kafka send: ', data);
        });
    }
}

module.exports = KafkaProducer;
