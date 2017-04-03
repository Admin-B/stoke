function Chart() {
    if (this.getPrototypeOf(arguments[0]) !== HTMLCanvasElement.prototype) {
        console.warn('Chart Constructor:: parameter is not Canvas Element.');
        return -1;
    }
    var canvas = arguments[0];

    this.window = canvas;

    this.ctx = canvas.getContext('2d');
    this.ctx.translate(0.5, 0.5);

    this.state = {};
    this.options = {
        item: {
            autosize: true,
            width: 5,
            margin: 5,
            style: {
                fillColor: "#000",
                strokeColor: undefined
            }
        },
        chart: {
            reverse: true,
            /*
            style
                :stick
                :line
            */
            style: "stick",
        },
        format: {
            candle: {
                high: "high",
                low: "low",
                close: "close",
                open: "open"
            },
            data: undefined
        }
    };
    this.eventListeners = {};
    return this;
}
Chart.prototype.update = function (items, callback) {
    if (!Array.isArray(items)) {
        console.warn('Chart Update:: parameter is not Array.');
        return -1;
    }
    this.items = arguments[0];

    var max = -Infinity;
    var f = this.options.format.data;
    for (var i = 0; i < this.items.length; i++) {
        if (f === undefined) {
            var d = this.items[i] = Number(this.items[i]);
        } else {
            var d = this.items[i][f] = Number(this.items[i][f]);
        }
        max = d > max ? d : max;
    }

    this.max = max;

    if (this.options.item.autosize) {
        var width = this.window.width;
        this.options.item.width = (width / this.items.length) * 0.8;
        this.options.item.margin = (width / this.items.length) * 0.2;
    }

    if (typeof callback === 'function') {
        callback.apply(this);
    }
    return this;
}
Chart.prototype.reset = function (callback) {

    this.update(this.items);

    if (typeof callback === "function") {
        callback.apply(this);
    }

    return 0;
}
Chart.prototype.render = function (c) {
    if (c !== false) {
        this.ctx.clearRect(-10, -10, this.window.width + 10, this.window.height + 10);
    }

    var ctx = this.ctx;

    ctx.save();

    ctx.beginPath();
    for (var i = 0; i < this.items.length; i++) {
        this.drawItem(i);
    }

    if (this.state.proced) {
        //ctx.lineTo(this.state.proced, this.window.height);
        ctx.strokeStyle = this.options.item.style.strokeColor;
        ctx.stroke();
        delete this.state.proced;
    }

    ctx.closePath();

    ctx.restore();

    return this;
}
Chart.prototype.drawItem = function (i) {
    if (typeof i !== 'number' || i < 0 || this.items.length <= i) {
        return -1;
    }
    var f = this.options.format.data;
    var s = f === undefined ? this.items[i] : this.items[i][f];

    if (this.options.chart.reverse) {
        i = this.items.length - 1 - i;
    }

    var ctx = this.ctx;
    var map = this.map;

    var width = this.window.width;
    var height = this.window.height;

    var w = this.options.item.width;
    var m = this.options.item.margin;


    var x = Math.floor(i * (m + w) + m / 2);
    var h = this.map(s, this.min || 0, this.max, 0, height);

    switch (this.options.chart.style) {
        case "stick":
        default:
            ctx.fillStyle = this.options.item.style.fillColor;
            if (this.options.item.style.strokeColor) {
                ctx.strokeStyle = this.options.item.style.strokeColor;
            } else {
                ctx.strokeStyle = ctx.fillStyle;
            }

            ctx.strokeRect(x, Math.floor(height - h), Math.floor(w), Math.floor(h));
            ctx.fillRect(x, Math.floor(height - h), Math.floor(w), Math.floor(h));
            break;
        case "line":
            var state = this.state;

            x += Math.floor(w / 2);
            y = Math.floor(height - h);

            if (state.proced) {
                ctx.lineTo(x, y);
            } else {
                //ctx.moveTo(x, height);
                ctx.moveTo(x, y);
            }

            state.proced = x;
            break;
    }

    return 0;
}
Chart.prototype.addEventListener = function (type, listener) {
    switch (type) {
        case "mousemove":
        case "mousedown":
        case "mouseup":
        case "click":
        case "wheel":
            if (typeof listener !== "function") {
                return -1;
            }

            var th = this;

            this.window.addEventListener(type, function (e) {
                var pos = th.getMousePos(e);

                var width = th.options.item.width,
                    margin = th.options.item.margin;

                var block = width + margin;
                var index = th.options.chart.reverse ? th.items.length - 1 - Math.floor(pos.x / block) : Math.floor(pos.x / block);

                if (!th.items[index]) {
                    index = undefined;
                }
                if (type === 'wheel') {
                    var e = event.originalEvent || event;
                    listener.apply(th, [{
                        wheelDelta: e.wheelDelta,
                        wheelDeltaX: e.wheelDeltaX,
                        wheelDeltaY: e.wheelDeltaY
                     }, pos, index]);
                     
                    return 0;
                }
                listener.apply(th, [pos, index]);

                return 0;
            });
            break;
        case "mouseout":
            if (typeof listener === "function") {
                var th = this;

                this.window.addEventListener("mouseout", function () {
                    listener.apply(th);
                });

                return 0;
            }
            break;
        default:
            return -1;
    }
    this.eventListeners[type] = listener;
    return 0;
}
Chart.prototype.map = function (a, b, c, d, e) { return (a - b) / (c - b) * (e - d) + d }
Chart.prototype.trigger = function (type, pos) {
    var listener = this.eventListeners[type];
    if (typeof listener !== "function") {
        return -1;
    }
    if (typeof pos !== 'object' || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
        return -1;
    }
    var width = this.options.item.width,
        margin = this.options.item.margin;

    var block = width + margin;
    var index = this.options.chart.reverse ? this.items.length - 1 - Math.floor(pos.x / block) : Math.floor(pos.x / block);

    if (!this.items[index]) {
        index = undefined;
    }

    listener.apply(this, [pos, index]);
    return 0;
}
/***************************** Compatibility *******************************/
if (typeof Element.prototype.addEventListener === 'undefined') {
    Element.prototype.addEventListener = function (e, callback) {
        e = 'on' + e;
        return this.attachEvent(e, callback);
    };
}
/********************************* Methods *********************************/
Chart.prototype.getPrototypeOf = function (element) {
    return element && Object.getPrototypeOf(element);
}
Chart.prototype.getMousePos = function (event) {
    var mouseX, mouseY;
    var e = event.originalEvent || event,
        canvas = event.currentTraget || event.srcElement,
        boundingRect = canvas.getBoundingClientRect();

    if (e.touches) {
        mouseX = e.touches[0].clientX - boundingRect.left;
        mouseY = e.touches[0].clientY - boundingRect.top;
    } else {
        mouseX = e.clientX - boundingRect.left;
        mouseY = e.clientY - boundingRect.top;
    }

    return {
        x: mouseX,
        y: mouseY
    };
}

