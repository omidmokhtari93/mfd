$(document).ready(function () {
    $("form").submit(function () {
        return false;
    });
    shortcut.add("Ctrl+S", function () {
        $('#drpExchangeList').focus();
    });
    $('#addStock').click(function () {
        var symbol = $('#drpExchangeList').val().split(',');
        var temp = WatchListManger.GetActive().value;
        if (temp) {
            temp.AddNew(symbol[3], symbol[0]);
        }
    });
});
function GoToOrder() {
    $('#drpExchangeList').focus();
}
function closetable() {
    $('#tblNoFlash').hide();
}
$(document).ready(function () {
    $('#orderConfirm').jqm({ overlay: 88, modal: true, trigger: false });
    changeOrderType();
    changeOrderValidity();
    $("#ToggleActionButton").click(function () {
        var button = $(this);
        if (button.attr("class") == "ToggleActionButtonClose") {
            $("#IncWatchListHeight").css("opacity", '0.3');
            $("#DecWatchListHeight").css("opacity", '0.3');
            $(".watchListTabPanel").css("min-height", 0);
            $(".watchListScrollPanel").css("min-height", 0);
            button.removeClass("ToggleActionButtonClose");
            button.addClass("ToggleActionButtonOpen");
        }
        else {
            button.removeClass("ToggleActionButtonOpen");
            button.addClass("ToggleActionButtonClose");
            $("#IncWatchListHeight").css("opacity", '1');
            $("#DecWatchListHeight").css("opacity", '1');
            $(".watchListTabPanel").css("min-height", 60);
            $(".watchListScrollPanel").css("min-height", 60);
        };
        $("#" + $(".watchListTab div.selected").attr("key")).slideToggle('slow');
        //$("#portfolioDiv").slideToggle('slow');
        //$("#watchListDiv").slideToggle('slow');
    });
    $("#IncWatchListHeight").click(function () {
        if ($("#ToggleActionButton").attr("class") == "ToggleActionButtonClose") {
            $(".watchListTabPanel").animate({ height: '+=40' }, 180);
            $(".watchListScrollPanel").animate({ height: '+=40' }, 180);
        }
    });
    $("#DecWatchListHeight").click(function () {
        if ($("#ToggleActionButton").attr("class") == "ToggleActionButtonClose" && $("#watchListDiv").height() > 62) {
            $(".watchListScrollPanel").animate({ height: '-=40' }, 180);
            $(".watchListTabPanel").animate({ height: '-=40' }, 180);
        }
    });
    $("#ToggleActionButton2").click(function () {
        var button = $(this);
        if (button.attr("class") == "ToggleActionButtonClose") {
            button.removeClass("ToggleActionButtonClose");
            button.addClass("ToggleActionButtonOpen");
            $("#chartcontainer1").children().remove();
        }
        else {
            button.removeClass("ToggleActionButtonOpen");
            button.addClass("ToggleActionButtonClose");

        };
        $("#DivLastStockPrice").slideToggle('slow', function () {

            if ($(this).css("display") == "block") {
                var m4 = App.GetModul(GetIntraDayModuleName());
                var modu = App.GetModul('10_sq');
                if (modu != null && modu.MetaData.length > 1) {
                    var isinFromModule = App.GetModul('10_sq').MetaData[1];
                    if (m4 != null && isinFromModule != null) {
                        m4.MetaData[1] = isinFromModule;
                        m4.MetaData[2] = "chartcontainer1";
                        m4.MetaData[3] = "true";
                        m4.Init();
                    }
                }
            }

        });
    });
    $("#categories li").click(function () {
        var li = $(this);
        $(".mainTabContainer").hide();
        $(".current").removeClass("current");
        $(".contentfirst").removeClass("contentfirst");
        li.addClass("current");
        li.children('a').addClass("current");
        var content_show = li.attr("key");
        $("#" + content_show).addClass("contentfirst");
        $(".mainTabContainer").show();
        var fn = li.attr('fn');
        if (fn) {
            var customerid = $('#customerid').val();
            fn += "(customerid)";
            eval(fn);
        };
    });
});
function SwitchOrderSide(val) {
    var val = val;
    var drp = $('#drpAccountingProvider');
    if (val == "86") {
        $("#AddOrder_Account").hide();
        drp.val('TBRFinancialDataProvider');
    }
    else {
        $("#AddOrder_Account").show();
    }
}
function SwitchOrderSide(val) {
    var val = val;
    var drp = $('#drpAccountingProvider');
    if (val == "86") {
        drp.val('TBRFinancialDataProvider');
    }
}
function GetPageMode()
{ }
function SetDetail(v) {
    var drp = $('input[value=' + v + ']').prop('checked', true);
}
function WatchListSelect(v) {
    if ($("#JqmOrderPanel").css("display") == "block" && $("#JqmOrderPanel .jqmOrderPanelTitle h1").text() == 'ویرایش سفارش') {
        ShowModal('BuySell');
    }
    var obj = new Object();
    var chk = v.InstrumentID.indexOf("IRR");
    var isright = 0;
    if (chk == 0) { isright == 1; }
    obj.innervalue = "{0},{1},{2},{3},{4},{5},{6},{7}".format(v.InsCode, v.SymbolId, v.InsCode, v.InstrumentID, 1, v.HighPrice, v.LowPrice, isright);
    $('#hiddrpExchangeList').val(obj.innervalue);
    $('#drpExchangeList').val(v.InsCode);
    callbackF(obj);
    return;
}
//function calculateTotalCount(totalBudget, TotalBrokerKarmozd, TotalBourseKarmozd, price, side) {
//    var totalCount = 0;

