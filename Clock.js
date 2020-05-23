










javascript: (function () {
    // var clock = document.getElementById('clock')[0].innerHTML;
    var date = new Date('1970-01-01 ' + '08:29:59');
    console.log(date.getMilliseconds())
})();


setInterval(function () {
    var now = performance.now();
    var clock = document.getElementsByTagName('clock')[0].innerHTML;
    var currentTime = new Date('1970-01-01 ' + clock);
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var seconds = currentTime.getSeconds();
    var milliSeconds = currentTime.getMilliseconds();
    hours = (hours < 10 ? "0" : "") + hours;
    minutes = (minutes < 10 ? "0" : "") + minutes;
    seconds = (seconds < 10 ? "0" : "") + seconds;
    var currentTimeString = hours + ":" + minutes + ":" + seconds + ":" + milliSeconds;
    var later = performance.now();
    counter++;
    counter % 500 == 0 && console.log(currentTimeString, later - now)
}, 1);