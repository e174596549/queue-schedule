var kafka = require('kafka-node');

var topic = 'first';


var consumer = //new Consumer(client, topics, options);
new kafka.ConsumerGroup({
  groupId:'testbygroup',//the consumer group can only be found in kafka manange, not in zookeeper
  kafkaHost:process.env.KAFKA_PEERS,
  autoCommit: true,
  fromOffset:'earliest'
},[topic]);
// var offset = new Offset(client);

consumer.on('message', function (message) {
  console.log(message);
});

consumer.on('error', function (err) {
  console.log('error', err);
});

