const EventEmitter = require('events');
/**
 * @typedef {Object} TopicItem
 * 
 * @property {String} name
 * @property {String} partition
 */

/**
 * The class of KafkaProducer
 * 
 * @class KafkaProducer
 */
class KafkaProducer extends EventEmitter {
    /**
     * Creates an instance of KafkaProducer.
     * 
     * @param {Object} option
     * @param {String} option.name The name of current instance.
     * @param {Kafka.Producer} The kafka producer object.
     * @param {String=} option.topic The topic where you save data in it.
     * @param {String=} option.partition The partition of kafka where you save data in it.
     * @param {TopicItem[]=} option.topicList A list of topic items , which you can send a message to all of the topic in the list. When this parameter passed, the `option.topic` and `option.partition` will be ignored.
     * @memberof KafkaProducer
     */
    constructor({
        name,
        producer,
        topic,
        partition,
        delayInterval,
        topicList
    }) {
        super();
        this.name = name;
        this.producer = producer;
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
        if (delayInterval > 0) {
            this._doSendDataTimer();
        }
    }

    _doSendDataTimer() {
        const _this = this;
        setTimeout(function delayProcess() {
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
     * Send data to kafka.
     * 
     * @param {Object} taskData 
     * @param {Function=} [callback=function() {}] 
     * @returns {KafkaProducer}
     * @memberof KafkaProducer
     */
    addData(taskData, callback = function() {}) {
        
        this.producer.send(
            this._createSendData(JSON.stringify(taskData)), callback
        );
        return this;
    }

    addDateDelay(taskData) {
        this._delayData.push(JSON.stringify(taskData));
    }
}

KafkaProducer.EVENT_DELAY_MESSAGE_SEND_FINISHED = 'delayMessageSendFinished';

module.exports = KafkaProducer;
