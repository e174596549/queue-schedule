// const {expect} = require('chai');
const {globalEvent} = require('../../index');
before(function() {
    console.log('add event log');
    globalEvent.on(globalEvent.EVENT_CLIENT_READY,function(kafkaHost) {
        console.log('EVENT_CLIENT_READY',kafkaHost,'client ready');
    });
    globalEvent.on(globalEvent.EVENT_CLIENT_ERROR,function(kafkaHost,err) {
        console.error('EVENT_CLIENT_ERROR',kafkaHost,err);
    });
    globalEvent.on(globalEvent.EVENT_CLIENT_CLOSE,function(kafkaHost) {
        console.log('EVENT_CLIENT_CLOSE',kafkaHost,'close');
    });
    globalEvent.on(globalEvent.EVENT_PRODUCER_READY,function(kafkaHost) {
        console.log('EVENT_PRODUCER_READY',kafkaHost,'producer ready');
    });
    globalEvent.on(globalEvent.EVENT_PRODUCER_ERROR,function(kafkaHost,err) {
        console.error('EVENT_PRODUCER_ERROR',kafkaHost,err);
    });
});
