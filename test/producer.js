var kafka = require('kafka-node');
var Producer = kafka.Producer;
var KeyedMessage = kafka.KeyedMessage;
var Client = kafka.Client;
var client = new Client(process.env.ZOOKEEPER_PEERS);
//var argv = require('optimist').argv;
var topic = 'first';
var p = 0;
var a = 0;
var producer = new Producer(client, { requireAcks: 1 });

producer.on('ready', function () {
  var message = new Date().toLocaleString();
  var keyedMessage = new KeyedMessage('keyed', 'a keyed message');

  producer.send([
    { topic: topic, partition: p, messages: [message, keyedMessage], attributes: a }
  ], function (err, result) {
    if (err) {
      console.error(err);
    } else {
      console.log(message,result);
    }
    
    process.exit();
  });
});

producer.on('error', function (err) {
  console.log('error', err);
});