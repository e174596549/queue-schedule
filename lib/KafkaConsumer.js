class KafkaConsumer {
    constructor({
        name,
        consumer,
        count = 9,
        timeout = 500,
        doTask
    }) {
        this.name = name;
        this.count = count;
        this.consumer = consumer;
        this.timeout = timeout;
        this.doTask = doTask;

        this.consume(doTask)
    }

    consume(doTask) {
        let messages = [];
        const consumer = this.consumer;
        const count = this.count;
        const timeout = this.timeout;

        consumer.on('message', function(message) {
            if (message.offset % count === 0) {
                consumer.pause();
                doTask(messages, function callback() {
                    setTimeout(function resume() {
                        messages = [];
                        consumer.resume();
                        messages.push(message);
                    }, timeout);
                });
            } else {
                messages.push(message);
            }
        });
    }
}

module.exports = KafkaConsumer;