//    totalCount = (totalBudget + ((TotalBrokerKarmozd + TotalBourseKarmozd) * (side == 65 ? -1 : 1))) / price;

//    if (totalCount < 0) totalCount = 0;
//    if (side == 65)//buy
//        return Math.floor(totalCount);
//    else
//        return Math.ceil(totalCount);
//};
//function CalcCountAndCommision(orderSide, CalcBrokerKarmozd, CalcBourseKarmozd, minKargozarKarmozd, totalBudget, orderPrice, ForcedCount) {
//    var result = { TotalBrokerKarmozd: 0, TotalBourseKarmozd: 0, Count: 0 };
//    if (orderPrice && orderPrice != 0 && totalBudget && totalBudget != 0) {

//        result.TotalBrokerKarmozd = Math.round(CalcBrokerKarmozd * totalBudget);

//        if (minKargozarKarmozd && result.TotalBrokerKarmozd < minKargozarKarmozd)
//            result.TotalBrokerKarmozd = minKargozarKarmozd;

//        result.TotalBourseKarmozd = Math.round(CalcBourseKarmozd * totalBudget);

//        if (ForcedCount && ForcedCount > 0) {
//            result.Count = ForcedCount;
//        } else if (orderPrice != 0 && totalBudget != 0) {
//            result.Count = calculateTotalCount(totalBudget, result.TotalBrokerKarmozd, result.TotalBourseKarmozd, orderPrice, orderSide);

//            result.TotalBrokerKarmozd = Math.round(CalcBrokerKarmozd * (result.Count * orderPrice));
//            if (minKargozarKarmozd && result.TotalBrokerKarmozd < minKargozarKarmozd)
//                result.TotalBrokerKarmozd = minKargozarKarmozd;

//            result.TotalBourseKarmozd = Math.round(CalcBourseKarmozd * (result.Count * orderPrice));

//            result.Count = calculateTotalCount(totalBudget, result.TotalBrokerKarmozd, result.TotalBourseKarmozd, orderPrice, orderSide);

//            result.TotalBrokerKarmozd = Math.round(CalcBrokerKarmozd * (result.Count * orderPrice));
//            if (minKargozarKarmozd && result.TotalBrokerKarmozd < minKargozarKarmozd)
//                result.TotalBrokerKarmozd = minKargozarKarmozd;

//            result.TotalBourseKarmozd = Math.round(CalcBourseKarmozd * (result.Count * orderPrice));


