javascript: (function () {
    const jq = document.createElement('script');
    jq.src = 'https://code.jquery.com/jquery-3.5.0.min.js';
    document.body.appendChild(jq);
    jq.onload = () => {
        const html = '<div style="width:200px;position:fixed;right:10px;bottom:10px;direction:rtl;z-index:9999;padding:5px;border:1px #a9a9a9;border-radius:5px;background-color:#a9a9a9"id=rob-div><div style=margin-bottom:3px;direction:rtl><span style=float:left id=rob-clock></span> <span style=float:right>ساعت رسمی</span></div><button id=rob-buyshare-req style="height:40px;width:100%;background-color:#45b01b;margin-bottom:3px;color:#fff;border:1px solid;cursor:pointer;font-family:inherit"type=button>درخواست خرید</button> <button id=rob-sellshare-req style="height:40px;width:100%;background-color:#ee322b;color:#fff;border:1px solid;cursor:pointer;font-family:inherit"type=button>درخواست فروش</button></div>';
        $('body').append(html);
        var sellInterval, buyInterval, sellActive = false, buyActive = false;

        $('#rob-buyshare-req').on('click', function () {
            if ($('[name=orderPrice]').val() == '' || $('[name=orderQuantity]').val() == '') return;
            if (buyActive) {
                clearInterval(buyInterval);
                buyActive = false;
                $('#rob-buyshare-req').text('درخواست خرید')
                return;
            }
            buyInterval = setInterval(() => {
                buyActive = true;
                $('#rob-buyshare-req').text('توقف')
                $('.buy-btn').click();
            }, 330);
        });

        $('#rob-sellshare-req').on('click', function () {
            if ($('[name=orderPrice]').val() == '' || $('[name=orderQuantity]').val() == '') return;
            if (sellActive) {
                clearInterval(sellInterval)
                sellActive = false
                $('#rob-sellshare-req').text('درخواست فروش')
                return;
            }
            sellInterval = setInterval(() => {
                $('#rob-sellshare-req').text('توقف')
                sellActive = true;
                $('.sell-btn').click();
            }, 330);
        });

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