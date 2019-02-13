# v1.0.0
## Add
1. Emit event when kafkaClient closed.
2. Add the parameter of `prepareMiddleware` to `KafkaProducer`.

## Broken Changes
1. Remove the option of `zookeeperHost` form `KafkaProducer` and `KafkaConsumer`.
2. Remove the `manager` object.
3. Remove the function of `addDataDelay` form `KafkaProducer`.
4. Remove the parameter of `topicList` from `KafkaProducer`.
5. The function `addData` of `KafkaProducer` returns a boolean value, which indicate whether the data to send is vaild.

# v0.6.0
## Add
1. Bump the package `node-kafka` to 3.0.1.

# v0.5.3
## Fix
1. Resovle the issue of double stringify.

# v0.5.2
## Add
1. Add parameter of `fromOffset` to KafkaConsumer.

# v0.5.1
## Add
1. Add feature of emitting event of `KafkaProducer.EVENT_SEND_ERROR`.

# v0.5.0
## Add
1. Use consumerGroup instead of consumer.
2. Add the feature of using broker url to connect to the kafka client.

# v0.3.1
## Add
1. Use HighLevelProducer instead of Producer.
2. Add the feature of setting the groupId of consumer.
3. Add the parameter of the count of messages published to the event of `EVENT_DELAY_MESSAGE_SEND_FINISHED`

# v0.2.1
## Add
1. Do code refactoring, create kafka client in the KafkaProducer and KafkaConsumer.
2. Add feature of emitting event of `KafkaProducer.EVENT_CLIENT_READY` `KafkaProducer.EVENT_CLIENT_ERROR` `KafkaProducer.EVENT_PRODUCER_READY` `KafkaProducer.EVENT_PRODUCER_ERROR` `KafkaConsumer.EVENT_CLIENT_READY` `KafkaConsumer.EVENT_CLIENT_ERROR` `KafkaConsumer.EVENT_CONSUMER_ERROR`.
## Fix
1. Fxed the error of breaking down when call addKafkaSchedule twice with the same name.

# v0.2.0
## Add
1. Add some testcases.
2. Add the feature of emitting event of  `KafkaProducer.EVENT_DELAY_MESSAGE_SEND_FINISHED` when delay message publish finished.

# v0.1.0
## Add
1. Add feature f sending message delay.
2. Add travis-ci.yml.

