function clockTick() {
    if (dtLast == typeof ("undefined") || dtLast == null) var dtLast = $("#TimerDiv")[0].Time_JS_dtold;
    var hh = parseFloat($("#HourHidden").val());
    var mm = parseFloat($("#MinHidden").val());
    var ss = parseFloat($("#SecHidden").val());
    var dtnew = new Date();
    var diffsecorig = (dtnew - $("#TimerDiv")[0].Time_JS_dtold) / 1000;
    var difflast = (dtnew - dtLast) / 1000;
    if ((difflast >= 0) && (difflast < 60)) {
        dtLast = new Date();
        var enablerefresh = true;
        var diffsec = (ss + diffsecorig);
        var s1 = Math.floor(diffsec % 60);
        var m1 = Math.floor(mm + (diffsec / 60));
        var h1 = Math.floor(hh + (m1 / 60));
        h1 = Math.floor(h1) % 24;
        m1 = Math.floor(m1) % 60;
        if ((h1 >= 23)) {
            if ((m1 >= 59)) {
                if (s1 >= 58) {
                    setTimeout("clockReload()", 1500);
                    enablerefresh = false;
                }
            }
        }
        if ((h1 < 1) || (h1 >= 24)) {
            if ((m1 <= 0)) {
                if (s1 <= 2) {
                    if (enablerefresh) setTimeout("clockReload()", 1500);
                    enablerefresh = false;
                }
            }
        }
        if ((h1 >= 24) || (m1 >= 60) || (s1 >= 60)) {
            $("#TimerDiv").html("ReLoading...");
            clockReload();
            return;
        }
        if (h1 < 10) h1 = "0" + h1;
        if (m1 < 10) m1 = "0" + m1;
        if (s1 < 10) s1 = "0" + s1;
        $("#TimerDiv").html(h1.toString() + "<span style='color:#999; margin:0 2px'>:</span>" + m1 + "<span style='color:#999; margin:0 2px'>:" + s1.toString() + "</span>");
        if (enablerefresh)
            setTimeout("clockTick()", 1000);
        else
            $("#TimerDiv").html("ReLoading...");
    }
    else
        clockReload();
}
function clockReload() {
    //$("#TimerDiv").html("ReLoading...");
    /* todo: get new time from server and set dtLast and call clockTick()
    alert("Error");
    dtLast = new Date();
    clockTick(); */
}