//            if (result.TotalBourseKarmozd < 0) result.TotalBourseKarmozd = 0;
//            if (result.TotalBrokerKarmozd < 0) result.TotalBrokerKarmozd = 0;
//        }
//    }
//    return result;
//}
function CalcCountAndNewCommission(isin, orderSide, totalBudget, orderPrice, ForcedCount) {
    //debugger;
    var result = { TotalBrokerKarmozd: 0, TotalBourseKarmozd: 0, Count: 0 };
    if (orderPrice && orderPrice != 0 && totalBudget && totalBudget != 0) {
        if (ForcedCount && ForcedCount > 0) {
            result.Count = ForcedCount;
        }
        else {
            result.Count = commissionCalculator.getCountByBudget(isin, orderSide == 65, totalBudget, orderPrice);
        }
        var totalPrice = (result.Count * orderPrice);
        result.TotalBrokerKarmozd = commissionCalculator.getBrokerCommissionsTotalByISIN(isin, totalPrice, orderSide == 65, false, true);
        result.TotalBourseKarmozd = commissionCalculator.getBrokerCommissionsTotalByISIN(isin, totalPrice, orderSide == 65, true, true);
    }
    return result;
}
function reCalc(t, side) {
    var isin = calcIsin = $("#calcIsin").val();
    if (!isin || isin == "") return;
    side = side ? side : $("input[name=calcOrderSide]:checked").val();
    var price = parseInt($('#calcPrice').val().toString().ToDigit());
    var TotalBudget = parseInt($('#calcKol').val().toString().ToDigit());

    var karmozd = { TotalBrokerKarmozd: 0, TotalBourseKarmozd: 0, Count: 0 };
    if (!isNaN(price)) {
        if (price && price != 0 && price != '') {
            karmozd = CalcCountAndNewCommission(isin, parseInt(side), parseInt(TotalBudget), price);/*CalcCountAndCommision(parseInt(side), calcBrokerKarmozd, calcBourseKarmozd, mk, parseInt(TotalBudget), price);*/
            $('.calcTable #CalcResult').html(Math.floor(karmozd.Count).toString().SeparateNumber());
            $('.calcTable #CalcBrokerKarmozd').html(karmozd.TotalBrokerKarmozd.toString().SeparateNumber());
            $('.calcTable #CalcBourseKarmozd').html(karmozd.TotalBourseKarmozd.toString().SeparateNumber());
        }
    }
}
function calcSet() {
    ShowModal("BuySell");
    $('#txtPrice').val($('#calcPrice').val().toString().SeparateNumber());
    $('#txtCount').val($('.calcTable #CalcResult').html().toString().SeparateNumber());
    ShowHide($('#calcPanel').children('div.subpanel').prev(), 1);
}
function prepareCalc(data) {
    var stockObject = data;
    if (stockObject.LastTradedPrice != null && typeof (stockObject.LastTradedPrice) != undefined) {
        $('#calcPrice').val(stockObject.LastTradedPrice.toString().SeparateNumber());
    }
    reCalc(null);
}
function buyQueue(obj, col) {
    if ($(obj).html() != "0") {
        var row = $(obj).parent().get(0).rowIndex - 2;
        if (col == 3) {
            //            if (document.URL.indexOf("ImeFutAddOrder") > 0)
            //            //                $('#txtPrice').val($(obj).html().split(",").join("") / 1000);
            //                $('#txtPrice').val($(obj).html().substr(0, $(obj).html().length - 4));
            //            else
            //                $('#txtPrice').val($(obj).html());
            Price($(obj).html());
            $('#txtCount').focus();
            $('#txtCount').val("1");
        }
        var sum = 0;
        var break_now = 0;
        if (col == 2) {
            var check_price = $(obj).next().html();
            $(obj).parent().parent().find('tr').each(function (i) {
                $(this).find('td').each(function (i2) {
                    if ($(this).attr('order_side') == "buy") {
                        if ($(this).attr('stock_price')) {
                            if (check_price == $(this).html()) {
                                break_now = 1;
                                return false;
                            }
                        }
                        if ($(this).attr('stock_valu')) {
                            sum += (parseInt($(this).html().toString().ToDigit()));
                        }
                    }
                });
                if (break_now == 1) {
                    return false;
                }
            });
            $('#txtCount').val(sum.toString().SeparateNumber());
            //            $('#txtPrice').val($(obj).next().html());
            Price($(obj).next().html());
        }
        if (col == 1) {
            //            $('#txtPrice').val($(obj).next().next().html().substr(0, $(obj).html().length - 4));
            Price($(obj).prev().prev().html());
            $('#txtCount').focus();
            $('#txtCount').val("1");
        }
    }
}
function sellQueue(obj, col) {
    if ($(obj).html() != "0") {
        var row = $(obj).parent().get(0).rowIndex - 2;
        if (col == 1) {
            Price($(obj).html());
            $('#txtCount').focus();
            $('#txtCount').val("1");
            SwitchOrderSide("65");
        }
        var sum = 0;
        var break_now_sell = 0;
        if (col == 2) {
            var check_price_sell = $(obj).prev().html();
            $(obj).parent().parent().find('tr').each(function (i) {
                $(this).find('td').each(function (i2) {
                    if ($(this).attr('order_side') == "sell") {
                        if ($(this).attr('stock_valu')) {
                            sum += (parseInt($(this).html().toString().ToDigit()));
                        }
                        if (break_now_sell == 1) {
                            return false;
                        }
                        if ($(this).attr('stock_price')) {
                            if (check_price_sell == $(this).html()) {
                                break_now_sell = 1;
                            }
                        }
                    }
                });
                if (break_now_sell == 1) {
                    return false;
                }
            });
            $('#txtCount').val(sum.toString().SeparateNumber());
            Price($(obj).prev().html());
            //            $('#txtPrice').val($(obj).prev().html());
            SwitchOrderSide("65");
        }
        if (col == 3) {
            Price($(obj).prev().prev().html());
            //            $('#txtPrice').val($(obj).prev().prev().html().substr(0, $(obj).html().length - 4));
            $('#txtCount').focus();
            $('#txtCount').val("1");
            SwitchOrderSide("86");
        }
    }
}

function Price(obj) {
    if (document.URL.indexOf("ImeFutAddOrder") > 0)
        $('#txtPrice').val(obj.substr(0, obj.length - 4));
    else
        $('#txtPrice').val(obj);
}

