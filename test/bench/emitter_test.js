const EventEmitter = require('events');
const data = {"content":"对于经常出差的人们来说，提着个笨重的行李箱、还要拿出笔记本找个舒适的姿势工作，绝不是一件轻松的事情。不过一款名为 Smartoo 的小玩意，或许能够给你带来意外的惊喜。1507884372122","avatar_url":"http://ss.bdimg.com/static/superman/img/logo/logo_white_fe6da1ec.png","created_at":1507884371865};
const TEST_DURATION = 30 * 1000;

class MyEvent extends EventEmitter {
    constructor() {
        super();
        this._array = [];
        this._begin = Date.now();
        this.emitT();
    }
    _reEmit() {
        const _this = this;
        setTimeout(function() {
            _this.emitT();
        },500);
    }

    emitT() {
        if (Date.now()-this._begin > TEST_DURATION) {
            return this._reEmit();
        }
        const arr = new Array(5000);
        for (var i=0;i<5000;i++) {
            arr[i] = JSON.stringify(data);
        }
        this.emit('myevent',JSON.stringify(arr));
        this._reEmit();
    }
}

const e = new MyEvent();
e.on('myevent',function(data) {
    console.log(data);
});