const EventEmitter = require('events');
const kafka = require('kafka-node');
/**
 * @callback DoTask
 * 
 * @param {Object[]} messages
 */

 /**
  * @typedef TopicToConsumed
  * 
  * @param {String} topic The name of the topic
  * @param {Number} partition The partition of the current topic which will be processed by the consumer
  * @param {Number} offset The offset , from which the consumer will begin to process.
  */

/**
 * @typedef KafkaConsumerOption
 * 
 * @param {String} name The name of current instance.
 * @param {kafka.Consumer=} consumer The kafka consumer object. When it passed, the parameter of `zookeeperHost` and `consumerOption` will be ignored.
 * @param {String=} zookeeperHost The host of zookeeper.
 * @param {String=} kafkaHost The host of the broker of kafka, when both of `zookeeperHost` and `kafkaHost` passed, the `kafkaHost` has higher priority.
 * @param {Array[TopicToConsumed]=} topics The topics that will be consumed.
 * @param {Object=} consumerOption The option to create a new instance of `Kafka.Consumer`.
 * @param {Number} readCount After reading the count of `readCount`, the consumer will be paused.
 * @param {Number} pauseTime The duration of pause time, after that the consumer will be continued.
 * @param {DoTask} doTask The consume process function.
 * @param {Number} idleCheckInter The instance of KafkaConsumer has a timer inner, to check whether the process of `doTask` is idle. The timer will trigger every `idleCheckInter` ms. 
 */

/**
 * The class of KafkaConsumer
 * @class KafkaConsumer
 * @extends {EventEmitter}
 */

class KafkaConsumer extends EventEmitter {
    
    /**
     * Creates an instance of KafkaConsumer. It will call the function of #consumer inner.
     * 
     * @param {KafkaConsumerOption} option
     * @memberof KafkaConsumer
     */
    constructor({
        name,
        consumer,
        zookeeperHost,
        kafkaHost,
        topics,
        consumerOption,
        doTask,
        readCount = 100,
        pauseTime = 500,
        idleCheckInter = 1000 * 10,
        
    }) {
        super();
        this.name = name;
        this.readCount = readCount;
        this.consumer = consumer;
        if (!consumer) {
            if ((!kafkaHost && !zookeeperHost) || !topics ||  !consumerOption) {
                throw new Error('One of parameters of consumer or kafkaHost, zookeeperHost, topics and consumerOption must be given');
            }
            consumerOption.groupId = consumerOption.groupId || name;
            consumerOption.host = consumerOption.host || zookeeperHost;
            consumerOption.kafkaHost = consumerOption.kafkaHost || kafkaHost;
            consumerOption.fromOffset =  'earliest';
            this._init(zookeeperHost,topics,consumerOption);
        }
        this.pauseTime = pauseTime;
        this.doTask = doTask;
        this.lastFinishedTime = 0;
        this.idleCheckInter = idleCheckInter;
        this.messages = [];
        this.consume(doTask)
    }

    _init(zookeeperHost,topics,consumerOption) {
        // const client = new kafka.Client(zookeeperHost);
        const _this = this;
        // client.on('ready',function() {
        //     _this.emit(KafkaConsumer.EVENT_CLIENT_READY);
        // });
        // client.on('error',function(err) {
        //     _this.emit(KafkaConsumer.EVENT_CLIENT_ERROR,err);
        // });
        const names = [];
        for (const topic of topics) {
            names.push(topic.topic);
        }
        const consumer = this.consumer = new kafka.ConsumerGroup(
            consumerOption,names
        );
        consumer.on('error',function(err) {
            _this.emit(KafkaConsumer.EVENT_CONSUMER_ERROR,err);
        });
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
/**
 * The event to notify that the client is ready.
 */
KafkaConsumer.EVENT_CLIENT_READY = 'eventClientReady';
/**
 * The event to notify that the client is error.
 */
KafkaConsumer.EVENT_CLIENT_ERROR = 'eventClientError';
/**
 * The event to notify that an error ocurred in consumer.
 */
KafkaConsumer.EVENT_CONSUMER_ERROR = 'eventConsumerError';

module.exports = KafkaConsumer;