function changeOrderValidity() {
    $('#calendarMask').show();
    $('#txtOrderValidityDate').val('');
    var drp = $('#drpOrderValidity' + " option:selected");
    var drp2 = $('#drpOrderType' + " option:selected");
    var index = drp.val();
    var index2 = drp2.val();
    if (index == "68") {
        $('#calendarMask').hide();
    }
    $('#trMaxShown').show();
    if (index2 == "76") {
        if (index == "69") {
            $('#trMinQty').show();
            $('#trMaxShown').hide();
            $('#trMaxShown input').val('');
        }
        else {
            $('#trMinQty').show();
            $('#trMaxShown').show();
        }
    }
    if (index == "69") {
        $('#trMaxShown').hide();
        $('#trMaxShown input').val('');
    }
}
function changeOrderType() {
    $('#trPrice').show();
    $('#triggerPrice').hide();
    $('#trMinQty').hide();
    $('#trMaxShown').hide();
    $('#txtTrigerPrice').val('');
    $('#txtminqty').val('');
    var drp = $('#drpOrderType' + " option:selected");
    var drp2 = $('#drpOrderValidity' + " option:selected");
    var index = drp.val();
    var index2 = drp2.val();
    if (index == "76") {
        if (index2 == "69") {
            $('#trMinQty').show();
            $('#trMaxShown').hide();
            $('#trMaxShown input').val('');
        }
        else {
            $('#trMinQty').show();
            $('#trMaxShown').show();
        }
    }
    if (index == "75") {
        $('#txtPrice').val('');
        $('#trPrice').hide();
        $('#trMaxShown').hide();
        $('#trPrice  input').val('');
        $('#trMaxShown input').val('');
        return;
    }
    if (index == "83") {
        $('#triggerPrice').show();
        $('#trMinQty').hide();
        $('#trMaxShown').hide();
        $('#trMaxShown input').val('');
        if (index == "77") {
            $('#trMinQty').show();
        }
        else
        { $('#trMinQty input').val(''); }
        return;
    }
    if (index == "77") {
        $('#trMinQty').hide();
        $('#trMaxShown').hide();
        $('#trPrice').hide();
        $('#trMinQty input').val('');
        $('#trMaxShown input').val('');
        $('#trPrice input').val('');
    }
}
function GetOrder() {
    var order = new Object();
    var symbol = $('#hiddrpExchangeList').val().split(',');
    if (symbol.length != 8) {
        return null;
    }
    order.SymbolId = symbol[1];
    order.SymbolName = symbol[0];
    order.IsRight = symbol[7];
    order.SymbolNsc = symbol[3];
    order.SendSMS = $("#chkSendOrderSMS").prop("checked");
    order.OrderSide = $("#hiddenOrderSide").val();
    order.OrderPrice = $('#txtPrice').val().toString().ToDigit();
    order.OrderType = $('#drpOrderType').val().toString().ToDigit();
    order.OrderValidity = $('#drpOrderValidity').val().toString().ToDigit();
    order.OrderValiditydate = $('#txtOrderValidityDate').val().toString().ToDigit();
    order.OrderTotalQuantity = $('#txtCount').val().toString().ToDigit();
    order.TriggerPrice = $('#txtTrigerPrice').val().toString().ToDigit();
    order.MinimumQuantity = $('#txtminqty').val().toString().ToDigit();
    order.MaxShown = $('#txtMaxShown').val().toString().ToDigit();
    order.BourseCode = $('#boursecodeid').val().toString().ToDigit();
    order.CustomerId = $('#customerid').val().toString().ToDigit();
    order.ISIN = $('#isin').val().toString().ToDigit();
    order.pk = $('#drpAccountingProvider').val();
    order.OrderMode = $('#ordermode').val();
    order.orderid = $('#orderid').val();
    order.OrderExpectedQuantity = $('#OrderExpectedQuantity').val();
    order.browserTime = $("#TimerDiv").text();
    order.IsSymbolInAgreement = $('#hdnIsSymbolInAgreement').val();
    order.AcceptedAgreement = $('#chbxAcceptAgreement:checkbox:checked').length > 0;

    return order;
}
function SetOrder(obj) {
    var order = obj.MetaData[1];
    var symbol = obj.MetaData[0];
    $("#hiddenOrderSide").val(order.os);
    $('#drpExchangeList').val(symbol.td);
    try {
        $("#drpAccountingProvider").val(order.prvd);
    } catch (e) {

    }
    $("#drpAccountingProvider").val(order.prvd);
    var symbols = symbol.td.split(',');
    $('#drpExchangeList').val(symbols[0]);
    if (document.URL.indexOf("ImeFutAddOrder") > 0) {
        var z = order.op.toString().SeparateNumber();
        $('#txtPrice').val(z.substr(0, z.length - 4)); // = .toString().SeparateNumber();
    }
    else {
        $('#txtPrice').val(order.op.toString().SeparateNumber()); // = .toString().SeparateNumber();

    }
    $('#drpOrderType').val(order.ot);
    $('#drpOrderValidity').val(order.ovv);
    changeOrderValidity();
    if (order.ovt && order.ovt.length > 0) {
        $('#txtOrderValidityDate').val(order.ovt);
    }
    $('#txtCount').val((order.otq - order.ea).toString().SeparateNumber());
    if (order.tpv && order.tpv > 0) {
        $('#txtTrigerPrice').val(order.tpv);
    }
    if (order.mqv && order.mqv > 0) {
        $('#txtminqty').val(order.mqv);
    }
    if (order.ms && order.ms > 0) {
        $('#txtMaxShown').val(order.ms);
    }
    $('#OrderExpectedQuantity').val(order.oeq);
    $('#orderid').val(order.Id);
    $('#btnEdit').show();
    $('#editTitle').show();
    return order;
}
function ResetOrder() {
    $('#orderid').val(0);
    $('#OrderExpectedQuantity').val(0);

    $('#txtPrice').val('');
    $('#drpOrderType').val('');
    $("#drpOrderType").attr('selectedIndex', 0);
    $('#drpOrderValidity').val('');
    $("#drpOrderValidity").attr('selectedIndex', 0);
    $('#txtOrderValidityDate').val('');
    $('#txtCount').val('');
    $('#txtTrigerPrice').val('');
    $('#txtminqty').val('');
    $('#txtMaxShown').val('');
    $('#txtLot').val('');
    $('#HighAllowedPrice').text('');
    $('#LowAllowedPrice').text('');
    changeOrderValidity();
    changeOrderType();
    $('#drpExchangeList').attr('disabled', false);
    $('#drpAccountingProvider').attr('disabled', false);
    $('#drpAccountingProvider').attr('selectedIndex', 0);
    $('#ordermode').val('add');
    $('input[type="button"]#btnEdit').hide();
    $('#editTitle').hide();
    $("#drpOrderType").val($("#drpOrderType option:first").val());
    $("#drpOrderValidity").val($("#drpOrderValidity option:first").val());

    setTimeout(function () {
        if ($("#JqmOrderPanel").css("display") == "none") $('#drpExchangeList').val('');
    }, 5);

}
function RunEngine(orderid) {
    var customerid = $('#customerid').val();
    GetOrderStatus(orderid, customerid);
}
var GetOrderStatusLock = 0;
var settimoutsecond = 5 * 1000;

