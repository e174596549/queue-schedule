const EventEmitter = require('events');
const kafka = require('kafka-node');
/**
 * @typedef {Object} TopicItem
 * 
 * @property {String} name
 * @property {String} partition
 */

 /**
  * @typedef {Object} ProducerOption
  * 
  * @class KafkaProducer
  * @param {String} name The name of current instance.
  * @param {kafka.Producer} producer The kafka producer object.
  * @param {String=} zookeeperHost The host of zookeeper , when the parameter of  `option.producer` passed, this parameter will be ignored.
  * @param {String=} topic The topic where you save data in it.
  * @param {String=} partition The partition of kafka where you save data in it.
  * @param {TopicItem[]|undefined} topicList A list of topic items , which you can send a message to all of the topic in the list. When this parameter passed, the `option.topic` and `option.partition` will be ignored.
  * @param {Number=} delayInterval When pass this parameter, messages will publish to kafka every `option.delayInterval` ms, otherwise messages will publish to kafka at once.
  */

/**
 * The class of the producer of Kafka
 * @class KafkaProducer
 * @extends {EventEmitter}
 */
class KafkaProducer extends EventEmitter {
    /**
     * Creates an instance of KafkaProducer.
     * 
     * @param {ProducerOption} option
     * @memberof KafkaProducer
     */
    constructor({
        name,
        producer,
        zookeeperHost,
        topic,
        partition,
        delayInterval,
        topicList
    }) {
        super();
        this.name = name;
        this.producer = producer;
        this._clientPromise = null;
        this._clientOk = false;
        if (!producer) {
            if (!zookeeperHost) {
                throw new Error('You must giva a producer or zookeeperHost.');
            }
            this._createProducer(zookeeperHost);
        } else {
            this._clientOk = true;
            this._clientPromise = Promise.resolve();
        }
        this.topic = topic;
        this.partition = partition;
        this.delayInterval = delayInterval;
        this.topicList = topicList;
        this._delayData = [];
        if (!this.topicList && !this.topic) {
            throw new Error('You must give a topicList or topic paramemter.');
        }
        if (this.topicList && this.topic) {
            console.warn('The topic parameter will be ignored, as you have give a topicList parameter.');
        }

        this._delayTimer = null;
        if (delayInterval > 0) {
            this._doSendDataTimer();
        }
    }
    /**
     * @private
     * 
     * @memberof KafkaProducer
     */
    _cancleTimer() {
        if (this._delayTimer) {
            clearTimeout(this._delayTimer);
        }
    }
    /**
     * @private
     * @param {String} zookeeperHost 
     * 
     * @memberof KafkaProducer
     */

    _createProducer(zookeeperHost) {
        const client = new kafka.Client(zookeeperHost);
        const _this = this;

        _this._clientPromise = new Promise(function(resolve,reject) {
            client.on('ready',function() {
                _this.emit(KafkaProducer.EVENT_CLIENT_READY);
                
            });
            client.on('error',function(err) {
                _this._cancleTimer();
                _this._clientOk = false;
                reject(err);
                return _this.emit(KafkaProducer.EVENT_CLIENT_ERROR,err);
            });
            const producer = new kafka.Producer(client);
            producer.on('ready', function producerReady() {

                _this.producer = producer;
                _this._clientOk = true;
                resolve();
                return _this.emit(KafkaProducer.EVENT_PRODUCER_READY);
                
            }); 
            producer.on('error',function producerError(err) {
                _this._cancleTimer();
                _this._clientOk = false;
                reject(err);
                return _this.emit(KafkaProducer.EVENT_PRODUCER_ERROR,err);
            });
        });
    }

    /**
     * @private
     * 
     * @memberof KafkaProducer
     */
    _doSendDataTimer() {
        const _this = this;
        this._delayTimer = setTimeout(function delayProcess() {
            if (!_this.producer) {
                return _this._doSendDataTimer();
            }
            const array = _this._delayData.splice(0);
            if (array.length === 0) {
                return _this._doSendDataTimer();
            }
            _this.producer.send(
                _this._createSendData(array),function(err) {
                    // if (err) {
                    //     console.error('kafka producer send error',err);
                    // }
                    _this.emit(KafkaProducer.EVENT_DELAY_MESSAGE_SEND_FINISHED,err);
                    _this._doSendDataTimer();
                }
            );
        },this.delayInterval);
        

    }
    /**
     * @private
     * 
     * @param {Object} taskData 
     * @returns 
     * @memberof KafkaProducer
     */
    _createSendData(taskData) {
        const topicList = this.topicList;
        if (!topicList) {
            return [{
                topic: this.topic,
                messages: taskData,
                partition: this.partition
            }];
        }
        const sendData = new Array(topicList.length);
        for (var i=0,len=topicList.length;i<len;i++) {
            const topic = topicList[i];

            sendData[i] = {
                topic:topic.name,
                partition:topic.partition,
                messages:taskData
            };
        }
        return sendData;
    }
    /**
     * 
     * @private
     * @param {Object} taskData 
     * @param {Function} callback 
     * @memberof KafkaProducer
     */
    _sendAtOnce(taskData,callback) {
        this.producer.send(
            this._createSendData(JSON.stringify(taskData)), callback
        );
    }

    /**
     * Send data to kafka, it will send the data to kafka every `delayInterval` ms when `delayInterval` is set. It will wait the client i
     * 
     * @param {Object} taskData 
     * @param {Function=} [callback=function() {}] 
     * @returns {KafkaProducer}
     * @memberof KafkaProducer
     */
    addData(taskData, callback = function() {}) {
        if (this.delayInterval > 0) {
            this._delayData.push(JSON.stringify(taskData));
            return this;
        }
        if (this._clientOk) {
            this._sendAtOnce(taskData,callback);
        } else {
            const _this = this;
            this._clientPromise.then(function() {
                _this._sendAtOnce(taskData,callback)
            }).catch(function(err) {
                callback(err);
            });
        }
        
        return this;
    }
    /**
     * @deprecated
     * 
     * @param {any} taskData 
     * @memberof KafkaProducer
     */
    addDataDelay(taskData) {
        this._delayData.push(JSON.stringify(taskData));
    }
}
/**
 * The event to notify that the client is ready.
 */
KafkaProducer.EVENT_CLIENT_READY = 'eventClientReady';
/**
 * The event to notify that the client is error.
 */
KafkaProducer.EVENT_CLIENT_ERROR = 'eventClientError';

/**
 * The event to notify that a batch of messages have been sent finished.
 */
KafkaProducer.EVENT_DELAY_MESSAGE_SEND_FINISHED = 'delayMessageSendFinished';
/**
 * The event to notify that the producer is ready.
 */
KafkaProducer.EVENT_PRODUCER_READY = 'producerReady';
/**
 * The event to notify the producer is error.
 */
KafkaProducer.EVENT_PRODUCER_ERROR = 'producerError';

module.exports = KafkaProducer;
