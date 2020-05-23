$(document).ready(function() {
    if ($("#drpMarketAccount").val() != "-1") {
        visibleParams($("#drpMarketAccount").val());
        GetAccountData()
    }
    $("#drpMarketAccount").change(function(e) {
        GetAccountData()
    })
});

function GetAccountData() {
    visibleParams($("#drpMarketAccount").val());
    if ($("#drpMarketAccount").val() != "-1") {
        if ($("#drpMarketAccount").val() == "2") {
            $.ajax({
                type: "Get",
                url: "../0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
                data: Object.toJSON({
                    "Mode": "GetAtiStockAccountRemain",
                    "marketType": $("#drpMarketAccount").val()
                }),
                success: function(msg) {
                    var ajr = msg.parseJSON();
                    if (ajr) {
                        setAtiAccountDetail(ajr)
                    }
                }
            })
        } else if ($("#drpMarketAccount").val() == "5") {
            $.ajax({
                type: "Get",
                url: "../0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
                data: Object.toJSON({
                    "Mode": "getTMEAccount"
                }),
                success: function(msg) {
                    var ajr = msg.parseJSON();
                    if (ajr) {
                        setTMEAccountDetail(ajr)
                    }
                }
            })
        } else if ($("#drpMarketAccount").val() == "6") {
            $.ajax({
                type: "Get",
                url: "../0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
                data: Object.toJSON({
                    "Mode": "IFBOptionRemain"
                }),
                success: function(msg) {
                    var ajr = msg.parseJSON();
                    if (ajr) {
                        setIfbAccountDetail(ajr)
                    }
                }
            })
        } else {
            $.ajax({
                type: "Get",
                url: "../0/SiteCustomerHandler.ashx" + "?lan=" + currentLan,
                data: Object.toJSON({
                    "Mode": "GetAccountRemain",
                    "marketType": $("#drpMarketAccount").val()
                }),
                success: function(msg) {
                    var ajr = msg.parseJSON();
                    if (ajr) {
                        setAccountDetail(ajr)
                    }
                }
            })
        }
    }
}

function setAccountDetail(obj) {
    var rb, ab, bb, rbDesc;
    rbDesc = obj.RBDesc;
    if (obj.RB < 0) {
        obj.RB = -(obj.RB);
        rb = "(" + obj.RB.toString().SeparateNumber() + ")";
        $('.TopBoard #lblRealBalance').css("color", "#ff5d3b")
    } else {
        rb = obj.RB.toString().SeparateNumber();
        $('.TopBoard #lblRealBalance').css("color", "white")
    };
    if (obj.AB < 0) {
        obj.AB = -(obj.AB);
        ab = "(" + obj.AB.toString().SeparateNumber() + ")";
        $('.TopBoard #lblFullBalance').css("color", "#ff5d3b")
    } else {
        ab = obj.AB.toString().SeparateNumber();
        $('.TopBoard #lblFullBalance').css("color", "white")
    };
    if (obj.BB < 0) {
        obj.BB = -(obj.BB);
        bb = "(" + obj.BB.toString().SeparateNumber() + ")";
        $('.TopBoard #lblBlockbalance').css("color", "#ff5d3b")
    } else {
        bb = obj.BB.toString().SeparateNumber();
        $('.TopBoard #lblBlockbalance').css("color", "white")
    };
    $('.TopBoard #lblRealBalance').text(rb);
    $('.TopBoard #lblFullBalance').text(ab);
    $('.TopBoard #lblBlockbalance').text(bb);
};

function setAtiAccountDetail(obj) {
    var rb, ab, bb;
    if (obj.RB < 0) {
        obj.RB = -(obj.RB);
        rb = "(" + obj.RB.toString().SeparateNumber() + ")";
        $('.TopBoard #lblAtiRealBalance').css("color", "#ff5d3b")
    } else {
        rb = obj.RB.toString().SeparateNumber();
        $('.TopBoard #lblAtiRealBalance').css("color", "white")
    };
    if (obj.AB < 0) {
        obj.AB = -(obj.AB);
        ab = "(" + obj.AB.toString().SeparateNumber() + ")";
        $('.TopBoard #lblAtiFullBalance').css("color", "#ff5d3b")
    } else {
        ab = obj.AB.toString().SeparateNumber();
        $('.TopBoard #lblAtiFullBalance').css("color", "white")
    };
    if (obj.BB < 0) {
        obj.BB = -(obj.BB);
        bb = "(" + obj.BB.toString().SeparateNumber() + ")";
        $('.TopBoard #lblAtiBlockbalance').css("color", "#ff5d3b")
    } else {
        bb = obj.BB.toString().SeparateNumber();
        $('.TopBoard #lblAtiBlockbalance').css("color", "white")
    };
    $('.TopBoard #lblAtiRealBalance').text(rb);
    $('.TopBoard #lblAtiFullBalance').text(ab);
    $('.TopBoard #lblAtiBlockbalance').text(bb);
    $('.TopBoard .AtiStocktd').show();
    var ma;
    if (obj.MA < 0) {
        obj.MA = -(obj.MA);
        ma = "(" + obj.MA.toString().SeparateNumber() + ")";
        $('.TopBoard #lblMarginAccount').css("color", "#ff5d3b")
    } else {
        ma = obj.MA.toString().SeparateNumber();
        $('.TopBoard #lblMarginAccount').css("color", "white")
    };
    $('.TopBoard #lblMarginAccount').text(ma);
    $('.TopBoard #lblCustomerState').text(obj.CS);
    if (obj.CSE == 3) $('.TopBoard #lblCustomerState').css("color", "#ff5d3b");
    else $('.TopBoard #lblCustomerState').css("color", "white")
};

