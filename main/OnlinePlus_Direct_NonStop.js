javascript: (function () {
    var el = document.createElement('div'), yourVolume, loadingInterval,
        startTime, stopTime, price, volume, loop, interval, robOrderBtn, per, orderType,
        balance = document.getElementsByClassName('customerBalance_Account')[0].innerHTML.replace(/,/g, ''),
        highPrice = document.getElementById('dailyslider_Hight'),
        clockElement = document.getElementsByTagName('clock')[0];
    el.innerHTML = '<div style="position:fixed;left:100px;bottom:10px;z-index:999;direction:ltr;padding:5px;border:1px #a9a9a9;border-radius:5px;background-color:#d6d6d6"id=rob-div><div style=margin-bottom:3px><input autocomplete=off id=rob-start placeholder=شروع style=text-align:center value=08:29:57> شروع</div><div style=margin-bottom:3px><input autocomplete=off id=rob-stop placeholder=پایان style=text-align:center value=08:30:01> پایان</div><div style=margin-bottom:3px><input autocomplete=off id=rob-interval placeholder=اینتروال style=text-align:center value=310> وقفه</div><div style=margin-bottom:3px><input autocomplete=off id=rob-vol placeholder=حجم style=text-align:center> حجم</div><div style=margin-bottom:3px><input autocomplete=off id=rob-pr placeholder=قیمت style=text-align:center> قیمت</div><div style=margin-bottom:3px;direction:rtl>سفارش : <input value=65 name=ordertype type=radio checked>خرید     <input value=86 name=ordertype type=radio>فروش</div><button id=rob-order style="height:40px;width:100%;background-color:green;color:#fff;border:1px solid;cursor:pointer;font-family:inherit"type=button>درخواست خرید</button></div>';
    document.body.appendChild(el);
    const start = (type) => {
        clearInterval(loop);
        startTime = document.getElementById('rob-start').value;
        stopTime = document.getElementById('rob-stop').value;
        volume = document.getElementById('rob-vol').value;
        price = document.getElementById('rob-pr').value;
        interval = document.getElementById('rob-interval').value;
        var order = getOrder(price, volume, type);
        if (startTime == '' || volume == '' || price == ''
            || interval == '' || stopTime == '') {
            robOrderBtn.innerHTML = '!!فیلد خالی؟؟';
        } else {
            robOrderBtn.innerHTML = '... در حال انجام';
            loop = setInterval(() => {
                if (clockElement.innerText == startTime) {
                    per = performance.now();
                    clearInterval(loop)
                    buy(order);
                }
            }, 1);
        }
    }

    const fnCallBack = e => {
        !e.IsSuccessfull && ((orderType == '65' ? robOrderBtn.innerHTML = 'درخواست خرید' : robOrderBtn.innerHTML = 'درخواست فروش'))
        console.log(clockElement.innerText, " | " + Math.round(performance.now() - per) + "MS | ", e.Data);
    }
    const errorCallBack = e => {
        console.log(e, 'error')
    }

    const buy = (order) => {
        var buyLoop;
        buyLoop = setInterval(() => {
            clockElement.innerText == stopTime
                && (orderType == '65' ? robOrderBtn.innerHTML = 'درخواست خرید' : robOrderBtn.innerHTML = 'درخواست فروش', clearInterval(buyLoop));
            SiteServices.SendOrder(order, fnCallBack, errorCallBack)
        }, interval);
    }

    const getOrder = (p, v, t) => {
        return {
            CautionAgreementSelected: false,
            FinancialProviderId: 1,
            IsSymbolCautionAgreement: false,
            IsSymbolSepahAgreement: false,
            SepahAgreementSelected: false,
            isin: SELF_Details.selectedIsin,
            maxShow: 0,
            minimumQuantity: "",
            orderCount: v,
            orderId: 0,
            orderPrice: p,
            orderSide: t,
            orderValidity: 74,
            orderValiditydate: null,
            shortSellIncentivePercent: 0,
            shortSellIsEnabled: false
        }
    }

    const calcKarmozd = () => {
        if (orderType === '86' || SELF_Details.selectedIsin == "") return;
        var todayHigh = highPrice.innerHTML.replace(/,/g, '')
        var k = commissionCalculator._calculateCountByBudget(
            SELF_Details.selectedIsin,
            balance,
            todayHigh,
            orderType == '65' ? true : false);
        document.getElementById('rob-pr').value = todayHigh;
        document.getElementById('rob-vol').value = k;
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
    const getShareDetail = (el, table) => {
        table == 1
            ? (yourVolume = 'ناموجود')
            : (yourVolume = el.innerText.replace(/,/g, ''))
        if (orderType === '65') {
            setTimeout(() => {
                calcKarmozd();
            }, 500);
        } else {
            document.getElementById('rob-vol').value = yourVolum;
            document.getElementById('rob-pr').value = ''
        }
    }
    const initPortfoAndWatchlistTable = e => {
        clearInterval(loadingInterval)
        loadingInterval = setInterval(() => {
            document.getElementsByClassName('newGrid-container')[e]
                .children[0].children[0].children[e == 0 ? 11 : 8].innerText != "" &&
                (Array.from(document.getElementsByClassName('newGrid-container')[e].children).forEach(function (el) {
                    el.firstChild.addEventListener('click', () => getShareDetail(el.firstChild.children[1], e));
                }), clearInterval(loadingInterval))
        }, 300);

    }
    document.getElementsByName('ordertype').forEach(x => x.addEventListener('change', (e) => { orderType = e.target.value; changeBtnStyle(e.target) }))
    robOrderBtn = document.getElementById('rob-order');
    orderType = document.querySelector('[name=ordertype]:checked').value;
    robOrderBtn.addEventListener('click', () => start(orderType));
    highPrice.addEventListener('click', calcKarmozd);
    document.getElementById('btnOpenPortfolios').addEventListener('click', () => initPortfoAndWatchlistTable(0))
    document.getElementById('liWatchlistTab').addEventListener('click', () => initPortfoAndWatchlistTable(1))
    initClock();
    initPortfoAndWatchlistTable(0);
    calcKarmozd();
})();