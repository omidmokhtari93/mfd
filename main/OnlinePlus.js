
javascript: (function () {
    var el = document.createElement('div');
    el.innerHTML = '<div style="width:200px;position:fixed;right:10px;bottom:10px;z-index:999;direction:ltr;padding:5px;border:1px #a9a9a9;border-radius:5px;background-color:#a9a9a9"id=rob-div><div style=margin-bottom:3px><input autocomplete=off id=rob-time placeholder=زمان style=width:98%;text-align:center></div><div style=margin-bottom:3px><input autocomplete=off id=rob-vol placeholder=حجم style=width:98%;text-align:center></div><div style=margin-bottom:3px><input autocomplete=off id=rob-pr placeholder=قیمت style=width:98%;text-align:center></div><button id=rob-buy style="height:40px;width:100%;background-color:#45b01b;margin-bottom:3px;color:#fff;border:1px solid;cursor:pointer;font-family:inherit"type=button>درخواست خرید</button></div>';
    document.body.appendChild(el);
    var time, price, volume, interval;
    const start = () => {
        document.getElementById('rob-buy').innerHTML = '... در حال انجام'
        time = document.getElementById('rob-time').value;
        volume = document.getElementById('rob-vol').value;
        price = document.getElementById('rob-pr').value;
        interval = setInterval(() => {
            var clock = document.getElementsByTagName('clock')[0].innerHTML
            if (clock == time) {
                buy()
                console.log(clock);
                clearInterval(interval)
                setTimeout(() => {
                    buy()
                    setTimeout(() => {
                        buy()
                        setTimeout(() => {
                            buy(true)
                        }, 900);
                    }, 600);
                }, 300);
            }
        }, 1);
    }

    const buy = e => {
        document.getElementById('send_order_txtCount').value = volume;
        document.getElementById('send_order_txtPrice').value = price;
        var buy = document.getElementById('send_order_btnSendOrder');
        buy.click()
        e && (document.getElementById('rob-buy').innerHTML = 'درخواست خرید')
    }
    document.getElementById('rob-buy').addEventListener('click', start);
    document.getElementById('rob-time').value = '08:30:00'
})();