/********************************************** Candle Chart ************************************************/
function Candle() {
    var c = new Chart(arguments[0]);
    c.drawItem = this.drawItem;
    c.update = this.update;

    return c;
}
Candle.prototype.update = function (items, callback) {
    if (!Array.isArray(items)) {
        console.warn('Candle Update:: parameter is not Array.');
        return -1;
    }
    /* item
        low:
        high:
        open:
        close:
    */
    this.items = arguments[0];

    var max = -Infinity;
    var min = Infinity;

    var f = {
        high: this.options.format.candle.high,
        close: this.options.format.candle.close,
        low: this.options.format.candle.low,
        open: this.options.format.candle.open
    };

    for (var i = 0; i < this.items.length; i++) {
        var h = this.items[i][f.high] = Number(this.items[i][f.high]);
        var l = this.items[i][f.low] = Number(this.items[i][f.low]);
        this.items[i][f.open] = Number(this.items[i][f.open]);
        this.items[i][f.close] = Number(this.items[i][f.close]);

        var high = h;
        var low = l;
        max = high > max ? high : max;
        min = low < min ? low : min;
    }

    this.min = min;
    this.max = max;

    if (this.options.item.autosize) {
        var width = this.window.width;
        this.options.item.width = (width / this.items.length) * 0.8;
        this.options.item.margin = (width / this.items.length) * 0.2;
    }
    if (typeof callback === 'function') {
        callback.apply(this);
    }

    return this;
}
Candle.prototype.drawItem = function (i) {
    if (typeof i !== 'number' || i < 0 || this.items.length <= i) {
        return -1;
    }
    var s = this.items[i];
    i = this.options.chart.reverse ? this.items.length - 1 - i : i;

    var ctx = this.ctx;
    var map = this.map;

    var width = this.window.width;
    var height = this.window.height;



    var w = this.options.item.width;
    var m = this.options.item.margin;

    var f = {
        high: this.options.format.candle.high,
        close: this.options.format.candle.close,
        low: this.options.format.candle.low,
        open: this.options.format.candle.open
    };

    ctx.save();
    /* high and low */
    var x = Math.floor(i * (m + w) + (m + w) / 2);

    ctx.strokeStyle = "#5d5d5d";
    ctx.beginPath();
    ctx.moveTo(x, Math.floor(height - map(s[f.high], this.min, this.max, 0, height)));
    ctx.lineTo(x, Math.floor(height - map(s[f.low], this.min, this.max, 0, height)));
    ctx.stroke();
    ctx.closePath();

    /* open and close */
    if (s[f.close] > s[f.open]) {
        ctx.fillStyle = "red";
        var top = height - map(s[f.close], this.min, this.max, 0, height);
        var h = (height - map(s[f.open], this.min, this.max, 0, height)) - top;
    }
    else {
        ctx.fillStyle = "#2E9AFE";
        var top = height - map(s[f.open], this.min, this.max, 0, height);
        var h = (height - map(s[f.close], this.min, this.max, 0, height)) - top;
    }

    ctx.strokeStyle = "#000";

    var x = Math.floor(i * (m + w) + m / 2);
    ctx.strokeRect(x, Math.floor(top), Math.floor(w), Math.floor(h));
    ctx.fillRect(x, Math.floor(top), Math.floor(w), Math.floor(h));

    ctx.restore();
    return 0;
}