function CloseOrderpanelAlert() {

    $('#OrderpanelAlert').hide();
    $('#btnBuyMask').hide();
    $('#btnSellMask').hide();
    $('#btnDeleteOrderMask').hide();
    $('#btnEditOrderMask').hide();
}
function CloseAlert() {
    $('#Alert').hide();
}
function ShowOrderMessage(msg, color, isError) {

    var r2 = $('<li>' + msg + '</li>');
    if (color) {
        r2.css('background-color', color);
    }

    $('#lastMessage2 span').css("color", "Black");
    if (isError) {
        $('#lastMessage2 span').css("color", "Red");
    }

    if (msg != null && msg != '') {
        $('#OrderpanelAlert').show();
    }

    var btnClose = $('#Alert').find(".jqmClose");
    var btnOrderpanelAlertOk = $('#OrderpanelAlert').find("#btnOrderpanelAlertOk").focus();
    btnOrderpanelAlertOk.attr("disabled", false);
    btnClose.click(function () { CloseAlert(); });
    $('#alertpanel ul').prepend(r2);
    var renderedMsg = $('<div>' + msg + '</div>').css({ 'position': 'absolute', 'float': 'left', 'visibility': 'hidden' }).appendTo($('body'));
    if (footPanelWidth == undefined || footPanelWidth == null) {
        var footPanelWidth = $("#footpanel").width();
    }
    var realMsgWidth = renderedMsg.width();
    renderedMsg.remove();
    var footerMsg = msg;
    if ((footPanelWidth / 2) <= realMsgWidth) {
        footerMsg = footerMsg.substring(0, 70) + " ...";
    }
    $('#lastMessage span').html(footerMsg);
    $('#lastMessage2 span').html(msg);

}

function addNewConditionalAlert(textMessage) {

    var r2 = $('<li>' + textMessage + '</li>');
    r2.css("border-bottom", "1px solid #CCCCCC").css("padding", "6px 4px");
    $('#conditionalalertpanel ul').prepend(r2);
    var counter = $('#conditionalalertpanel .countNewMessage');
    var currentCount = parseInt(counter.text());
    if ($('#conditionalalertpanel .subpanel').css("display") == "none") {
        if (counter.css("display") == "none") {
            counter.text("1");
            counter.show(500);
        } else {
            var newCounter = currentCount + 1;
            counter.text(newCounter);
        }
    }

}
function addNewTextMessage(textMessage) {

    var r2 = $('<li>' + textMessage + '</li>');
    r2.css("border-bottom", "1px solid #CCCCCC").css("padding", "6px 4px");
    $('#textmessagepanel ul').prepend(r2);
    var counter = $('#textmessagepanel .countNewMessage');
    var currentCount = parseInt(counter.text());
    if ($('#textmessagepanel .subpanel').css("display") == "none") {
        if (counter.css("display") == "none") {
            counter.text("1");
            counter.show(500);
        } else {
            var newCounter = currentCount + 1;
            counter.text(newCounter);
        }
    }

}


function ShowHTMLMessage(msg, color) {
    var r2 = $('<li>' + msg + '</li>');
    if (color) {
        r2.css('background-color', color);
    }

    $('#Alert').show();
    var container = $('#Alert').find(".jqmConfirmMsg");
    container.html('');
    container.html(msg);
    $('#Alert').find("#btnAlert").focus();


}

