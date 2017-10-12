const KafkaProducer = require('./KafkaProducer');
// const kafka = require('kafka-node');
const scheduleManager = new Map();
const SCHEDULE_STATUS = {
    PENDING : 1,
    SUCCESS : 2,
    FAILED : 3
};

class ScheduleItem {
    /**
     * Creates an instance of ScheduleItem.
     * @param {KafkaProducer} data 
     * @param {Number} status 
     * @param {Promise} promise 
     * @memberof ScheduleItem
     */
    constructor(data, status, promise) {
        this.data = data;
        this.status = status;
        this.promise = promise;
    }
}
/**
 * 
 * @param {ProducerOption} options 
 */
const _genNewProducer = function(options,taskData,callback) {
    if (options.host) {
        options.zookeeperHost = options.host;
    }
    const kafkaProducer = new KafkaProducer(options);
    const item = new ScheduleItem(kafkaProducer,SCHEDULE_STATUS.PENDING);
    item.promise = new Promise(function(resolve,reject) {
        kafkaProducer.on(KafkaProducer.EVENT_PRODUCER_READY,function(err) {
            if (err) {
                item.status = SCHEDULE_STATUS.FAILED;
                callback(err);
                return reject(err);
            }
            item.status = SCHEDULE_STATUS.SUCCESS;
            if (taskData) {
                kafkaProducer.addData(taskData);
            }
            callback();
            resolve();
        });
    });
    scheduleManager.set(options.name,item);
};

/**
 * @callback AddScheduleCallback
 * @param {Error} err
 */

/**
 * Add a schedule to the manager, it will return a new instance if none exist, otherwise will return the exist one.
 * **Attention:** Make sure you give a unique name for diffrent proudcers, otherwise it will act as a same one.
 *   
 * @param  {ProducerOption} options the option
 * @param  {Object=} [taskData=null] The data of task, send to kafka after created.
 * @param  {AddScheduleCallback=} [callback=function(){}] Called when the internal kafka producer is ready or error.
 */
exports.addKafkaSchedule = function(options, taskData = null, callback = function() {}) {
    const name = options.name;
    const scheduleNow = scheduleManager.get(name);
    if (scheduleNow) {
        if (scheduleNow.status === SCHEDULE_STATUS.SUCCESS) {
            if (taskData) {
                scheduleNow.addData(taskData);
            }
            return callback();
        }
        if (scheduleNow.status === SCHEDULE_STATUS.PENDING) {
            if (!taskData) {
                return callback();
            }
            return scheduleNow.promise.then(function() {
                callback();
                scheduleNow.data.addData(taskData);
            },function(err) {
                callback(err);
            });
        }
        //failed before, re-try
        _genNewProducer(options,taskData,callback);
    } else {

        _genNewProducer(options,taskData,callback);
    }
};
