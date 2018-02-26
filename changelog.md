## 0.5.3

1. Resovle the issue of double stringify.

## 0.5.2

1. Add parameter of `fromOffset` to KafkaConsumer.

## 0.5.1

1. Add feature of emitting event of `KafkaProducer.EVENT_SEND_ERROR`.

## 0.5
1. Use consumerGroup instead of consumer.
2. Add the feature of using broker url to connect to the kafka client.

## 0.3.1
1. Use HighLevelProducer instead of Producer.
2. Add the feature of setting the groupId of consumer.
3. Add the parameter of the count of messages published to the event of `EVENT_DELAY_MESSAGE_SEND_FINISHED`

## 0.2.1

1. Do code refactoring, create kafka client in the KafkaProducer and KafkaConsumer.
2. Fxed the error of breaking down when call addKafkaSchedule twice with the same name.
3. Add feature of emitting event of `KafkaProducer.EVENT_CLIENT_READY` `KafkaProducer.EVENT_CLIENT_ERROR` `KafkaProducer.EVENT_PRODUCER_READY` `KafkaProducer.EVENT_PRODUCER_ERROR` `KafkaConsumer.EVENT_CLIENT_READY` `KafkaConsumer.EVENT_CLIENT_ERROR` `KafkaConsumer.EVENT_CONSUMER_ERROR`.

## 0.2

1. Add some testcases.
2. Add the feature of emitting event of  `KafkaProducer.EVENT_DELAY_MESSAGE_SEND_FINISHED` when delay message publish finished.

## 0.1.0

1. Add feature f sending message delay.
2. Add travis-ci.yml.

