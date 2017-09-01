/**
 * The class of KafkaProducer
 * 
 * @class KafkaProducer
 */
class KafkaProducer {
    /**
     * Creates an instance of KafkaProducer.
     * 
     * @param {Object} option
     * @param {String} option.name The name of current instance.
     * @param {Kafka.Producer} The kafka producer object.
     * @param {String} option.topic The topic where you save data in it.
     * @param {String} option.partition The partition of kafka where you save data in it.
     * @memberof KafkaProducer
     */
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

    /**
     * Send data to kafka.
     * 
     * @param {Object} taskData 
     * @param {Function} [callback=function() {}] 
     * @returns {KafkaProducer}
     * @memberof KafkaProducer
     */
    addData(taskData, callback = function() {}) {
        this.producer.send([{
            topic: this.topic,
            messages: JSON.stringify(taskData),
            partition: this.partition
        }], callback);
        return this;
    }
}

module.exports = KafkaProducer;
