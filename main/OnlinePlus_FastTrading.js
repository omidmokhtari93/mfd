javascript: (function () {
    var el = document.createElement('div');
    el.innerHTML = '<div style="position:fixed;left:40px;bottom:20px;z-index:999;direction:ltr;padding:5px;border:1px #a9a9a9;border-radius:5px;background-color:#d6d6d6"id=rob-div><div style=margin-bottom:3px><input autocomplete=off id=rob-bal placeholder=سرمایه style=text-align:center value=10000000></div><div style=margin-bottom:3px><input autocomplete=off id=rob-vol placeholder=حجم style=text-align:center></div><div style=margin-bottom:3px><input autocomplete=off id=rob-pr placeholder=قیمت style=text-align:center></div><div style=margin-bottom:3px;direction:rtl><input value=65 name=ordertype type=radio checked>خرید     <input value=86 name=ordertype type=radio>فروش</div><button id=rob-order style="height:40px;width:100%;background-color:green;color:#fff;border:1px solid;cursor:pointer;font-family:inherit"type=button>خرید</button></div>';
    document.body.appendChild(el);
    var robOrderBtn, orderType, yourVolume,
        price = document.getElementById('rob-pr'),
        volume = document.getElementById('rob-vol'),
        balance = document.getElementById('lblFullBalance').innerHTML.replace(/,/g, '');

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

    robOrderBtn = document.getElementById('rob-order');
    document.getElementById('stockqueueBody').rows[0].children[2].addEventListener('click', (e)=>{console.log(e)})
    document.getElementById('stockqueueBody').rows[0].children[3].addEventListener('click', (e)=>{console.log(e)})
})();