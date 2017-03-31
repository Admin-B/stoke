/*************************************************/
/*DOM UI*/
/*************************************************/
$(document).ready(function () {
    $(".company-block").click(function () {
        var $th = $(this);
        var t = $th.attr("data-id");
        if (nowSymbol === "loading" || nowSymbol === t) {
            return;
        }

        loadQuote(t, new Date());

        $(".company-block.active").removeClass("active");
        $th.addClass("active");
    });
    $(".btn-search").click(function () {
        var t = $(".input-search").val();
        if (nowSymbol === "loading" || t === nowSymbol) {
            return;
        }
        loadQuote(t, new Date(), function () {
        });
    });

    $(".options[data-type=time] div").click(function () {
        var $th = $(this);
        if ($th.hasClass("active") || nowSymbol === "loading") {
            return;
        }
        /* example */
        // d:1 - 1 day
        // m:1 - 1 month
        var s = $th.attr("data-value").split(":");

        var f = s[0];
        var v = Number(s[1]);

        if (interval[f] === undefined || interval[f] === v || isNaN(v)) {
            return;
        }

        interval[f] = v;
        loadQuote(nowSymbol, new Date());

        $(".options[data-type=time] div.active").removeClass("active");
        $th.addClass("active");

    });
    $(window).keydown(function (e) {
        if (nowSymbol === "loading") {
            return;
        }

        switch (e.keyCode) {
            case 37:
                getMove('left', function (arr) {
                    c.update(arr, onUpdate);
                    s.update(arr, function () {
                        s.render();
                    }); 
                    c.trigger('mousemove', prevMousePos);
                });
                break;
            case 39:
                getMove('right', function (arr) {
                    c.update(arr, onUpdate);
                    s.update(arr, function () {
                        s.render();
                    }); 
                    c.trigger('mousemove', prevMousePos);
                });
                break;
            case 38:
                getMove('top', function (arr) {
                    c.update(arr, onUpdate);
                    s.update(arr, function () {
                        s.render();
                    });
                    c.trigger('mousemove', prevMousePos);
                });
                break;
            case 40:
                getMove('bottom', function (arr) {
                    c.update(arr, onUpdate);
                    s.update(arr, function () {
                        s.render();
                    }); 
                    c.trigger('mousemove', prevMousePos);
                });
                break;
        }
    });
    function getMove(dir, callback) {
        if (typeof callback !== 'function') {
            return -1;
        }
        var t = cache[nowSymbol];
        switch (dir) {
            case "left":
                if (t.s + t.l >= t.data.length) {
                    return;
                }
                $(".options[data-type=time] div.active").removeClass("active");
                interval = {
                    m: NaN
                };
                t.s = t.s + 1;
                var tarry = t.data.slice(t.s, t.s + t.l);

                callback(tarry);
                break;
            case "right":
                if (t.s <= 0) {
                    return;
                }
                $(".options[data-type=time] div.active").removeClass("active");
                interval = {
                    m: NaN
                };
                t.s = t.s - 1;
                var tarry = t.data.slice(t.s, t.s + t.l);

                callback(tarry);
                break;
            case "top":
                if (t.l <= 1) {
                    return;
                }
                $(".options[data-type=time] div.active").removeClass("active");
                interval = {
                    m: NaN
                };
                t.l -= 1;
                var tarry = t.data.slice(t.s, t.s + t.l);

                callback(tarry);
                break;
            case "bottom":
                if (t.l + t.s >= t.data.length) {
                    return;
                }
                $(".options[data-type=time] div.active").removeClass("active");
                interval = {
                    m: NaN
                };
                t.l += 1;
                var tarry = t.data.slice(t.s, t.s + t.l);

                callback(tarry);
                break;
        }
    }
});
