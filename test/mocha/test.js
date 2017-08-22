const kafka = require('kafka-node');
const client = new kafka.Client();

describe('kafka server', function() {

    it('create a topic', function(done) {
        const Producer = kafka.Producer;
        const producer = new Producer(client);
        producer.on('ready', function (err) {
            if (err) {
                console.log('ready: ', err);
            }
            producer.createTopics(['test3'], false, function (err, data) {
                if (err) {
                    console.log('err', err);
                    return
                }
                console.log(data);
                done();
            });
        })

        const Consumer = kafka.Consumer;
        const consumer = new Consumer(
            client,
            [
                { topic, partition: 0 }
            ],
            {
                autoCommit: false
            }
        );
        // consumer.removeTopics(['test3'], function (err, removed) {
        //     console.log('removed: ', removed);
        // });

        consumer.on('message', function (message) {
            console.log(message);

        });

        // client.loadMetadataForTopics([], function (error, results) {
        //     if (error) {
        //     return console.error(error);
        //     }
        //     console.log(results);
        //     done();
        // });

        setTimeout(() => done(), 1000)
    })
});