function ShowConditonalAlert(msg, color, isError) {
    var r2 = $('<li>' + msg + '</li>');
    if (color) {
        r2.css('background-color', color);
    }
    if (isError) {
        $('#Alert').show();
        var container = $('#Alert').find(".jqmConfirmMsg");
        container.html('');
        container.html(msg);
        $('#Alert').find("#btnAlert").focus();
    }
    $('#conditionalalertpanel ul').prepend(r2);
    var renderedMsg = $('<div>' + msg + '</div>').css({ 'position': 'absolute', 'float': 'left', 'visibility': 'hidden' }).appendTo($('body'));
    if (footPanelWidth == undefined || footPanelWidth == null) {
        var footPanelWidth = $("#footpanel").width();
    }
    var realMsgWidth = renderedMsg.width();
    renderedMsg.remove();
    $('#lastMessage2 span').html(msg);
    if ((footPanelWidth / 2) <= realMsgWidth) {
        msg = msg.substring(0, 70) + " ...";
    }
    $('#lastMessage span').html(msg);
}
function ShowMessage(msg, color, isError) {
    var r2 = $('<li>' + msg + '</li>');
    if (color) {
        r2.css('background-color', color);
    }
    if (isError) {
        $('#Alert').show();
        var container = $('#Alert').find(".jqmConfirmMsg");
        container.html('');
        container.html(msg);
        $('#Alert').find("#btnAlert").focus();
    }
    $('#alertpanel ul').prepend(r2);
    var renderedMsg = $('<div>' + msg + '</div>').css({ 'position': 'absolute', 'float': 'left', 'visibility': 'hidden' }).appendTo($('body'));
    if (footPanelWidth == undefined || footPanelWidth == null) {
        var footPanelWidth = $("#footpanel").width();
    }
    var realMsgWidth = renderedMsg.width();
    renderedMsg.remove();
    $('#lastMessage2 span').html(msg);
    if ((footPanelWidth / 2) <= realMsgWidth) {
        msg = msg.substring(0, 70) + " ...";
    }
    $('#lastMessage span').html(msg);
}



function toggleAdv() {
    $('#tblAdv').toggleClass("hide");
}

function resetAdvQueueSelects() {
    $("#tblqStockNew tbody tr td").removeClass("currentAdvQueue");
}

function showOrders(obj) {
    $("#tab1").empty();
    column = new Array("symbol",     "dtime",    "time",     "qunatity",   "orderprice", "excuted"    , "orderFrom", "orderside"  , "ProviderName", "status"    , "action");
    header = new Array(symbolString, dateString, timeString, volumeString, priceString , excutedString, ""         , buySellString, providerString, statusString, actionString);
    var tbl = CreateTable(obj.Value, column, header);
    $("#tab1").html(tbl);
    var tblq = $('#tblTodayOrders.tblq');
    if (tblq.length > 0) {
        $('#tblTodayOrders.tblq').colorize();
        $("#tblTodayOrders.tblq").tablesorter();
    }
    var Header = $("#tab1 #tblTodayOrders thead");
    Header.detach();
    $("#tab1 #tblTodayOrdersHeader").append(Header);
    $('#tblTodayOrders.tblq tr td:first').click(function () {
        var stock = '';
        callbackF(stock);


    });
    
}

function updateOrderState(selector,orderId,stateType) {
    var element = $("#" + selector + " tr[orderid='" + orderId + "']").find("td")[9];
    element.innerHTML = stateDescription;
}

function updateOrderRow(selector,orderId,value) {
    removeRowFromTable(selector, orderId);
    insertRowIntoTable(selector, value);
}
function removeRowFromTable(selector,orderId) {
    //$("#tab1 tr[orderid='2018112140101895']")
    var element=$("#"+selector+" tr[orderid='"+orderId+"']");
    element.remove();
}

function insertRowIntoTable(selector,value) {
    var column = new Array("symbol","dtime","time","qunatity","orderprice","excuted","orderFrom","orderside","ProviderName","status","action");
    var row = CreateRowTable(column, value);
    var element=$("#"+selector+" tr");
    element.append(row);
    $('#tblTodayOrders.tblq').colorize();
    $("#tblTodayOrders.tblq").tablesorter();

}


function showTrades(obj)
{
    $("#tab8").empty();
    column = new Array("symbol", "dtime", "time", "excuted", "orderprice", "orderside", "orderFrom","ProviderName","action");
    header = new Array(symbolString, dateString, timeString, excutedString, priceString, buySellString, "", providerString, actionString);
    var tbl = CreateTable(obj.Value, column, header);
    $("#tab8").html(tbl);
    var tblq = $('#tblTodayOrders.tblq');
    if (tblq.length > 0)
    {
        $('#tblTodayOrders.tblq').colorize();
        $("#tblTodayOrders.tblq").tablesorter();
    }
    var Header = $("#tab8 #tblTodayOrders thead");
    Header.detach();
    $("#tab8 #tblTodayOrdersHeader").append(Header);
    $('#tblTodayOrders.tblq tr td:first').click(function()
        {
            var stock = '';
            callbackF(stock);
        });
}

function showSymbolOrders(obj) {
    $("#tab6").empty();
    column = new Array("symbol", "dtime", "time", "qunatity", "orderprice", "excuted", "orderFrom", "orderside", "ProviderName", "status", "action");
    header = new Array(symbolString, dateString, timeString, volumeString, priceString, excutedString, "", buySellString, providerString, statusString, actionString);
    var tbl = CreateTable(obj.Value, column, header);
    $("#tab6").html(tbl);
    $('#tblTodayOrders.tblq').colorize();
    $("#tblTodayOrders.tblq").tablesorter();
    var Header = $("#tab6 #tblTodayOrders thead");
    Header.detach();
    $("#tab6 #tblTodayOrdersHeader").append(Header);
    $('#tblTodayOrders.tblq tr td:first').click(function () {
        var stock = '';
        callbackF(stock);
    });
}

