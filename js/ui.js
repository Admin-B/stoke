function loadQuote(symbol, date, callback) {
    var q;
    var d = new Date(date);

    d.setMonth(d.getMonth() - interval.m);

    /* 그리니치 표준시로 조정 */
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());

    var sf = d.format("yyyy-MM-dd");
    var ef = date.format("yyyy-MM-dd");

    var tk = nowSymbol;

    nowSymbol = "loading";

    $(".loading-cover").show();
    $.ajax({
        url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20%20%20yahoo.finance.historicaldata%0A%20%20%20%20%20%20%20%20%20where%20%20symbol%20%20%20%20%3D%20%22" + symbol + "%22%0A%20%20%20%20%20%20%20%20%20and%20%20%20%20startDate%20%3D%20%22" + sf + "%22%0A%20%20%20%20%20%20%20%20%20and%20%20%20%20endDate%20%20%20%3D%20%22" + ef + "%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=",
        dataType: "json",
        type: "get",
        success: function (res) {
            $(".loading-cover").hide();
            if (!res.query.results) {
                alert("No Results : 검색결과가 없습니다.");
                nowSymbol = tk;
                return;
            }
            nowSymbol = symbol;

            q = res.query.results.quote;

            if (cache[symbol]) {
                var l = cache[symbol].data.length;
                if (q.length > l) {
                    cache[symbol].data = q;
                }
            } else {
                cache[symbol] = {
                    data: q,
                    s: 0,
                    l: 0
                };
            }
            cache[symbol].s = 0;
            cache[symbol].l = q.length;

            c.update(q, onUpdate);
            s.update(q, function () {
                s.render();
            });
            /*
            adj.update(q, function(){
                adj.min = c.min;
                adj.max = c.max;
                adj.render();
            });
            */
            if (typeof callback === "function") {
                callback();
            }
        }
    });
}

//005930.KS -> 삼성전자
loadQuote("005930.KS", new Date(), function () {
    c.addEventListener("mouseout", function () {
        fCtx.clearRect(-100, -100, this.window.width + 500, this.window.height + 500);
    });
    c.addEventListener('mousemove', function (pos, index) {
        var s = this.items[index];

        var width = this.window.width;
        var height = this.window.height;

        fCtx.save();
        fCtx.clearRect(-100, -100, width + 200, height + 200);

        var price = Math.floor(this.map(height - pos.y, 0, height, this.min, this.max));

        fCtx.fillStyle = "rgba(0,0,0,0.1)";

        var ty = pos.y - 6 < 0 ? 0 : pos.y - 6;
        if (ty + 15 > height) {
            ty = height - 15;
        }

        fCtx.fillRect(width, ty, 100, 15);

        fCtx.font = "bold 13px 맑은고딕";
        fCtx.textBaseline = "middle";

        fCtx.fillStyle = "#333";
        fCtx.fillText(numberWithCommas(price), width + 5, ty + 6);

        fCtx.beginPath();
        fCtx.strokeStyle = "#333";

        fCtx.moveTo(0, pos.y);
        fCtx.lineTo(width, pos.y);
        fCtx.stroke();

        fCtx.closePath();

        if (!s) {
            fCtx.restore();
            return;
        }

        var x = (this.options.item.width + this.options.item.margin);
        x = Math.floor(x * (this.items.length - 1 - index) + x / 2);

        fCtx.beginPath();

        fCtx.setLineDash([5, 15]);
        if (s.Open === s.Close) {
            fCtx.strokeStyle = "#aaa";
        } else {
            fCtx.strokeStyle = s.Open < s.Close ? 'red' : 'blue';
        }

        fCtx.moveTo(x, 0);
        fCtx.lineTo(x, (height - this.map(s.High, this.min, this.max, 0, height)) - 10);
        fCtx.stroke();

        fCtx.moveTo(x, height);
        fCtx.lineTo(x, (height - this.map(s.Low, this.min, this.max, 0, height)) + 10);
        fCtx.stroke();

        fCtx.closePath();

        fCtx.fillText(s.Date, 5, 27);

        /* render candle's information */
        /* : low */
        /* : high */
        /* : open */
        /* : close */
        var x = x;
        var y = pos.y - 85;

        var ox = x;

        if (x + 120 > width) {
            x = width - 120;
        }

        if (y < 0) {
            y = 0;
        }

        fCtx.fillStyle = "rgba(129,190,247,0.2)";
        fCtx.fillRect(x, y, 120, 85);

        fCtx.fillStyle = "#000";
        fCtx.font = "bold 14px 맑은고딕";
        fCtx.textBaseline = "bottom";

        fCtx.fillText("open", x + 5, y + 20);
        fCtx.fillText("close", x + 5, y + 40);
        fCtx.fillText("high", x + 5, y + 60);
        fCtx.fillText("low", x + 5, y + 80);
        if (s.Open === s.Close) {
            fCtx.fillStyle = "#000";
        } else {
            fCtx.fillStyle = s.Open < s.Close ? 'red' : 'blue';
        }

        fCtx.fillText(numberWithCommas(Math.floor(s.Open)), x + 45, y + 20);
        fCtx.fillText(numberWithCommas(Math.floor(s.Close)), x + 45, y + 40);
        fCtx.fillText(numberWithCommas(Math.floor(s.High)), x + 45, y + 60);
        fCtx.fillText(numberWithCommas(Math.floor(s.Low)), x + 45, y + 80);

        fCtx.restore();
        prevMousePos = pos;
    });
});

function onUpdate() {
    var ctx = this.ctx;
    var max = this.max;
    var min = this.min;

    var w = this.window.width;
    var h = this.window.height;

    var pGap = (max - min) / 10;
    var pVal = getPlaceValue(pGap);

    ctx.clearRect(-10, -10, w + 10, h + 10);

    /* place canvas rendering */
    pCtx.save();
    pCtx.clearRect(-10, -10, w + 10, h + 10);
    pCtx.textBaseline = "middle";
    pCtx.font = "13px 맑은고딕";

    ctx.save();
    ctx.strokeStyle = "#5d5d5d";
    for (var i = 0; i <= 15; i++) {
        var price = this.min - (this.min % pVal) + (pVal * i);
        var y = Math.floor(h - this.map(price, min, max, 0, h));

        pCtx.fillText(numberWithCommas(price), 5, y);

        ctx.beginPath();
        ctx.strokeStyle = "#ccc";
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
        ctx.closePath();
    }

    var b = this.options.item.width + this.options.item.margin;

    var pDate;
    for (var i = 0; i < this.items.length; i++) {
        var tDate = new Date(this.items[i].Date);
        if (!pDate || pDate.getMonth() === tDate.getMonth()) {
            pDate = tDate;
            continue;
        }
        pDate = tDate;

        var x = Math.floor(b * (this.items.length - i) + b / 2);

        ctx.beginPath();
        ctx.strokeStyle = "#ccc";
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.closePath();

        ctx.stroke();
    }
    ctx.textAlign = "start";
    ctx.textBaseline = "top";

    ctx.font = "bold 14px 맑은 고딕";
    ctx.fillText('Symbol ' + nowSymbol + ' (UTC)', 5, 0);
    ctx.restore();

    pCtx.restore();
    /***************************/

    this.render(false);
}
function getPlaceValue(n) {
    var pV = 0;

    while (n > pV) {
        pV += 5;
    }

    if (pV === 0) {
        return 1;
    }

    return pV - 5;
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
