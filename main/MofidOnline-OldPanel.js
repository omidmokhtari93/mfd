
javascript: (function () {
    var el = document.createElement('div'),
        time, price, volume, interval, delay, buyBtn, robBuyBtn, per,
        txtCount = document.getElementById('txtCount'),
        txtPrice = document.getElementById('txtPrice'),
        clockElement = document.getElementById('TimerDiv');
    el.innerHTML = '<div style="width:200px;position:fixed;right:200px;bottom:40px;z-index:999;direction:ltr;padding:5px;border:1px #a9a9a9;border-radius:5px;background-color:#a9a9a9"id=rob-div><div style=margin-bottom:3px><input autocomplete=off id=rob-time placeholder=زمان style=width:98%;text-align:center></div><div style=margin-bottom:3px><input autocomplete=off id=rob-delay placeholder=تاخیر style=width:98%;text-align:center></div><div style=margin-bottom:3px><input autocomplete=off id=rob-vol placeholder=حجم style=width:98%;text-align:center></div><div style=margin-bottom:3px><input autocomplete=off id=rob-pr placeholder=قیمت style=width:98%;text-align:center></div><button id=rob-buy style="height:40px;width:100%;background-color:#45b01b;margin-bottom:3px;color:#fff;border:1px solid;cursor:pointer;font-family:inherit"type=button>درخواست خرید</button></div>';
    document.body.appendChild(el);
    const start = () => {
        clearInterval(interval);
        time = document.getElementById('rob-time').value;
        volume = document.getElementById('rob-vol').value;
        price = document.getElementById('rob-pr').value;
        delay = document.getElementById('rob-delay').value;
        buyBtn = document.getElementById('btnBuy');
        if (time == '' || volume == '' || price == '' || delay == '') {
            robBuyBtn.innerHTML = '!!فیلد خالی؟؟';
        } else {
            robBuyBtn.innerHTML = '... در حال انجام';
            txtCount.value = volume;
            txtPrice.value = price;
            interval = setInterval(() => {
                if (clockElement.innerText == time) {
                    clearInterval(interval)
                    per = performance.now();
                    setTimeout(() => {
                        buyBtn.click()
                        console.log(performance.now() - per + ' ms after start');
                        robBuyBtn.innerHTML = 'درخواست خرید';
                    }, delay);
                }
            }, 1);
        }
    }
    robBuyBtn = document.getElementById('rob-buy');
    robBuyBtn.addEventListener('click', start);
    document.getElementById('rob-time').value = '08:29:59';
})();

