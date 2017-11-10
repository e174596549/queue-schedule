const async = require('async');
async.race([
    function(callback) {
        setTimeout(function() {
            console.log('200');
            callback(null, 'one');
        }, 200);
    },
    function(callback) {
        setTimeout(function() {
            console.log('100');
            callback(null, 'two');
        }, 100);
    }
],
// main callback
function(err, result) {
    // the result will be equal to 'two' as it finishes earlier
    console.log(result);
});