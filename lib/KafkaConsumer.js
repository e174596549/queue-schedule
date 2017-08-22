class KafkaConsumer {
    constructor({
        name,
        consumer,
        count = 100,
        timeout = 500,
        idleCheckInter = 1000 * 10,
        doTask
    }) {
        this.name = name;
        this.count = count;
        this.consumer = consumer;
        this.timeout = timeout;
        this.doTask = doTask;
        this.lastFinishedTime = 0;
        this.idleCheckInter = idleCheckInter;
        this.messages = [];
        this.consume(doTask)
    }

    _continue() {
        const timeout = this.timeout;
        const _this = this;
        setTimeout(function resume() {
            _this.consumer.resume();
        }, timeout);
    }

    consume(doTask) {
        let messages = this.messages;
        const consumer = this.consumer;
        const count = this.count;
        const _this = this;

        consumer.on('message', function(message) {
            if (message.offset % count === 0) {
                consumer.pause();
                messages.push(message);
                _this.lastFinishedTime = new Date().getTime();
                doTask(messages.splice(0), function () {
                    _this._continue();
                });
            } else {
                messages.push(message);
                _this.lastFinishedTime = new Date().getTime();
            }
        });

        setInterval(function clear() {
            const idle = new Date().getTime() - _this.lastFinishedTime;
            if ( idle > 1000 && messages.length > 0) {
                consumer.pause();
                doTask(messages.splice(0), function() {
                    _this._continue();
                });
            }
        }, this.idleCheckInter);
    }
}

module.exports = KafkaConsumer;