function refresh_MarketData(ajr) {
    try {
        var arr = eval(ajr.OperatorTags);
        var obj = eval(ajr.Value);
        $(arr).each(function () {
            if (this.Key == 'InstrumentID') {
                type = this.Value;
            }
        });
        if (type == "IRX6XTPI0006") {
            var t = eval(ajr);
            t.TotalLastIndex = obj.TotalLastIndex;
            t.VariationDayIndex = obj.VariationDayIndex;
            t.SignofVariationDayIndex = obj.SignVariationIndex;
            t.LastUpdate = obj.LastUpdate;
            t.MaxIndex = obj.MaxIndex;
            t.MinIndex = obj.MinIndex;
            Set_info(t);
        };
        if (type == 'MarketActivity') {
            var newT = eval(ajr);
            newT.TotalNumberOfTrade = obj.TotalNumberOfTrade;
            newT.TotalNumberOfShare = obj.TotalNumberOfShare;
            newT.MarketTotalTradeValue = obj.TotalTradeValue;
            GetSet_info(newT);
        };
    }
    catch (e) { };
};
function MarketDataInitialize() {
    $.getJSON(RLCServerAddrerss + '/StockInformationHandler.ashx?' + Object.toJSON({ "Type": "lastIndex", "SyID": "IRX6XTPI0006" }) + "&jsoncallback=?",
            function (ajr) {
                if (ajr) {
                    var newob = new Object();
                    if (typeof (ajr) != "object") {
                        var t = eval(ajr);
                        newob.TotalLastIndex = t[0];
                        newob.VariationDayIndex = t[4];
                        newob.SignofVariationDayIndex = t[5];
                        newob.LastUpdate = t[9];
                        newob.MaxIndex = t[2];
                        newob.MinIndex = t[3];
                    }
                    else {
                        newob.TotalLastIndex = ajr.LIN;
                        newob.VariationDayIndex = ajr.Varid;
                        newob.SignofVariationDayIndex = 0;
                        try { newob.SignofVariationDayIndex = ajr.Svarid; }
                        catch (e) { }
                        newob.LastUpdate = ajr.LUP;
                        newob.MaxIndex = ajr.Dmxid;
                        newob.MinIndex = ajr.Dmnid;
                    };
                    Set_info(newob);
                };
            });
    $.getJSON(RLCServerAddrerss + '/StockInformationHandler.ashx?' + Object.toJSON({ "Type": "MarketActivityIndex" }) + "&jsoncallback=?",
            function (ajr) {
                if (ajr) {
                    var newT = new Object();
                    var t = eval(ajr);
                    if (typeof (ajr) != "object") {
                        newT.TotalNumberOfTrade = t[0];
                        newT.TotalNumberOfShare = t[2];
                        newT.MarketTotalTradeValue = t[1];
                    }
                    else {
                        newT.TotalNumberOfTrade = ajr.TNOT;
                        newT.TotalNumberOfShare = ajr.TNOST;
                        newT.MarketTotalTradeValue = ajr.TTV;
                    };
                    GetSet_info(newT);
                };
            });
};
function Set_info(t) {
    $('.TotalLastIndex').html(t.TotalLastIndex.toString().SeparateNumber());
    $('.TotalLastIndex').addClass('h');
    $('.VariationDayIndex').html(t.VariationDayIndex.toString() + t.SignofVariationDayIndex + "%");
    $('.VariationDayIndex').addClass('h');
    $('.MaxIndex').html(t.MaxIndex.toString().SeparateNumber());
    $('.MaxIndex').addClass('h');
    $('.MinIndex').html(t.MinIndex.toString().SeparateNumber());
    $('.MinIndex').addClass('h');
    $('.TotalLastIndex').html(t.TotalLastIndex.toString().SeparateNumber());
    if (t.VariationDayIndex == 0) {
        $('.VariationDayIndex').css("color", "black");
        $('.VariationDayIndex').html("%" + t.VariationDayIndex.toString());
    }
    else {
        if (t.SignofVariationDayIndex == '-') {
            $('.VariationDayIndex').css("color", '#d00');
            $('.VariationDayIndex').html("( %" + t.VariationDayIndex.toString() + " )");
        }
        else {
            $('.VariationDayIndex').css("color", 'green');
            $('.VariationDayIndex').html("%" + t.VariationDayIndex.toString());
        }
    }
    $('.LastUpdate').html(t.LastUpdate.toString());
    $('.MaxIndex').html(t.MaxIndex.toString().SeparateNumber());
    $('.MinIndex').html(t.MinIndex.toString().SeparateNumber());
};
function GetSet_info(t) {
    var currentTotalTrade = (t.TotalNumberOfTrade);
    if (currentTotalTrade > 1000000000) {
        currentTotalTrade = (currentTotalTrade / 1000000000).toFixed(2).toString().SeparateNumber() + "(B)";
        $('.TotalNumberOfTrade').html(currentTotalTrade);
    }
    else if (currentTotalTrade > 1000000) {
        currentTotalTrade = (currentTotalTrade / 1000000).toFixed(2).toString().SeparateNumber() + "(M)";
        $('.TotalNumberOfTrade').html(currentTotalTrade);
    }
    else {
        currentTotalTrade = currentTotalTrade.toString().SeparateNumber();
        $('.TotalNumberOfTrade').html(currentTotalTrade);
    };
    $('.TotalNumberOfTrade').addClass('h');
    var currentTotalShare = (t.TotalNumberOfShare);
    if (currentTotalShare > 1000000000) {
        currentTotalShare = (currentTotalShare / 1000000000).toFixed(2).toString().SeparateNumber() + "(B)";
        $('.TotalNumberOfShare').html(currentTotalShare);
    }
    else if (currentTotalShare > 1000000) {
        currentTotalShare = (currentTotalShare / 1000000).toFixed(2).toString().SeparateNumber() + "(M)";
        $('.TotalNumberOfShare').html(currentTotalShare);
    }
    else {
        currentTotalShare = currentTotalShare.toString().SeparateNumber();
        $('.TotalNumberOfShare').html(currentTotalShare);
    };
    $('.TotalNumberOfShare').addClass('h');
    var currentTotalValue = (t.MarketTotalTradeValue);
    if (currentTotalValue > 1000000000) {
        currentTotalValue = (currentTotalValue / 1000000000).toFixed(2).toString().SeparateNumber() + "(B)";
        $('.MarketTotalTradeValue').html(currentTotalValue);
    }
    else if (currentTotalValue > 1000000) {
        currentTotalValue = (currentTotalValue / 1000000).toFixed(2).toString().SeparateNumber() + "(M)";
        $('.MarketTotalTradeValue').html(currentTotalValue);
    }
    else {
        currentTotalValue = currentTotalValue.toString().SeparateNumber();
        $('.MarketTotalTradeValue').html(currentTotalValue);
    };
    $('.MarketTotalTradeValue').addClass('h');
    $('.TotalNumberOfTrade').html(currentTotalTrade);
    $('.TotalNumberOfShare').html(currentTotalShare);
    $('.MarketTotalTradeValue').html(currentTotalValue);
};
