javascript: (function () {
    var el = document.createElement('div');
    el.innerHTML = '<div style="position:fixed;right:200px;bottom:40px;z-index:999;direction:ltr;padding:5px;border:1px #a9a9a9;border-radius:5px;background-color:#d6d6d6"id=rob-div><div style=margin-bottom:3px><input autocomplete=off id=rob-vol placeholder=حجم style=text-align:center></div><div style=margin-bottom:3px><input autocomplete=off id=rob-pr placeholder=قیمت style=text-align:center></div><div style=margin-bottom:3px;direction:rtl><input name=ordertype type=radio value=65 checked>خرید     <input name=ordertype type=radio value=86>فروش</div><button id=rob-order style="height:40px;width:100%;background-color:green;color:#fff;border:1px solid;cursor:pointer;font-family:inherit"type=button>خرید</button></div>';
    document.body.appendChild(el);
    var robOrderBtn, orderType, yourVolume,
        price = document.getElementById('rob-pr'),
        volume = document.getElementById('rob-vol'),
        balance = document.getElementById('lblFullBalance').innerHTML.replace(/,/g, '');
    const SendOrder = (order, type) => {
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
    }

    const changeBtnStyle = e => {
        e.value === '86' ? (robOrderBtn.style.backgroundColor = 'red', robOrderBtn.innerText = 'فروش',
            document.getElementById('rob-pr').value = '', document.getElementById('rob-vol').value = '')
            : (robOrderBtn.style.backgroundColor = 'green', robOrderBtn.innerText = 'خرید')
    }

    const GetShareDetail = (el) => {
        yourVolume = el.children[2].innerText.replace(/,/g, '');
        setTimeout(() => {
            var sellTd = document.querySelector('[id=tblqStock]').rows[2].children[3];
            var buyTd = document.querySelector('[id=tblqStock]').rows[2].children[2];
            orderType === '86' ? fillRobot(sellTd.innerText.replace(/,/g, '')) : fillRobot(buyTd.innerText.replace(/,/g, ''));
            var sellObserver = new MutationObserver(function (mutations) {
                fillRobot(sellTd.innerText.replace(/,/g, ''), 'sell');
            });
            var buyObserver = new MutationObserver(function (mutations) {
                fillRobot(buyTd.innerText.replace(/,/g, ''), 'buy');
            });
            var config = { attributes: true, childList: true, characterData: true };
            sellObserver.observe(sellTd, config);
            buyObserver.observe(buyTd, config);
        }, 500);
    }
    const fillRobot = (bsPrice, type) => {
        if (orderType === '65' && type === 'buy') {
            price.value = bsPrice;
            var k = CalcCountAndNewCommission(document.querySelector('[id=calcIsin]').value, parseInt(orderType), balance, bsPrice);
            volume.value = k.Count;
        } else {
            price.value = bsPrice;
            volume.value = yourVolume;
        }
    }

    [].forEach.call(document.getElementById('portfolioBody').rows, function (el) {
        el.addEventListener('click', () => GetShareDetail(el));
    });

    orderType = document.querySelector('[name=ordertype]:checked').value; //86 mean sell , 65 means buy
    document.getElementsByName('ordertype').forEach(x => x.addEventListener('change', (e) => { changeBtnStyle(e.target); orderType = e.target.value }))
    robOrderBtn = document.getElementById('rob-order');

})();