function showTodayOrders(obj) {
    $("#tab2").empty();
    column = new Array("symbol", "time", "qunatity", "orderprice", "excuted", "orderFrom", "orderside", "ProviderName", "status", "action");
    header = new Array(symbolString, timeString, volumeString, priceString, excutedString, "", buySellString, providerString, statusString, actionString);
    var tbl = CreateTable(obj.Value, column, header);
    $("#tab2").html(tbl);
    $('#tblTodayOrders.tblq').colorize();
    $("#tblTodayOrders.tblq").tablesorter();
    var Header = $("#tab2 #tblTodayOrders thead");
    Header.detach();
    $("#tab2 #tblTodayOrdersHeader").append(Header);


}

function ConfirmDeleteOrder(obj) {
    var par = $(obj);
    var orderid = par.attr("orderid");
    var customerid = par.attr("customerid");
    confirm(par, orderid, customerid);

    return false;
}
function confirm(row, orderid, customerid) {
    $('#confirm').jqmShow();
    $('#confirm').find(':submit:visible').click(function () {
        $('#confirm').find(':submit:visible').unbind("click");
        $('#confirm').jqmHide();
        if (this.id == "btnyes") {
            ShowOrderMessage(sendtonetwork);
            $('#OrderpanelAlert').find("#btnOrderpanelAlertOk").attr("disabled", true);
            DeleteOrder(row, orderid, customerid);
            var td = row.find("td");
            $(td[9]).css('color', 'blue');
            $(td[9]).html('&nbsp;');


            return false;
        }
        else {

            $('#btnEditOrderMask').hide();
            $('#btnDeleteOrderMask').hide();
            return false;
        }
    });
}
function EditOrder(obj) {
    var par = $(obj);
    par.attr("id", par.attr("orderid"));
    $("#hiddenOrderTRID").val(par.attr("id"));
    ShowModal('EditOrder');
    var order = GetOrderFromServer(par, false);
    $('#ordermode').val('edit');
    return false;
}
function CopyOrder(obj) {
    var par = $(obj);
    par.attr("id", par.attr("orderid"));
    $("#hiddenOrderTRID").val(par.attr("id"));
    ShowModal('CopyOrder');
    var order = GetOrderFromServer(par, true);
    $("#orderid").val("0");
    $('#ordermode').val("add");

    return false;
}
function showAccounts(obj) {
    column = new Array("Date", "Description", "Debitor", "Creditor", "RealBalance");
    header = new Array(dateString, descriptionString, debitorString, creditorString, realBalanceString);
    var tbl = CreateTable(obj, column, header, UcNewAccountTodayEmpty);
    $("#tab3").html(tbl);
    $('#tblTodayOrders.tblq').colorize();
    var Header = $("#tab3 #tblTodayOrders thead");
    Header.detach();
    $("#tab3 #tblTodayOrdersHeader").append(Header);
}
function showPositions(obj) {
    $("#tab4").empty();
    column = new Array("symbol", "volume", "pside", "AvgPrice");
    header = new Array(symbolString, volumeString, buySellString, priceString);
    var tbl = $(CreateTable(obj.Value, column, header));
    tbl.find("th,td").removeAttr("width").css("width", "25%");
    $("#tab4").html(tbl);
    tbl.colorize();
    tbl.tablesorter();
    var Header = tbl.find("thead");
    Header.detach();
    $("#tab4 #tblTodayOrdersHeader").append(Header);
}
function showIFBPositions(obj) {
    
    imgcopy = imgIFBcopy;
    imgdelete = imgIFBdelete;
    $("#tab7").empty();
    column = new Array("symbol", "positionCount", "positionSide", "donePrice", "eventDate" );
    header = new Array(symbolString, volumeString, positionSide, donePrice, eventDate);
    var tbl = $(CreateTable(obj.Value, column, header));
    tbl.find("th,td").removeAttr("width").css("width", "20%");
    $("#tab7").html(tbl);
    tbl.colorize();
    tbl.tablesorter();
    var Header = tbl.find("thead");
    Header.detach();
    $("#tab7 #tblTodayOrdersHeader").append(Header);
}
function showStock(obj) {
    column = new Array("CurrentCount", "CurrentStockPrice", "NSCCode", "Title", "PercentStockSwingToBefore", "Price");
    header = new Array(countString, currentPriceString, codeString, companyString, percentString, priceString, '');
    var tbl = CreateTable(obj, column, header);
    $("#tab1").html(tbl);
    $('#tblTodayOrdersHeader.tblq').colorize();
}
function CancelEdit() {
    ResetOrder();
}
$(document).ready(function () {
    //    $("input[name=RadioButtonOrderSide]").change(function () { OrderManager.SetOrderRuleTo('#orderManagerRule', this.value, $("#txtCount").val()); });
    //    $("#txtCount").keyup(function () { OrderManager.SetOrderRuleTo('#orderManagerRule', $('input[name=RadioButtonOrderSide]:checked').val(), this.value); });
    $.fn.adjustPanel = function () {
        var windowHeight = $(window).height();
        var panelsub = $(this).find(".subpanel").height();
        var panelAdjust = windowHeight - 100;
        var ulAdjust = panelAdjust - 25;
        if (panelsub >= panelAdjust) {
            $(this).find(".subpanel").css({ 'height': panelAdjust });
            $(this).find("ul").css({ 'height': ulAdjust });
        }
        else if (panelsub < panelAdjust) {
            $(this).find("ul").css({ 'height': 'auto' });
        }
        $('#ulalarm').css('height', '');
    };
    $('#footpanel #mainpanel .header  a.closebutton').click(function () {
        ShowHide($(this).parents('div.subpanel').prev(), 1);
    });
    $("#alertpanel").adjustPanel();
    $(window).resize(function () {
        $("#alertpanel").adjustPanel();
    });
    $("#footpanel #alertpanel a:first,#footpanel #mmPanel a:first").click(function () {
        ShowHide($(this));
    });
    $("#footpanel #conditionalalertpanel a").click(function () {
        if (!$(this).next(".subpanel").is(':visible')) {
            $("#footpanel #conditionalalertpanel .countNewMessage").hide(500);
        }
        ShowHide($(this));
    });
    $("#footpanel #textmessagepanel a").click(function () {
        if (!$(this).next(".subpanel").is(':visible')) {
            $("#footpanel #textmessagepanel .countNewMessage").hide(500);
        }
        ShowHide($(this));
    });
    $("#footpanel #calcPanel a:first").click(function (e) {
        ShowHide($(this));
        $('.calcTable').find('input[type=text]').val('');
        $('#calcKol')[0].focus();
        $('.calcTable').find('span#CalcBourseKarmozd').html('');
        $('.calcTable').find('span#CalcBrokerKarmozd').html('');
        $('.calcTable').find('span#CalcResult').html('');
        RefreshNeededStockPriceFunction();
        $('#calcKol').keyup(function () {
            var t = parseInt($(this).val().toString().ToDigit());
            if (!isNaN(t)) {
                reCalc(t);
            }
        });
        $('#calcPrice').keyup(function () {
            reCalc(null);
            return false;
        });
        $('.calcTable').find('input').keypress(function (e) {
            var unicode = e.charCode ? e.charCode : e.keyCode;
            if (unicode != 13 && unicode != 8 && unicode != 27 && unicode != 9) {
                var actualkey = String.fromCharCode(unicode);
                if (isNaN(parseInt(actualkey)))
                    return false;
            }
            else {
                switch (unicode) {
                    case 13:
                        ShowHide($("#footpanel #calcPanel a:first"), 1);
                        $('#txtPrice').val($('#calcPrice').val());
                        $('#txtCount').val($($('.calcTable').find('span')[4]).html());
                        return false;
                        break;
                    case 27:
                        ShowHide($("#footpanel #calcPanel a:first"), 1);
                        break;
                    case 9:
                        break;
                }
            }
        });
    });
    $('.subpanel ul').click(function (e) {
        e.stopPropagation();
    });

    $('#btnCalcMM').click(function (e) {
        var fromDate = null;
        var toDate = null;
        if (fromDate == "")
            alert(selectFromDateString);

        if (toDate == "")
            alert(selectToDateString);

        $.ajax({
            type: "Get",
            url: "0/BranchHandler.ashx" + "?lan=" + currentLan,
            data: Object.toJSON({
                "Mode": "calcmm",
                "fromDate": fromDate,
                "toDate": toDate
            }),
            success: function (msg) {
                var ajr = msg.parseJSON();

                if (ajr) {
                    $('#tdSumBuy').html(ajr.MetaData[0].toString().SeparateNumber());
                    $('#tdSumSell').html(ajr.MetaData[1].toString().SeparateNumber());
                    $('#tdKarmozd').html(ajr.Value.toString().SeparateNumber());
                }
            }
        });
    });
});


