
javascript: (function () {
    var el = document.createElement('div'), yourVolume,
        startTime, stopTime, price, volume, loop, interval, robOrderBtn, per, orderType,
        balance = document.getElementById('lblFullBalance').innerHTML.replace(/,/g, ''),
        highPrice = document.getElementsByClassName('HighAllowedPrice')[0],
        clockElement = document.getElementById('TimerDiv');
    el.innerHTML = '<div style="position:fixed;right:200px;bottom:40px;z-index:999;direction:ltr;padding:5px;border:1px #a9a9a9;border-radius:5px;background-color:#d6d6d6"id=rob-div><div style=margin-bottom:3px><input autocomplete=off id=rob-start placeholder=شروع style=text-align:center value=08:29:55></div><div style=margin-bottom:3px><input autocomplete=off id=rob-stop placeholder=پایان style=text-align:center value=08:30:01></div><div style=margin-bottom:3px><input autocomplete=off id=rob-interval placeholder=اینتروال style=text-align:center value=310></div><div style=margin-bottom:3px><input autocomplete=off id=rob-vol placeholder=حجم style=text-align:center></div><div style=margin-bottom:3px><input autocomplete=off id=rob-pr placeholder=قیمت style=text-align:center></div><div style=margin-bottom:3px;direction:rtl><input value=65 name=ordertype type=radio checked>خرید     <input value=86 name=ordertype type=radio>فروش</div><button id=rob-order style="height:40px;width:100%;background-color:green;color:#fff;border:1px solid;cursor:pointer;font-family:inherit"type=button>درخواست خرید</button></div>';
    document.body.appendChild(el);
    const start = (type) => {
        clearInterval(loop);
        startTime = document.getElementById('rob-start').value;
        stopTime = document.getElementById('rob-stop').value;
        volume = document.getElementById('rob-vol').value;
        price = document.getElementById('rob-pr').value;
        interval = document.getElementById('rob-interval').value;
        var order = GetOrder();
        order.OrderPrice = price;
        order.OrderTotalQuantity = volume;
        order.OrderSide = type;
        if (startTime == '' || volume == '' || price == ''
            || interval == '' || stopTime == '') {
            robOrderBtn.innerHTML = '!!فیلد خالی؟؟';
        } else {
            robOrderBtn.innerHTML = '... در حال انجام';
            loop = setInterval(() => {
                if (clockElement.innerText == startTime) {
                    per = performance.now();
                    clearInterval(loop)
                    buy(order, '');
                }
            }, 1);
        }
    }

    const buy = (order, type) => {
        var buyLoop;
        buyLoop = setInterval(() => {
            clockElement.innerText == stopTime
                && (orderType == '65' ? robOrderBtn.innerHTML = 'درخواست خرید' : robOrderBtn.innerHTML = 'درخواست فروش', clearInterval(buyLoop));
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
                console.log(Math.round(performance.now() - per) + "MS")
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
                        !e.haserror && (clearInterval(buyLoop),
                            (orderType == '65' ? robOrderBtn.innerHTML = 'درخواست خرید' : robOrderBtn.innerHTML = 'درخواست فروش'))
                        console.log(clockElement.innerText, " | " + Math.round(performance.now() - per) + "MS | ", e.Value);
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
        }, interval);
    }

    const calcKarmozd = () => {
        if (orderType === '86') return;
        var todayHigh = highPrice.innerHTML.replace(/,/g, '')
        var karmoz = CalcCountAndNewCommission($("#calcIsin").val(), parseInt(orderType).value, balance, todayHigh);
        document.getElementById('rob-pr').value = todayHigh;
        document.getElementById('rob-vol').value = karmoz.Count;
    }
    const changeBtnStyle = e => {
        var vol = document.getElementById('rob-vol');
        var pr = document.getElementById('rob-pr');
        (e.value === '86')
            ? (robOrderBtn.style.backgroundColor = 'red',
                robOrderBtn.innerText = 'درخواست فروش',
                vol.value = yourVolume,
                pr.value = '')
            : (robOrderBtn.style.backgroundColor = 'green',
                robOrderBtn.innerText = 'درخواست خرید',
                calcKarmozd());
    }
    const initClock = () => {
        startTime = document.getElementById('rob-start');
        stopTime = document.getElementById('rob-stop');
        var clk = clockElement.innerText;
        if (clk > '08:30:00' && clk < '12:35:00') {
            startTime.value = '12:34:55';
            stopTime.value = '12:35:01';
        }
        if (clk > '12:35:00' && clk < '01:40:00') {
            startTime.value = '01:39:55';
            stopTime.value = '01:40:01';
        }
        if (clk > '01:40:00' && clk < '02:20:00') {
            startTime.value = '02:19:55';
            stopTime.value = '02:20:01';
        }
    }
    const getShareDetail = (el) => {
        yourVolume = el.children[2].innerText.replace(/,/g, '');
        if (orderType === '65') {
            setTimeout(() => {
                calcKarmozd();
            }, 400);
        } else {
            document.getElementById('rob-vol').value = yourVolume;
            document.getElementById('rob-pr').value = ''
        }
    }
    [].forEach.call(document.getElementById('portfolioBody').rows, function (el) {
        el.addEventListener('click', () => getShareDetail(el));
    });
    document.getElementsByName('ordertype').forEach(x => x.addEventListener('change', (e) => { orderType = e.target.value; changeBtnStyle(e.target) }))
    robOrderBtn = document.getElementById('rob-order');
    orderType = document.querySelector('[name=ordertype]:checked').value;
    robOrderBtn.addEventListener('click', () => start(orderType));
    highPrice.addEventListener('click', calcKarmozd);
    initClock();
})();