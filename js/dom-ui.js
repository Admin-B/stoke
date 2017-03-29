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
    
    $(".options[data-type=time] div").click(function(){
        var $th = $(this);
        if($th.hasClass("active") || nowSymbol === "loading"){
            return;
        }
        /* example */
        // d:1 - 1 day
        // m:1 - 1 month
        var s = $th.attr("data-value").split(":");
       
        var f = s[0];
        var v = Number(s[1]);
        
        if(interval[f] === undefined || interval[f] === v || v === NaN){
            return;
        }

        interval[f] = v;
        loadQuote(nowSymbol, new Date());

        $(".options[data-type=time] div.active").removeClass("active");
        $th.addClass("active");

    });
});