function ShowHide(obj, close) {
    if (obj.next(".subpanel").is(':visible')) {
        obj.next(".subpanel").fadeOut();
        $("#footpanel li a").removeClass('active');
    }
    else {
        if (!close) {
            $(".subpanel").hide();
            $("#footpanel li a").removeClass('active');
            obj.toggleClass('active');
            obj.next(".subpanel").fadeIn();
        }
    }
}
$('.ClosingPrice ,.HighPrice,.LowPrice,.HighAllowedPrice, .LowAllowedPrice, .LastTradedPrice').click(function () {
    $('#txtPrice').val($(this).html());
    $('#txtCount').focus();
    $('#txtCount').val('1');
});
function refresh_TextMessages(ajr) {
    try {
        var arr = eval(ajr.OperatorTags);
        var obj = eval(ajr.Value);

        $(arr).each(function () {
            if (this.Key == 'InstrumentID')
            { type = this.Value; };
        });

        addNewTextMessage(obj.Text);
    }
    catch (e) { };
};

function LightTextMessageInit(clId) {
};

function refresh_LightTextMessages(ajr) {
    try {
        var text = ajr.getValue('TextMessage');
        //var arr = eval(ajr.OperatorTags);
        //var obj = eval(ajr.Value);

        

        addNewTextMessage(text);
    }
    catch (e) { };
};
function refresh_ConditonalAlertMessage(ajr) {
    try {
        var arr = eval(ajr.OperatorTags);
        var obj = eval(ajr.Value);

        $(arr).each(function () {
            if (this.Key == 'InstrumentID')
            { type = this.Value; };
        });

        addNewConditionalAlert(obj.Text);
    }
    catch (e) { };
};
