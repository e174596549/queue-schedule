const KafkaProducer = require('./KafkaProducer');
const kafka = require('kafka-node');
const scheduleManager = new Map();
// const SCHEDULE_TYPES = exports.SCHEDULE_TYPES = {
//     'KAFKA' : 1
// };
// const SCHEDULE_TYPE_MAP = {
//     [SCHEDULE_TYPES.KAFKA] : KafkaProducer
// };

/**
 * @callback AddScheduleCallback
 * @param {Error} err
 */

/**
 * Add a schedule to the manager, it will return a new instance if none exist, otherwise will return the exist one.
 * **Attention:** Make sure you give a unique name, otherwise it will overwrite an exist one.
 *   
 * @param  {Object} options
 * @param  {String} options.name The name of schedule to create.
 * @param  {String} options.host The host of zookeeper.
 * @param  {Number} options.partition The partition of kafka where the data will be saved.
 * @param  {String} options.topic The topic of kafka used to save data. 
 * @param  {Object=} taskData=null The data of task, send to kafka after created.
 * @param  {AddScheduleCallback=} callback=function(){}
 */
exports.addKafkaSchedule = function(options, taskData = null, callback = function() {}) {
    const name = options.name;
    const scheduleNow = scheduleManager.get(name);
    if (scheduleNow) {
        scheduleNow.addData(taskData);
    } else {
        // const className = SCHEDULE_TYPE_MAP[options.type];
        // if (!className) {
        //     slogger.error('invalid schedule type');
        //     return;
        // }
        const client = new kafka.Client(options.host);
        const Producer = kafka.Producer;
        const producer = new Producer(client)

        producer.on('ready', function(err) {
            if (err) {
                return callback(err);
            }
            options.producer = producer;
            const instance = new KafkaProducer(options);
            if (!taskData) {
                scheduleManager.set(name, instance);
                return callback(null,instance);
            }
            instance.addData(taskData,function(err) {
                if (err) {
                    return callback(err);
                }
                scheduleManager.set(name, instance);
                callback(null,instance);
            });
            
        });

        producer.on('error', function (err) {
            if (err) {
                callback(err);
            }
        });
    }
};