function setIfbAccountDetail(obj) {
    var rb, ab, bb;
    if (obj.RB < 0) {
        obj.RB = -(obj.RB);
        rb = "(" + obj.RB.toString().SeparateNumber() + ")";
        $('.TopBoard #lblIfbRealBalance').css("color", "#ff5d3b")
    } else {
        rb = obj.RB.toString().SeparateNumber();
        $('.TopBoard #lblIfbRealBalance').css("color", "white")
    };
    if (obj.AB < 0) {
        obj.AB = -(obj.AB);
        ab = "(" + obj.AB.toString().SeparateNumber() + ")";
        $('.TopBoard #lblIfbFullBalance').css("color", "#ff5d3b")
    } else {
        ab = obj.AB.toString().SeparateNumber();
        $('.TopBoard #lblIfbFullBalance').css("color", "white")
    };
    if (obj.BB < 0) {
        obj.BB = -(obj.BB);
        bb = "(" + obj.BB.toString().SeparateNumber() + ")";
        $('.TopBoard #lblIfbBlockbalance').css("color", "#ff5d3b")
    } else {
        bb = obj.BB.toString().SeparateNumber();
        $('.TopBoard #lblIfbBlockbalance').css("color", "white")
    };
    $('.TopBoard #lblIfbRealBalance').text(rb);
    $('.TopBoard #lblIfbFullBalance').text(ab);
    $('.TopBoard #lblIfbBlockbalance').text(bb);
    $('.TopBoard .IfbOptiontd').show();
    var ma;
    if (obj.MA < 0) {
        obj.MA = -(obj.MA);
        ma = "(" + obj.MA.toString().SeparateNumber() + ")";
        $('.TopBoard #lblIfbMarginAccount').css("color", "#ff5d3b")
    } else {
        ma = obj.MA.toString().SeparateNumber();
        $('.TopBoard #lblIfbMarginAccount').css("color", "white")
    };
    $('.TopBoard #lblIfbMarginAccount').text(ma);
    $('.TopBoard #lblIfbCustomerState').text(obj.CS);
    if (obj.CSE == 3) $('.TopBoard #lblIfbCustomerState').css("color", "#ff5d3b");
    else $('.TopBoard #lblIfbCustomerState').css("color", "white")
};

function SetInfo(customerid, customerName) {
    SetCustomer(65, customerName, "", customerid, "", "")
};

function visibleParams(drpVal) {
    if (drpVal == "5") {
        $('.TopBoard .normaltd').hide();
        $('.TopBoard .TMEtd').show();
        $('.TopBoard .AtiStocktd').hide();
        $('.TopBoard .IfbOptiontd').hide()
    } else if (drpVal == "2") {
        $('.TopBoard .normaltd').hide();
        $('.TopBoard .TMEtd').hide();
        $('.TopBoard .AtiStocktd').show();
        $('.TopBoard .IfbOptiontd').hide()
    } else if (drpVal == "6") {
        $('.TopBoard .normaltd').hide();
        $('.TopBoard .TMEtd').hide();
        $('.TopBoard .AtiStocktd').hide();
        $('.TopBoard .IfbOptiontd').show()
    } else {
        $('.TopBoard .normaltd').show();
        $('.TopBoard .TMEtd').hide();
        $('.TopBoard .AtiStocktd').hide();
        $('.TopBoard .IfbOptiontd').hide()
    }
}

function setTMEAccountDetail(obj) {
    var am, b, rp, urp, um;
    if (obj.AM < 0) {
        obj.AM = -(obj.AM);
        am = "(" + obj.AM.toString().SeparateNumber() + ")";
        $('.TopBoard #lblAvailableMargin').css("color", "#ff5d3b")
    } else {
        am = obj.AM.toString().SeparateNumber();
        $('.TopBoard #lblAvailableMargin').css("color", "white")
    };
    if (obj.Blnc < 0) {
        obj.Blnc = -(obj.Blnc);
        b = "(" + obj.Blnc.toString().SeparateNumber() + ")";
        $('.TopBoard #lblBalance').css("color", "#ff5d3b")
    } else {
        b = obj.Blnc.toString().SeparateNumber();
        $('.TopBoard #lblBalance').css("color", "white")
    };
    if (obj.RPL < 0) {
        obj.RPL = -(obj.RPL);
        rp = "(" + obj.RPL.toString().SeparateNumber() + ")";
        $('.TopBoard #lblRealizedProfitLoss').css("color", "#ff5d3b")
    } else {
        rp = obj.RPL.toString().SeparateNumber();
        $('.TopBoard #lblRealizedProfitLoss').css("color", "white")
    };
    if (obj.URPL < 0) {
        obj.URPL = -(obj.URPL);
        urp = "(" + obj.URPL.toString().SeparateNumber() + ")";
        $('.TopBoard #lblUnRealizedProfitLoss').css("color", "#ff5d3b")
    } else {
        urp = obj.URPL.toString().SeparateNumber();
        $('.TopBoard #lblUnRealizedProfitLoss').css("color", "white")
    };
    if (obj.UM < 0) {
        obj.UM = -(obj.UM);
        um = "(" + obj.UM.toString().SeparateNumber() + ")";
        $('.TopBoard #lblUsedMargin').css("color", "#ff5d3b")
    } else {
        um = obj.UM.toString().SeparateNumber();
        $('.TopBoard #lblUsedMargin').css("color", "white")
    };
    $('.TopBoard #lblAvailableMargin').text(am);
    $('.TopBoard #lblBalance').text(b);
    $('.TopBoard #lblRealizedProfitLoss').text(rp);
    $('.TopBoard #lblUnRealizedProfitLoss').text(urp);
    $('.TopBoard #lblUsedMargin').text(um)
};