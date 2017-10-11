var kafka = require('kafka-node');

var Consumer = kafka.Consumer;
var Offset = kafka.Offset;
var Client = kafka.Client;
var topic = 'topic.1';

var client = new Client(process.env.ZOOKEEPER_PEERS);
client.on('ready',function() {
  console.log('client is ready');
});
client.once('connect', function () {
	client.loadMetadataForTopics([topic], function (error, results) {
	  if (error) {
	  	return console.error(error);
	  }
	  console.log(JSON.stringify(results[1]));
	});
});
var topics = [
    {topic: topic, partition: 0,offset:0},
];
var options = { autoCommit: false, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 , fromOffset:true};

var consumer = new Consumer(client, topics, options);
var offset = new Offset(client);

consumer.on('message', function (message) {
  console.log(message);
});

consumer.on('error', function (err) {
  console.log('error', err);
});

/*
* If consumer get `offsetOutOfRange` event, fetch data from the smallest(oldest) offset
*/
consumer.on('offsetOutOfRange', function (topic) {
  topic.maxNum = 2;
  offset.fetch([topic], function (err, offsets) {
    if (err) {
      return console.error(err);
    }
    var min = Math.min(offsets[topic.topic][topic.partition]);
    consumer.setOffset(topic.topic, topic.partition, min);
  });
});