/**
 * @callback DoTask
 * 
 * @param {Object[]} messages
 */

/**
 * The class of KafkaConsumer
 * @class KafkaConsumer
 */

class KafkaConsumer {
    
    /**
     * Creates an instance of KafkaConsumer. It will call the function of #consumer inner.
     * 
     * @param {Object} option
     * @param {String} option.name The name of current instance.
     * @param {Kafka.Consumer} option.consumer The kafka consumer object.
     * @param {Number} option.readCount After reading the count of `option.readCount`, the consumer will be paused.
     * @param {Number} option.pauseTime The duration of pause time, after that the consumer will be continued.
     * @param {DoTask} option.doTask The consume process function.
     * @param {Number} option.idleCheckInter The instance of KafkaConsumer has a timer inner, to check whether the process of `option.doTask` is idle. The timer will trigger every `option.idleCheckInter` ms.
     * @memberof KafkaConsumer
     */
    constructor({
        name,
        consumer,
        readCount = 100,
        pauseTime = 500,
        idleCheckInter = 1000 * 10,
        doTask
    }) {
        this.name = name;
        this.readCount = readCount;
        this.consumer = consumer;
        this.pauseTime = pauseTime;
        this.doTask = doTask;
        this.lastFinishedTime = 0;
        this.idleCheckInter = idleCheckInter;
        this.messages = [];
        this.consume(doTask)
    }

    _continue() {
        const _this = this;
        setTimeout(function resume() {
            _this.consumer.resume();
        }, this.pauseTime);
    }
    /**
     * The consume function.
     * Do not call this function manual!
     * 
     * @param {DoTask} doTask 
     * @memberof KafkaConsumer
     */
    consume(doTask) {
        let messages = this.messages;
        const consumer = this.consumer;
        const count = this.readCount;
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
