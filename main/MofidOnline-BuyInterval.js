
javascript: (function () {
    var el = document.createElement('div'),
        startTime, stopTime, price, volume, loop, interval, buyBtn, robBuyBtn, per,
        balance = document.getElementById('lblFullBalance').innerHTML.replace(/,/g, ''),
        highPrice = document.getElementsByClassName('HighAllowedPrice')[0],
        txtCount = document.getElementById('txtCount'),
        txtPrice = document.getElementById('txtPrice'),
        clockElement = document.getElementById('TimerDiv');
    el.innerHTML = '<div style="width:200px;position:fixed;right:200px;bottom:40px;z-index:999;direction:ltr;padding:5px;border:1px #a9a9a9;border-radius:5px;background-color:#a9a9a9"id=rob-div><div style=margin-bottom:3px><input autocomplete=off id=rob-start placeholder=شروع style=width:98%;text-align:center value=08:29:59></div><div style=margin-bottom:3px><input autocomplete=off id=rob-stop placeholder=پایان style=width:98%;text-align:center value=08:30:01></div><div style=margin-bottom:3px><input autocomplete=off value=310 id=rob-interval placeholder=اینتروال style=width:98%;text-align:center></div><div style=margin-bottom:3px><input autocomplete=off id=rob-vol placeholder=حجم style=width:98%;text-align:center></div><div style=margin-bottom:3px><input autocomplete=off id=rob-pr placeholder=قیمت style=width:98%;text-align:center></div><button id=rob-buy style="height:40px;width:100%;background-color:#45b01b;margin-bottom:3px;color:#fff;border:1px solid;cursor:pointer;font-family:inherit"type=button>درخواست خرید</button></div>';
    document.body.appendChild(el);
    const start = () => {
        clearInterval(loop);
        startTime = document.getElementById('rob-start').value;
        stopTime = document.getElementById('rob-stop').value;
        volume = document.getElementById('rob-vol').value;
        price = document.getElementById('rob-pr').value;
        interval = document.getElementById('rob-interval').value;
        buyBtn = document.getElementById('btnBuy');
        if (startTime == '' || volume == '' || price == ''
            || interval == '' || stopTime == '') {
            robBuyBtn.innerHTML = '!!فیلد خالی؟؟';
        } else {
            robBuyBtn.innerHTML = '... در حال انجام';
            loop = setInterval(() => {
                if (clockElement.innerText == startTime) {
                    clearInterval(loop)
                    per = performance.now();
                    buy();
                }
            }, 1);
        }
    }

    const buy = e => {
        var buyLoop;
        buyLoop = setInterval(() => {
            console.log(clockElement.innerText, performance.now() - per + 'ms after start');
            clockElement.innerText == stopTime && (clearInterval(buyLoop), robBuyBtn.innerHTML = 'درخواست خرید');
            txtCount.value = volume;
            txtPrice.value = price;
            buyBtn.click()
        }, interval);
    }

    const calcKarmozd = todayHigh => {
        console.log(balance, todayHigh)
        var karmoz = CalcCountAndNewCommission($("#calcIsin").val(), 65, balance, todayHigh);
        document.getElementById('rob-pr').value = todayHigh;
        document.getElementById('rob-vol').value = karmoz.Count;
        console.log(karmoz)
    }
    robBuyBtn = document.getElementById('rob-buy');
    robBuyBtn.addEventListener('click', start);
    highPrice.addEventListener('click', () => calcKarmozd(highPrice.innerHTML.replace(/,/g, '')))
})();

