javascript: (function () {
    const notify = document.createElement('script');
    notify.src = 'https://rawgit.com/notifyjs/notifyjs/master/dist/notify.js';
    document.body.appendChild(notify);
    notify.onload = () => {
        var sellInterval, buyInterval, sellActive = false, buyActive = false;
        const html = '<div style="width:200px;position:fixed;left:10px;bottom:50px;z-index:999;direction:rtl;padding:5px;border:1px #a9a9a9;border-radius:5px;background-color:#a9a9a9"id=rob-div><div style=margin-bottom:3px><span id=rob-clock style=float:left></span> ساعت رسمی</div><div style=margin-bottom:3px><input autocomplete=off id=rob-share-search placeholder=نماد style=width:98%></div><div style=margin-bottom:3px><input autocomplete=off id=rob-share-vol placeholder=حجم style=width:98%></div><div style=margin-bottom:3px><input autocomplete=off id=rob-share-pr placeholder=قیمت style=width:98%></div><button id=rob-buyshare-req style="height:40px;width:100%;background-color:#45b01b;margin-bottom:3px;color:#fff;border:1px solid;cursor:pointer"type=button>درخواست خرید</button> <button id=rob-sellshare-req style="height:40px;width:100%;background-color:#ee322b;color:#fff;border:1px solid;cursor:pointer"type=button>درخواست فروش</button></div>';
        $('body').append(html);
        $('#rob-share-search').autoComplete({
            ajax: '/StockAutoCompleteHandler.ashx?ShowAll=0&MarketType=0&lan=fa&ShowNotApproved=0',
            autoFill: false,
            width: 200,
            onLoad: StockAutoComplate_Onload = function (self, lst) {
                var arr = lst.list.split('\n');
                var res = new Array();
                for (i = 0; i < arr.length; i++) {
                    var a = new Object();
                    a.innervalue = arr[i];
                    var temp = a.innervalue.split(',');
                    a.display = temp[0] + ' --- ' + temp[2];
                    a.value = temp[2];
                    if (filterItem(a.display)) res[res.length] = a;
                } return res;
            }, onSelect: StockAutoComplate_OnSelect = function (a1, a2) {
                $('#hiddrpExchangeList').val(a2.data.innervalue);
                callbackF(a2.data);
            }
        });

        $('#rob-buyshare-req').on('click', function () {
            console.log(buyActive)
            if (buyActive) {
                clearInterval(buyInterval);
                buyActive = false;
                $('#rob-buyshare-req').text('درخواست خرید')
                return;
            }
            buyInterval = setInterval(() => {
                buyActive = true;
                $('#rob-buyshare-req').text('توقف')
                var order = GetOrder();
                order.OrderPrice = $('#rob-share-pr').val()
                order.OrderTotalQuantity = $('#rob-share-vol').val()
                order.OrderSide = "65"
                BuyOrSell(order, '')
            }, 370);
        });

        $('#rob-sellshare-req').on('click', function () {
            console.log(sellActive)
            if (sellActive) {
                clearInterval(sellInterval)
                sellActive = false
                $('#rob-sellshare-req').text('درخواست فروش')
                return;
            }
            sellInterval = setInterval(() => {
                $('#rob-sellshare-req').text('توقف')
                sellActive = true;
                var order = GetOrder();
                order.OrderPrice = $('#rob-share-pr').val()
                order.OrderTotalQuantity = $('#rob-share-vol').val()
                order.OrderSide = "86"
                BuyOrSell(order, '')
            }, 370);
        });

        function BuyOrSell(order, type) {
            var ff = function (ajr) {
                var ts = null;
                var json = null;
                var ss = null;
                if (needToken) {
                    if (!checkSupportSign()) {

                        alert(addOrderResourceYouMustLogin);
                        return false;
                    };
                    ts = ajr.tt;
                    ss = ajr.ssign;
                    var toSign = "customerid:" + addorderCustomerId + ",ts:" + ts + ",sgn:" + ss;
                    json = sign(toSign.toLowerCase());
                    if (json == null) {

                        alert(addOrderResourceSignProblem);
                        return;
                    };
                }
                else { json = ""; };
                $.ajax({
                    type: "POST",
                    url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
                    data: Object.toJSON({
                        "Mode": "buysell",
                        "SymbolId": order.SymbolId,
                        "OrderPrice": order.OrderPrice,
                        "OrderType": order.OrderType,
                        "OrderSide": order.OrderSide,
                        "OrderValidity": order.OrderValidity,
                        "OrderValiditydate": order.OrderValiditydate,
                        "OrderTotalQuantity": order.OrderTotalQuantity,
                        "TriggerPrice": order.TriggerPrice,
                        "MinimumQuantity": order.MinimumQuantity,
                        "MaxShown": order.MaxShown,
                        "BourseCode": order.BourseCode,
                        "isin": order.ISIN,
                        "pk": order.pk,
                        "OrderMode": order.OrderMode,
                        "orderid": order.orderid,
                        "OrderExpectedQuantity": order.OrderExpectedQuantity,
                        "ts": ts,
                        "cs": encodeURIComponent(json),
                        "ss": encodeURIComponent(ss),
                        "SymbolNsc": order.SymbolNsc,
                        "SendSMS": order.SendSMS,
                        "browserTime": order.browserTime,
                        "IsSymbolInAgreement": order.IsSymbolInAgreement,
                        "AcceptedAgreement": order.AcceptedAgreement
                    }),
                    success: function (msg) {
                        let e = JSON.parse(msg);
                        $("#rob-div").notify(e.Value,
                            {
                                position: "right",
                                className: e.haserror ? 'error' : 'success'
                            }
                        );
                        if (!e.haserror) {
                            clearInterval(buyInterval)
                            clearInterval(sellInterval)
                            buyActive = false;
                            sellActive = false;
                        }
                    }
                });
            };
            if (needToken) {
                $.ajax({
                    type: "GET",
                    url: "../9/0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
                    data: Object.toJSON({ "Mode": "getTimeStamp" }),
                    success: function (msg) { var ajr = msg.parseJSON(); ff(ajr); }
                });
            }
            else { ff(""); };
            ShowOrderMessage(sendtonetwork);
            return false;
        };

        setInterval(function () {
            var currentTime = new Date(Date.now() + 27900);
            var hours = currentTime.getHours();
            var minutes = currentTime.getMinutes();
            var seconds = currentTime.getSeconds();
            hours = (hours < 10 ? "0" : "") + hours;
            minutes = (minutes < 10 ? "0" : "") + minutes;
            seconds = (seconds < 10 ? "0" : "") + seconds;
            var currentTimeString = hours + ":" + minutes + ":" + seconds;
            $("#rob-clock").html(currentTimeString);
        }, 1000);
    }
})();