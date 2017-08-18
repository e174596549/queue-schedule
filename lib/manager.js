const slogger = require('node-slogger');
const KafkaProducer = require('./KafkaProducer');
const kafka = require('kafka-node');
const scheduleManager = new Map();
const SCHEDULE_TYPES = exports.SCHEDULE_TYPES = {
    'KAFKA' : 1
};
const SCHEDULE_TYPE_MAP = {
    [SCHEDULE_TYPES.KAFKA] : KafkaProducer
};


exports.addKafkaSchedule = function(options, taskData) {
    const name = options.name;
    const scheduleNow = scheduleManager.get(name);
    if (scheduleNow) {
        scheduleNow.addData(taskData);
    } else {
        const className = SCHEDULE_TYPE_MAP[options.type];
        if (!className) {
            slogger.error('invalid schedule type');
            return;
        }
        const client = new kafka.Client(options.kafkaConfig);
        const Producer = kafka.Producer;
        const producer = new Producer(client)

        producer.on('ready', function(err) {
            if (err) {
                slogger.error('producer init fail');
                return;
            }
            options.producer = producer;
            scheduleManager.set(name, new className(options));
            scheduleManager.get(name).addData(taskData);
        })

        producer.on('error', function (err) {
            if (err) {
                slogger.error('producer error');
            }
        })
    }
};
