var messageApi = function () {
    var subMessages = null;
    var subTextMessages = null;
    var currentMessageType = 4;
    var strMore = "";
    var messages = [ [], [], [], [], [], [], [], [] ];
    var intelligentMessages = [];
    var lblMessagesCount = null;
    var lblCountIntelligent = null;
    var messagesCount = {
        myPortfolioSupervisor:0,
        marketSupervisor: 0,
        oms: 0,
        quick: 0,
        total: 0,
        intelligent: 0
    };
    var selectedIsin = null;
    var tabsMessageTypes = null;
    var portfolioList = null;

    function Messages(isin) {
        selectedIsin = isin;
        tabsMessageTypes = $("#tabsMessageType li");

        tabsMessageTypes.onclicked(msTabClick);

        setTimeout(function () {
            if (selectedIsin) {
                GetAndShowMessages(function() {
                    tabsMessageTypes[4].click();
                    }
                );
            }
            else
                tabsMessageTypes[0].click();
        });

        
        
    }

    function msTabClick(e) {
        currentMessageType = this.getAttribute("mtype");
        tabsMessageTypes.removeClass("active");
        this.classList.add("active");

        $("#message-list > div").hide();
        $("#messages-list-" + currentMessageType).show();


        var lastMessageId = null;
        var lastMessage = document.querySelector("#messages-list-" + currentMessageType + " .item");
        if (lastMessage) {
            lastMessageId = lastMessage.getAttribute("messageid");
            utility.setCookie("lastmessage-" + currentMessageType, lastMessageId, 1);
        }

        (function (type) {
            setTimeout(function () {
                refreshMessage(type);

                var unreades = $("#messages-list-" + type + " .unreaded");
                if (unreades && unreades.removeClass)
                    unreades.removeClass("unreaded");

            }, 5000);
        })(currentMessageType);
    }

    function ShowMessageCount() {
        if (!(lblMessagesCount && lblMessagesCount.text))
            lblMessagesCount = $("#messagesCount");

        if (lblMessagesCount && lblMessagesCount.text) {
            lblMessagesCount.text(messagesCount.total > 0 ? messagesCount.total : "");
            lblMessagesCount.removeClass("tp-bg-re");
            lblMessagesCount.removeClass("tp-bg-ye");
            lblMessagesCount.addClass(messagesCount.quick > 0 ? "tp-bg-re" : "tp-bg-ye");
            if (messagesCount.total > 0) {
                lblMessagesCount.show();
            } else {
                lblMessagesCount.hide();
            }
            if (messagesCount.quick > 0) {
                document.head.querySelector("title").innerHTML = `${window.BrokerName} (${messagesCount.quick})`;
            } else {
                document.head.querySelector("title").innerHTML = window.BrokerName;
            }
            var lblCount1 = document.getElementById("lblMessageCount_1");
            var lblCount2 = document.getElementById("lblMessageCount_2");
            var lblCount4 = document.getElementById("lblMessageCount_4");
            var lblCount6 = document.getElementById("lblMessageCount_6");

            lblCount1.innerHTML = messagesCount.oms;
            lblCount2.innerHTML = messagesCount.quick;
            lblCount4.innerHTML = messagesCount.marketSupervisor;
            lblCount6.innerHTML = messagesCount.myPortfolioSupervisor;

            lblCount1.style.display = messagesCount.oms > 0 ? "inline-block" : "none";
            lblCount2.style.display = messagesCount.quick > 0 ? "inline-block" : "none";
            lblCount4.style.display = messagesCount.marketSupervisor > 0 ? "inline-block" : "none";
            lblCount6.style.display = messagesCount.myPortfolioSupervisor > 0 ? "inline-block" : "none";
        }
    }

    function refreshAllCounts() {

        messagesCount.myPortfolioSupervisor = getUnReadMessageCount(6, false);
        messagesCount.marketSupervisor = getUnReadMessageCount(4, false);
        messagesCount.quick = getUnReadMessageCount(2, false);
        messagesCount.oms = getUnReadMessageCount(1, false);
        messagesCount.total = getUnReadMessageCount(-1, false);

        ShowMessageCount();
    };

    function refreshMessageCountIntelligent() {
        self.messagesCount.intelligent = getUnReadIntelligenMessageCount(false);
        if (!lblCountIntelligent)
            lblCountIntelligent = document.getElementById("lbl_messagesCountIntelligent");

        if (lblCountIntelligent) {
            if (self.messagesCount.intelligent > 0) {
                lblCountIntelligent.style.display = "inline-block";
                lblCountIntelligent.innerHTML = self.messagesCount.intelligent;
            } else {
                lblCountIntelligent.style.display = "none";
            }
        }

    }

    function getUnReadMessageCount(messageType, isRead) {
        if (messageType === -1) {
            var totalCount = 0;
            for (let i = 0; i < messages.length; i++) {
                if (i !== 1 && i != 6 && i != 7) {
                    totalCount += getUnReadMessageCount(i, isRead);
                }
            }
            return totalCount;
        }
        var unReadMessageCount = 0;
        var msgs = messages[messageType];
        if (msgs) {
            for (var i = 0; i < msgs.length; i++) {
                if (isRead === false) {
                    if (!messages[messageType][i].isReaded) {
                        unReadMessageCount++;
                    }
                } else {
                    unReadMessageCount++;
                }
            }
        }
        return unReadMessageCount;
    };

    function getUnReadIntelligenMessageCount(isRead) {
        var unReadMessageCount = 0;
        for (var i = 0; i < intelligentMessages.length; i++) {
            if (isRead === false) {
                if (!intelligentMessages[i].isReaded) {
                    unReadMessageCount++;
                }
            } else {
                unReadMessageCount++;
            }
        }
        return unReadMessageCount;
    }

    function addMessageToList(mType, MessageTitle, MessageText, myDate, MessageId, isReaded, isBulk, prepend) {
        try {
            var cookieKey = "";
            if (mType == 6)
                cookieKey = "text6_" + MessageId;
            else
                cookieKey = getKey(MessageText);

            MessageText = MessageText
                .replaceAll(". ", ".<br />")
                .replaceAll("؛", "؛ ");
            
            messages[mType].unshift({
                messageId: MessageId,
                messageTitle: MessageTitle,
                messageBody: MessageText,
                isReaded: isReaded,
                time: myDate
            });

            if (!isBulk) {
                refreshAllCounts();
            }
            if (!(isBulk && isReaded)) {
                switch (mType) {
                    case 1: // هسته
                        Notify({ type: "info", text: MessageText, duration: 7, cookieKey: cookieKey });
                        self.messagesCount.oms = getUnReadMessageCount(1, false);
                        break;
                    case 2: // فوری
                        Notify({ type: "warning", text: MessageText, duration: 10, cookieKey: cookieKey });
                        self.messagesCount.quick = getUnReadMessageCount(2, false);
                        break;
                    case 6: // ناظر مربوط به پرتفوی کاربر
                        //if settings on : Notify({ type: "info", text: "پیام ناظر: " + MessageText, duration: 10, cookieKey: cookieKey });
                        self.messagesCount.quick = getUnReadMessageCount(2, false);
                        break;
                    default:
                }
            }
            if (MessageText == null || MessageText.length <= 0)
                MessageText = MessageTitle;

            if (MessageText == null)
                MessageText = "";

            var isSummary = mType != 2;
            var summaryText = isSummary ? "<b>" + MessageTitle + "</b>" : MessageText;

            var summaryElem = document.createElement("span");
            var itemElem = document.createElement("div");

            var dateElem = document.createElement("span");
            var dateText = selectedIsin ? Convert.ToShamsiFormat(myDate, "jYYYY/jMM/jDD HH:mm") : Convert.ToShamsiFormat(myDate, "HH:mm");
            dateElem.innerHTML = dateText;
            dateElem.classList.add("digit", "datetime");
            itemElem.appendChild(dateElem);

            summaryElem.innerHTML = summaryText;
            itemElem.classList.add("item");
            itemElem.setAttribute("messageid", MessageId);
            if (!isReaded) {
                itemElem.classList.add("unreaded");
                itemElem.onclick = function () {
                    this.classList.remove("unreaded");
                };
            }

            itemElem.appendChild(summaryElem);

            if (isSummary) {
                var moreElem = document.createElement("span");
                moreElem.innerHTML = strMore;
                moreElem.style.display = "inline-block";
                itemElem.addEventListener("click", function (e) {
                        this.classList.toggle("open");
                        if (moreElem.style.display == "inline-block") {
                            summaryElem.innerHTML = "<b>" + MessageTitle + "</b>" + "<br/>" + MessageText;
                            moreElem.style.display = "none";
                        } else {
                            summaryElem.innerHTML = "<b>" + MessageTitle + "</b>";
                            moreElem.style.display = "inline-block";
                        }

                    });
                itemElem.appendChild(moreElem);
            }

            

            if (prepend)
                document.getElementById("messages-list-" + mType).prepend(itemElem);
            else
                document.getElementById("messages-list-" + mType).appendChild(itemElem);

        } catch (e) {
            console.error(e);
        }
    }

    function addIntelligentMessage(MessageTitle, MessageText, myDate, MessageId, isReaded) {
        self.intelligentMessages.unshift({
            messageId: MessageId,
            messageTitle: MessageTitle,
            messageBody: MessageText,
            isReaded: isReaded,
            time: myDate,
            isExpand: false,
            toggle() {
                this.isExpand = !this.isExpand;
            }
        });

        refreshMessageCountIntelligent();


        Notify({ text: MessageText, type: "warning" });

        var itemElem = document.createElement("div");
        var textElem = document.createElement("span");
        textElem.innerHTML = MessageText + `<br/><div>${Convert.ToShamsiFormat(myDate, "jYYYY/jMM/jDD")}</div>`;
        itemElem.classList.add("item");
        itemElem.appendChild(textElem);

        $("#ConditionalAlerts").appendChild(itemElem);

    }

    function getKey(val) {
         
        return "text0_" + val.hashCode();
    }

    function subscribeMessages() {

        var userschema = ["text0", "conditionalalert0", "refresh", "logout"];
        subMessages = LsService.PrivateSubscribe("RAW", userschema, messagesOnUpdate, subMessages, true);

        function messagesOnUpdate(updateInfo) {

            updateInfo.forEachChangedField(function (name, pos, val) {
                try {
                    if (val) {
                        const lastUnderLineIndex = val.lastIndexOf("_");
                        if (lastUnderLineIndex > 0) {
                            val = val.substr(0, lastUnderLineIndex);
                        }
                        switch (name) {
                            case "text0": //پیام فوری
                                {
                                    var isReaded = false;
                                    var cookieKey = getKey(val);
                                    if (utility.getCookie(cookieKey)) {
                                        isReaded = true;
                                    }
                                    
                                    addMessageToList(2, val, val, new Date(), 1, isReaded, false, true);

                                }
                                break;
                            case "text1": //پیام هسته
                            case "text2":
                            case "text3":
                                addMessageToList(1, val, val, new Date(), 1, false, false, true);
                                break;
                            case "conditionalalert0": //پیام شرطی
                                addIntelligentMessage(val, val, new Date(), 1, false);
                                break;
                            case "refresh":
                                window.location = window.location;
                                break;
                            case "logout":
                                if (typeof rootWebSite == "undefined" || rootWebSite == null || rootWebSite == "") {
                                    window.location = "/Account/LogOut";
                                } else
                                    window.location = rootWebSite + "/Account/LogOut";
                                break;
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            });
        }
    }

    function subscribeTextMessages() {

        var textMessageShema = ["TextMessage", 'TextMessageTitle', 'TextMessageDate', 'TextMessageTime'];
        var textMesageItem = ['textmessage_lightrlc'];
        subTextMessages = LsService.SimpleSubscribe(textMesageItem, textMessageShema, textMessageOnUpdate, subTextMessages);

        function textMessageOnUpdate(updateInfo) {
            const dateOfEvent = updateInfo.getValue('TextMessageDate');
            if (dateOfEvent) {
                const
                    dateOfEventString = dateOfEvent.toString(),
                    pad = '000000';

                let timeOfEventString = updateInfo.getValue('TextMessageTime').toString();
                timeOfEventString = (pad + timeOfEventString).slice(-pad.length);
                var date = new Date(
                    dateOfEventString.substring(0, 4),
                    parseInt(dateOfEventString.substring(4, 6)) - 1,
                    dateOfEventString.substring(6, 8),
                    timeOfEventString.substring(0, 2),
                    timeOfEventString.substring(2, 4),
                    timeOfEventString.substring(4, 6),
                    0);

                //const time = Convert.ToShamsi(date);
                var title = updateInfo.getValue('TextMessageTitle'),
                    text = updateInfo.getValue('TextMessage');

                addMessageToList(4, title, text, date, 1, false, false, true);

                checkPortfolioMessage(title, text, date, 1, false, false);

                if (ShowMessageCount)
                    ShowMessageCount();

            }
        }
    }

    function checkPortfolioMessage(title, text, date, id, readed, bulk) {
        if (portfolioList && portfolioList.length > 0) {
            for (var j = 0; j < portfolioList.length; j++) {
                var exist = false;
                var symbol = portfolioList[j].SymbolFa.replace("1", "");
                if (
                    (text && (text.indexOf(" " + symbol + " ") >= 0 || text.indexOf("(" + symbol + ")") >= 0))
                    ||
                    (title && (title.indexOf(" " + symbol + " ") >= 0) || title.indexOf("(" + symbol + ")") >= 0)
                ) {
                    exist = true;
                }
                var symbolC = portfolioList[j].SymbolFa.replace("1", "") + "1";
                if (
                    (text && (text.indexOf(" " + symbolC + " ") >= 0 || text.indexOf("(" + symbolC + ")") >= 0))
                    ||
                    (title && (title.indexOf(" " + symbolC + " ") >= 0) || title.indexOf("(" + symbolC + ")") >= 0)
                )
                {
                    exist = true;
                }
                if(exist) {

                    var cookieKey = "text6_" + id;
                    var isReaded = false;
                    if (utility.getCookie(cookieKey))
                        isReaded = true;

                    readed = isReaded;
                    addMessageToList(6, title, text, date, id, readed, bulk, true);
                }
            }
        }
    }

    function refreshMessage(type) {
        
        if (messages[type]) {

            for (var i = 0; i < messages[type].length; i++) {
                messages[type][i].isReaded = true;
            }
            refreshAllCounts();
        }
    };

    function GetAndShowMessages(fnCallback) {
        try {
            if (typeof (PortfolioApi) != "undefined" && PortfolioApi.portfolioList) {
                portfolioList = PortfolioApi.portfolioList;
                continueGetAndShowMessages();
            } else {
                SiteServices.GetDailyCustomerStockPortfolio(function (data) {
                    if (!(data && data.Data && data.Data.length > 0))
                        data.Data = [];

                    for (var i = 0; i < data.Data.length; i++) {
                        data.Data[i].SymbolFa = data.Data[i].InsCode;
                    }
                    portfolioList = data.Data;
                    continueGetAndShowMessages();

                });

            };

            function continueGetAndShowMessages() {
                const
                date = new Date(),
                fullDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
                searchParam = {
                    FromDate: fullDate,
                    toDate: fullDate,
                    PageIndex: 0,
                    PageSize: 30,
                    SupportPaging: false,
                    Isin: ""
                };
                if (selectedIsin) {
                    searchParam.Isin = selectedIsin;
                    searchParam.FromDate = "";
                    searchParam.PageSize = 10;
                }

                SiteServices.GetSupervisorMessageForHeader(searchParam,
                    function (data) {
                        if (!selectedIsin)
                            document.getElementById("messages-list-4").innerHTML = "";
                        document.getElementById("messages-list-6").innerHTML = "";
                        document.getElementById("messages-list-7").innerHTML = "";
                        for (let i = 0; i < data.Data.Result.length; i++) {

                            var row = data.Data.Result[i];

                            var myDate = Convert.StringToDate(row.DateOfEventString);
                            var isRead = true;
                            var lastMessageId = utility.getCookie("lastmessage-4");
                            lastMessageId = +lastMessageId;
                            if (!isNaN(lastMessageId)) {
                                if (row.TextMessageID > lastMessageId)
                                    isRead = false;
                            }
                            (function (row, myDate, isRead) {
                                setTimeout(function () {
                                    var msg = {
                                        t: row.MessageTitle,
                                        b: row.MessageText,
                                        d: myDate,
                                        id: row.TextMessageID,
                                        r: isRead,
                                        x: true
                                    };
                                    if (selectedIsin) {
                                        addMessageToList(7, msg.t, msg.b, msg.d, msg.id, msg.r, msg.x);
                                    }
                                    else {
                                        addMessageToList(4, msg.t, msg.b, msg.d, msg.id, msg.r, msg.x);
                                        checkPortfolioMessage(msg.t, msg.b, msg.d, msg.id, msg.r, msg.x);
                                    }
                                }, 50);
                            })(row, myDate, isRead);

                        }

                        if (fnCallback)
                            fnCallback();

                        setTimeout(function () {
                            refreshAllCounts();
                            subscribeTextMessages();
                        }, 1000);

                    });
                if (!selectedIsin) {
                    SiteServices.GetTodayMessageList({}, function (data) {
                        $("#messages-list-" + currentMessageType).innerHTML = "";
                        data.Data.Result = data.Data.Result.sort(function (a, b) {
                            return a.SendDate - b.SendDate;
                        });
                        for (let i = 0; i < data.Data.Result.length; i++) {

                            var row = data.Data.Result[i];

                            var myDate = Convert.StringToDate(row.SendDate);



                            if (!row.IsRead) {
                                var cookieKey = getKey(row.MessageString);
                                if (utility.getCookie(cookieKey)) {
                                    row.IsRead = true;
                                }
                            }

                            switch (row.MessagingType) {
                                case 1: //سیستم
                                    addMessageToList(2,
                                        row.MessageTitle,
                                        row.MessageString,
                                        myDate,
                                        row.TextMessageID,
                                        row.IsRead,
                                        true);
                                    break;
                                case 2: //فوری
                                    addMessageToList(2,
                                        row.MessageTitle,
                                        row.MessageString,
                                        myDate,
                                        row.TextMessageID,
                                        row.IsRead,
                                        true);
                                    break;
                                case 3: //هوشمند
                                    addIntelligentMessage(0,
                                        row.MessageTitle,
                                        row.MessageString,
                                        myDate,
                                        row.TextMessageID,
                                        row.IsRead,
                                        true);
                                    break;
                                default:
                                    break;
                            }
                        }
                        refreshAllCounts();
                        subscribeMessages();

                    });
                }
                
            }
            
        } catch (e) {
            console.log(e);
        }
    };

    return{
        refreshMessage: refreshMessage,
        GetAndShowMessages: GetAndShowMessages,
        initMessages: Messages
    }
}();

var Messages = function(isin) {
    messageApi.initMessages(isin);
}; 
;
let subStockDetails = null;
let subscribeRealLow = null;
var SELF_Details = null;

function StockDetailsModule() {
    if (SELF_Details == null) {
        SELF_Details = {};
        SELF_Details.selectedIsin = "";
        SELF_Details.selectedTab = "1";
        SELF_Details.stockInfo = null;
        SELF_Details.fundamentalInfo = null;
        SELF_Details.realLawInfo = null;
        SELF_Details.actualValue = 0;
        SELF_Details.timerRemoveClass = {};
        SELF_Details.tabs = $("stock-details .navigator div");
        SELF_Details.sliderRange = $("#dailyslider_range");
        SELF_Details.slider_tooltip = $2("#dailyslider_tooltip");
        SELF_Details.range_current = $("#dailyslider_range_current");
        SELF_Details.slider_max = $("#dailyslider_max");
        SELF_Details.slider_min = $("#dailyslider_min");
        SELF_Details.SliderPositive = document.querySelector("#dailyslider_main_bar .positive");
        SELF_Details.SliderNegative = document.querySelector("#dailyslider_main_bar .negative");
        
        SELF_Details.tabs.onclicked(function () {
            ChangeTab(this);
        });

        ChangeTab(SELF_Details.tabs[0]);

        document.addEventListener("symbolIsinChange_Event", function (e) {
            SELF_Details.ChangeSymbolIsin(e);
        }, false);

    }

    function ChangeTab(_sel) {
        SELF_Details.selectedTab = _sel.getAttribute("index");
        $(".tblDetails_stockDetails").css("display", "none");
        $("#tblDetails_stockDetails_" + SELF_Details.selectedTab).css("display", "inline-table");
        $("stock-details .navigator div").removeClass("active");
        _sel.classList.add("active");
        SetFundamentalInfo();
    }

    function SetFundamentalInfo() {
        if (SELF_Details.selectedTab == "1" || SELF_Details.selectedTab == "2") {

            if (SELF_Details.selectedIsin != null && SELF_Details.selectedIsin != "") {
                RlcServices.GetStockFundamentalInfo(SELF_Details.selectedIsin,
                    function (data) {
                        SELF_Details.fundamentalInfo = data;
                        $2("#stock_PE").text(SELF_Details.fundamentalInfo.PE);
                        $2("#stock_GPE").text(SELF_Details.fundamentalInfo.GPE);
                        $2("#stock_EPS").text(SELF_Details.fundamentalInfo.EPS);
                        $2("#stock_DPS").text(SELF_Details.fundamentalInfo.DPS);
                        $2("#stock_FYear").text(SELF_Details.fundamentalInfo.FYear);
                        $2("#stock_E30").text(SELF_Details.fundamentalInfo.E30 + " %");
                        $2("#stock_E90").text(SELF_Details.fundamentalInfo.E90 + " %");
                        $2("#stock_E360").text(SELF_Details.fundamentalInfo.E360 + " %");
                        $2("#stock_FloatPercent").text(SELF_Details.fundamentalInfo.FloatPercent);
                        $2("#stock_Valume90AVG").text(SELF_Details.fundamentalInfo.Valume90AVG.commaSeperate());
                    });
            }
        }
    }

    function subscribeStockDetils(isin) {
        var isinList = [(isin + "_lightrlc").toLowerCase()];
        var userschema = [
            "HighPrice",
            "TotalNumberOfTrades",
            "TotalTradeValue",
            "LastTradedPrice",
            "LastTradedPriceVar",
            "LastTradedPriceVarPercent",
            "LowPrice",
            "TotalNumberOfSharesTraded",
            "TradeDate",
            "ClosingPrice",
            "SymbolStateId",
            "ClosingPriceVar",
            "ClosingPriceVarPercent",
            "YesterdayPrice"
        ];
        subStockDetails = LsService.SimpleSubscribe(
            isinList,
            userschema,
            stockDetailsOnUpdate,
            subStockDetails);

        function stockDetailsOnUpdate(updateInfo) {
            try {
                updateInfo.forEachChangedField(function (name, pos, val) {
                    if (val) {
                        if (name === "ClosingPrice") {
                            val = parseFloat(val);
                            if (SELF_Details.fundamentalInfo && SELF_Details.fundamentalInfo.EPS && SELF_Details.fundamentalInfo.EPS !== 0) {
                                SELF_Details.fundamentalInfo.PE = (val / SELF_Details.fundamentalInfo.EPS).toFixed(2);
                                $2("#stock_PE").text(SELF_Details.fundamentalInfo.PE);
                            }

                            SELF_Details.stockInfo.TomarrowHigh = Math.floor(val +(SELF_Details.stockInfo.MaxPercent * val / 100));
                            SELF_Details.stockInfo.TomarrowLow = Math.ceil(val -(SELF_Details.stockInfo.MaxPercent * val / 100));

                            $2("#stock_TomarrowHigh").text (SELF_Details.stockInfo.TomarrowHigh.commaSeperate());
                            $2("#stock_TomarrowLow").text (SELF_Details.stockInfo.TomarrowLow.commaSeperate());

                        }
                        else if (name == "TradeDate") {
                            $2("#stock_TradeTime").text(val.substring(11));
                        }

                        var oldVal = SELF_Details.stockInfo[name];
                        SELF_Details.stockInfo[name]= val;

                        if (["LastTradedPrice", "LastTradedPriceVar", "LastTradedPriceVarPercent"].indexOf(name) >= 0) {
                            var varSign = +val > +oldVal ? 1: (+val < +oldVal ? - 1 : 0);
                            if (+val != +oldVal)
                                autoCompleteApi.SetAutoCompleteStock(SELF_Details.stockInfo, varSign);

                        } else {
                            var pp = GlobalVar.pushPositveClass;
                            var pn = GlobalVar.pushNegativeClass;

                            var elem = $2("#stock_" + name);
                            var oldVal = null;
                            if (elem != null && elem.text != null && elem.text() != "")
                                oldVal = +elem.text().replaceAll(",", "");
                            if (name == "TradeDate")
                                elem.text(val);
                            else {
                                if (["TotalTradeValue", "TotalNumberOfSharesTraded"].indexOf(name) >= 0)
                                    elem.text(val.commaSeperateMinimize());
                                else
                                    if (["ClosingPriceVar", "ClosingPriceVarPercent"].indexOf(name) >= 0)
                                        elem.text(Math.abs(val).commaSeperate());
                                    else
                                        elem.text(val.commaSeperate());
                            }
                            if (!isNaN(oldVal) && pp != null && pp != "" && pn!= null && pn != "")
                            {
                                var classToAdd = oldVal < +val ? pp : (oldVal > +val ? pn : "");
                                
                                if (classToAdd != "" && !elem.classList.contains(classToAdd)) {
                                        elem.classList.add(classToAdd);

                                        if (SELF_Details.timerRemoveClass[name] != null) {
                                            clearTimeout(SELF_Details.timerRemoveClass[name]);
                                            SELF_Details.timerRemoveClass[name] = null;
                                        }
                                        SELF_Details.timerRemoveClass[name] = setTimeout(function() {
                                                elem.classList.remove(pp);
                                                elem.classList.remove(pn);
                                                clearTimeout(SELF_Details.timerRemoveClass[name]);
                                                SELF_Details.timerRemoveClass[name] = null;
                                        }, 1500);
                               }
                            }
                        }
                        var refreshSliderBg = ["HighPrice", "LowPrice", "YesterdayPrice", "SymbolStateId"].indexOf(name) >= 0;

                        if (["HighPrice", "LowPrice", "LastTradedPrice", "YesterdayPrice", "SymbolStateId"].indexOf(name) >= 0)
                            SetDailySlider(refreshSliderBg);
                    }

                });

            } catch(e) {
                console.error(e);
                console.error(updateInfo);
            };
        }
    }

    function subscribeRealLawInfo(isin) {
        var schema = [
            "IndInstTrade_Individual_BuyValue",
            "IndInstTrade_Individual_BuyVolume",
            "IndInstTrade_Individual_BuyNumber",
            "IndInstTrade_Individual_SellValue",
            "IndInstTrade_Individual_SellVolume",
            "IndInstTrade_Individual_SellNumber",
            "IndInstTrade_Institutional_BuyValue",
            "IndInstTrade_Institutional_BuyVolume",
            "IndInstTrade_Institutional_BuyNumber",
            "IndInstTrade_Institutional_SellVolume",
            "IndInstTrade_Institutional_SellValue",
            "IndInstTrade_Institutional_SellNumber"
        ];
        var fieldMap = [
            "IndBuyValue",
            "IndBuyVolume",
            "IndBuyNumber",
            "IndSellValue",
            "IndSellVolume",
            "IndSellNumber",
            "InsBuyValue",
            "InsBuyVolume",
            "InsBuyNumber",
            "InsSellVolume",
            "InsSellValue",
            "InsSellNumber"
        ];
        var isins = [];
        isins.push((isin + "_lightrlc").toLowerCase());
        subscribeRealLow = LsService.SubscriptionToLS("MERGE", isins, schema, "", "yes", stockRealLowDetailsOnUpdate, subscribeRealLow);

        function stockRealLowDetailsOnUpdate(updateInfo) {
            for (var i = 0; i < schema.length; i++) {
                var pName = schema[i];
                SELF_Details.realLawInfo[fieldMap[i]] = +(updateInfo.getValue(pName));
            }
            try {

                SiteServices.AppendIndInsPercents(SELF_Details.realLawInfo);
                setStockRealLowDetails();

            } catch (e) {
                console.log('IndInssub_OnUpdate_Exception' + e);
            }
        }

    }

    function SetStockDetails() {
        try {
            $2("#stock_YesterdayPrice").text(SELF_Details.stockInfo.YesterdayPrice.commaSeperate());
            $2("#stock_ClosingPrice").text(SELF_Details.stockInfo.ClosingPrice.commaSeperate());
            $2("#stock_ClosingPriceVar").text(Math.abs(SELF_Details.stockInfo.ClosingPriceVar).commaSeperate());
            $2("#stock_ClosingPriceVarPercent").text(Math.abs(SELF_Details.stockInfo.ClosingPriceVarPercent.commaSeperate()));
            $2("#stock_TotalNumberOfSharesTraded").text(SELF_Details.stockInfo.TotalNumberOfSharesTraded.commaSeperateMinimize());
            $2("#stock_TotalTradeValue").text(SELF_Details.stockInfo.TotalTradeValue.commaSeperateMinimize());
            $2("#stock_LowPrice").text(SELF_Details.stockInfo.LowPrice.commaSeperate());
            $2("#stock_HighPrice").text(SELF_Details.stockInfo.HighPrice.commaSeperate());
            $2("#stock_TotalNumberOfTrades").text(SELF_Details.stockInfo.TotalNumberOfTrades.commaSeperate());
            $2("#stock_BaseVolume").text(SELF_Details.stockInfo.BaseVolume.commaSeperate());
            $2("#stock_TomarrowLow").text(SELF_Details.stockInfo.TomarrowLow.commaSeperate());
            $2("#stock_TomarrowHigh").text(SELF_Details.stockInfo.TomarrowHigh.commaSeperate());
            $2("#stock_SymbolStateId").text(translate(("SymbolState_" + SELF_Details.stockInfo.SymbolStateId)));
            $2("#stock_GroupStateID").text(SELF_Details.stockInfo.GroupStateID > 1 ? translate(("GroupStateId" + SELF_Details.stockInfo.GroupStateID)) : "");
            $2("#stock_TradeDate").text(SELF_Details.stockInfo.TradeDate);
            $2("#stock_TradeTime").text(SELF_Details.stockInfo.TradeDate.substring(12));

            var lbl_currentSymbolName = $2(".lbl_currentSymbolName");
            if (lbl_currentSymbolName && lbl_currentSymbolName.text)
                lbl_currentSymbolName.text(SELF_Details.stockInfo.Symbol);
            var stock_ClosingPriceVar_Box = $("#stock_ClosingPriceVar_Box");
            stock_ClosingPriceVar_Box.addClass("tp-bg-gr");
            stock_ClosingPriceVar_Box.removeClass("tp-bg-re");
            stock_ClosingPriceVar_Box.addClass(SELF_Details.stockInfo.ClosingPriceVar >= 0 ? "tp-bg-gr" : "tp-bg-re");

            var tblDetails_stockDetails = $(".tblDetails_stockDetails");


            if (SELF_Details.stockInfo.IsOption || SELF_Details.stockInfo.IsAti) {

                tblDetails_stockDetails.removeClass("is-option-no");
                tblDetails_stockDetails.addClass("is-option");

                if (SELF_Details.stockInfo.IsAti) {
                    $2("#stock_StrikePriceLBL").text("تعداد موقعیت های باز");
                    SiteServices.GetSymbolAtiInfo(SELF_Details.stockInfo.NSCCode, function (data) {

                        if (data) {

                            SELF_Details.stockInfo.SDate = data.BDate;
                            SELF_Details.stockInfo.EDate = data.EDate;
                            SELF_Details.stockInfo.StrikePrice = data.MOP;
                            SELF_Details.stockInfo.CSize = data.Quantity;
                            SELF_Details.stockInfo.InitialMargin = data.AIMValue ;
                            SELF_Details.stockInfo.BaseSymbolLastTradedPrice = 0;
                            setOptionInfo();
                            var baseIsin = data.BaseAssetIsin;
                            if (baseIsin.toLowerCase().indexOf("irx") >= 0) {
                                RlcServices.GetIndexDetail([baseIsin], function (dataIndex) {
                                    var indexInfo = dataIndex.IndexHistoricalDataResult[baseIsin.toUpperCase()];
                                    if (!indexInfo)
                                        indexInfo = { LastIndexValue:0};
                                    SELF_Details.stockInfo.BaseSymbolLastTradedPrice = indexInfo.LastIndexValue;
                                    $2("#stock_BaseSymbolLastTradedPrice").text(indexInfo.LastIndexValue.commaSeperate());
                                });
                            } else {
                                RlcServices.GetStocksDetail(baseIsin, function (dataBaseSymbol) {
                                    var symbolInfo = dataBaseSymbol[0];
                                    SELF_Details.stockInfo.BaseSymbolLastTradedPrice = symbolInfo.LastTradedPrice;
                                    $2("#stock_BaseSymbolLastTradedPrice").text(symbolInfo.LastTradedPrice.commaSeperate());
                                });
                            }
                        }
                    });
                } else {
                    $2("#stock_StrikePriceLBL").text("قیمت اعمال");
                    setOptionInfo();
                }

                function setOptionInfo() {
                    $2("#stock_SDate").text(SELF_Details.stockInfo.SDate);
                    $2("#stock_EDate").text(SELF_Details.stockInfo.EDate);
                    $2("#stock_StrikePrice").text(SELF_Details.stockInfo.StrikePrice.commaSeperate());
                    $2("#stock_BaseSymbolLastTradedPrice").text(SELF_Details.stockInfo.BaseSymbolLastTradedPrice.commaSeperate());
                    $2("#stock_CSize").text(SELF_Details.stockInfo.CSize.commaSeperate());
                    $2("#stock_InitialMargin").text(SELF_Details.stockInfo.InitialMargin.commaSeperate() + (SELF_Details.stockInfo.IsAti ? " درصد از ارزش معامله" : ""));
                }
            } else {
                tblDetails_stockDetails.removeClass("is-option");
                tblDetails_stockDetails.addClass("is-option-no");

                $2("#stock_MinQOrder").text(SELF_Details.stockInfo.MinQOrder.commaSeperate());
                $2("#stock_MaxQOrder").text(SELF_Details.stockInfo.MaxQOrder.commaSeperate());

                RlcServices.GetIndInstTrade(SELF_Details.selectedIsin,
                    function (data) {
                        SELF_Details.realLawInfo = data;
                        if (SELF_Details.realLawInfo != null ) {
                            setStockRealLowDetails();
                            subscribeRealLawInfo(SELF_Details.selectedIsin);
                        }
                    });

                SetFundamentalInfo();
            }

            SetDailySlider(true);
            if( typeof(autoCompleteApi) != "undefined")
                autoCompleteApi.SetAutoCompleteStock(SELF_Details.stockInfo);

            if (typeof (autoCompleteApiDetailsSlider) != "undefined")
                autoCompleteApiDetailsSlider.SetAutoCompleteStock(SELF_Details.stockInfo);
            
            RlcServices.GetETF(SELF_Details.selectedIsin,
                function (data) {

                    if (data.ETFCancelNAV && data.ETFPublishDate) {

                        SELF_Details.stockInfo.ETFCancelNAV = data.ETFCancelNAV;
                        SELF_Details.stockInfo.ETFIssuanceNAV = data.ETFIssuanceNAV;
                        SELF_Details.stockInfo.ETFPublishDate = data.ETFPublishDate;

                        $("#row_ETF").css("display", "");

                        $("#stock_ETFCancelNAV").text(SELF_Details.stockInfo.ETFCancelNAV.commaSeperate());
                        $("#stock_ETFPublishDate").text(SELF_Details.stockInfo.ETFPublishDate);


                    } else {
                        $("#row_ETF").hide();
                    }
                });

            var btnStockMenu = document.getElementById("btn-stock-menu");
            if (btnStockMenu)
                btnStockMenu.onclick = function (e) {
                    gridRowContextMenu({
                        isin: SELF_Details.selectedIsin,
                        symbolFa: SELF_Details.stockInfo.Symbol.replace("1", ""),
                        InstrumentCode: SELF_Details.stockInfo.InstrumentCode,
                        onDeleteClick: null
                    }, e);
                }

        }
        catch (e) { }
    }

    function setStockRealLowDetails() {
        var realLawInfo = SELF_Details.realLawInfo;
        //$2("#stock_IndIns_IndBuyNumber_td").tooltip("تعداد  " + realLawInfo.IndBuyNumber.commaSeperate() + " (" + realLawInfo.IndBuyNumberPer + "%)");
        //$2("#stock_IndIns_IndSellNumber_td").tooltip("تعداد  " + realLawInfo.IndSellNumber.commaSeperate() + " (" + realLawInfo.IndSellNumberPer + "%)");
        //$2("#stock_IndIns_InsBuyNumber_td").tooltip("تعداد  " + (realLawInfo.InsBuyNumber.commaSeperate()) + " (" + realLawInfo.InsBuyNumberPer + "%)");
        //$2("#stock_IndIns_InsSellNumber_td").tooltip("تعداد  " +(realLawInfo.InsSellNumber.commaSeperate()) + " (" +realLawInfo.InsSellNumberPer + "%)");
        $2("#stock_IndIns_IndBuyVolume").text(realLawInfo.IndBuyVolume.commaSeperateMinimize());
        $2("#stock_IndIns_IndBuyVolumePer").text(realLawInfo.IndBuyVolumePer + " %");
        $2("#stock_IndIns_IndSellVolume").text(realLawInfo.IndSellVolume.commaSeperateMinimize());
        $2("#stock_IndIns_IndSellVolumePer").text(realLawInfo.IndSellVolumePer+ " %");
        $2("#stock_IndIns_InsBuyVolume").text(realLawInfo.InsBuyVolume.commaSeperateMinimize());
        $2("#stock_IndIns_InsBuyVolumePer").text(realLawInfo.InsBuyVolumePer+ " %");
        $2("#stock_IndIns_InsSellVolume").text(realLawInfo.InsSellVolume.commaSeperateMinimize());
        $2("#stock_IndIns_InsSellVolumePer").text(realLawInfo.InsSellVolumePer + " %");
        $2("#stock_IndIns_IndBuyNumber").text(realLawInfo.IndBuyNumber.commaSeperateMinimize());
        //$2("#stock_IndIns_IndBuyNumberPer").text(realLawInfo.IndBuyNumberPer.commaSeperate());
        $2("#stock_IndIns_IndSellNumber").text(realLawInfo.IndSellNumber.commaSeperateMinimize());
        //$2("#stock_IndIns_IndSellNumberPer").text(realLawInfo.IndSellNumberPer.commaSeperate());
        $2("#stock_IndIns_InsBuyNumber").text(realLawInfo.InsBuyNumber.commaSeperateMinimize());
        //$2("#stock_IndIns_InsBuyNumberPer").text(realLawInfo.InsBuyNumberPer.commaSeperate());
        $2("#stock_IndIns_InsSellNumber").text(realLawInfo.InsSellNumber.commaSeperateMinimize());
        //$2("#stock_IndIns_InsSellNumberPer").text(realLawInfo.InsSellNumberPer.commaSeperate());
    }

    function SetDailySlider(refreshSliderColor) {
        SetDailySliderValues(SELF_Details.stockInfo.HighAllowedPrice,
            SELF_Details.stockInfo.LowAllowedPrice,
            SELF_Details.stockInfo.HighPrice,
            SELF_Details.stockInfo.LowPrice,
            SELF_Details.stockInfo.LastTradedPrice,
            SELF_Details.stockInfo.YesterdayPrice,
            refreshSliderColor);
    }

    function SetDailySliderValues(Maximum, Minimum, HighValue, LowValue, CurrentVal, CenterVal, refreshSliderColor) {

        $2("#dailyslider_Low").text(Minimum.commaSeperate());
        $2("#dailyslider_Hight").text(Maximum.commaSeperate());
        $2("#dailyslider_Center").text(((Minimum + Maximum) / 2).toFixed(0).commaSeperate());

        var min, max;

        var width = (Maximum - Minimum);
        if (width > 0 && LowValue > 0 && HighValue > 0) {
            max = 100 * (Maximum - HighValue) / width;
            min = 100 * (LowValue - Minimum) / width;
        } else {
            max = 100;
            min = 0;
        }
        if (width > 0)
            SELF_Details.actualValue = 100 * (CurrentVal - Minimum) / width;
        else
            SELF_Details.actualValue = -1;

        SELF_Details.slider_max.css("width", max + "%");
        SELF_Details.slider_min.css("width", min + "%");

        if (SELF_Details.actualValue >= 0) {
            SELF_Details.range_current.css("left", `calc(${SELF_Details.actualValue}% - 2px)`);
            SELF_Details.range_current.show();

            if (refreshSliderColor) {
                var negativePercent = ((SELF_Details.stockInfo.YesterdayPrice - Minimum) * 100) / (Maximum - Minimum);
                var positivePercent = 100 - negativePercent;

                if (positivePercent < 0)
                    positivePercent = 0;

                if (negativePercent < 0)
                    negativePercent = 0;

                SELF_Details.SliderNegative.style.width = negativePercent + "%";
                SELF_Details.SliderPositive.style.width = positivePercent + "%";
            }

        } else {
            SELF_Details.sliderRange.hide();
            SELF_Details.range_current.hide();
        }
    };

    SELF_Details.ChangeSymbolIsin = function (evnt) {

        var newIsin = evnt.detail.stock[evnt.detail.key];
        var order = evnt.detail.order;
        var symbol = evnt.detail.stock.Symbol || evnt.detail.stock.SymbolFa;

        SELF_Details.selectedIsin = newIsin;

        SELF_Details.stockInfo = { NSCCode: newIsin, Symbol: symbol};
        if (typeof SendOrderApi != "undefined" && SendOrderApi != null && SendOrderApi.setSymbol != null)
        SendOrderApi.setSymbol(SELF_Details.stockInfo, order , false);

        subscribeStockDetils(SELF_Details.selectedIsin);

        if (typeof StockQueueApi != "undefined") {
            if (StockQueueApi.setSymbolInfo)
                StockQueueApi.setSymbolInfo(SELF_Details.stockInfo);
            if (StockQueueApi.SetQueueList)
                StockQueueApi.SetQueueList([]);
        }

        RlcServices.GetStockSymbolInfoAndQueue(SELF_Details.selectedIsin, true,
            function (data) {

                SELF_Details.stockInfo = data.symbolinfo;

                var symbolqueue = data.symbolqueue;

                SetStockDetails();

                if (typeof StockQueueApi != "undefined") {
                    if (StockQueueApi.setSymbolInfo)
                        StockQueueApi.setSymbolInfo(SELF_Details.stockInfo);
                    if (StockQueueApi.SetQueueList)
                        StockQueueApi.SetQueueList(symbolqueue);
                }
                subscribeStockDetils(SELF_Details.selectedIsin);
                if (typeof SymbolChartApi != "undefined" && SymbolChartApi != null && SymbolChartApi.ChangeSymbolChart != null)
                    SymbolChartApi.ChangeSymbolChart(SELF_Details.selectedIsin, SELF_Details.stockInfo.YesterdayPrice, SELF_Details.stockInfo.HighPrice, SELF_Details.stockInfo.LowPrice);

                if (typeof SendOrderApi != "undefined" && SendOrderApi != null && SendOrderApi.setSymbol != null)
                    SendOrderApi.setSymbol(SELF_Details.stockInfo, order , true);
            });


    };

    $("#dailyslider_main_bar").mousemove(function (e) {
            var newLeft = e.clientX;
            SELF_Details.sliderRange.css("left", newLeft + "px");
            var mainbarOffset = this.getBoundingClientRect();
            SELF_Details.sliderRange.css("top", (mainbarOffset.top - 4) + "px");
            var slVal = sliderValue(e);

            SELF_Details.slider_tooltip.text(slVal.price + ` (<span style="font-size:11px">${slVal.percent} %</span>)`);

        }).mouseover(function () {
            SELF_Details.sliderRange.css("display", "flex");
        }).mouseout(function () {
            SELF_Details.sliderRange.hide();
        }).onclicked(function (e) {
            SendOrderApi.SetOrderPrice(sliderValue(e).price);
        });

    function sliderValue(e) {
        if (SELF_Details.stockInfo != null && SELF_Details.stockInfo.LowAllowedPrice != null) {
            var axis = xAxis(SELF_Details.stockInfo.LowAllowedPrice, SELF_Details.stockInfo.HighAllowedPrice);
            if (!axis || SELF_Details.stockInfo.LastTradedPrice === 0)
                return "";
            var price = axis(e.offsetX * 100 / document.getElementById("dailyslider_main_bar").clientWidth, true);
            var center = ((SELF_Details.stockInfo.HighAllowedPrice + SELF_Details.stockInfo.LowAllowedPrice) / 2);
            var percent = ((price * 100 / center) - 100).toFixed(2);
            return { price: parseInt(price).commaSeperate(), percent: percent }
        }
        return { price: "", percent: "" };
    }

    function xAxis(low, high) {
        const domain = high - low;

        return function (value, reverse) {
            if (reverse) {
                return value <= 0
                    ? low
                    : value * domain / 100 + low;
            } else {
                return value <= 0
                    ? 0
                    : (value - low) * 100 / domain;
            }
        }
    }

    window.addEventListener("resize", function () {
        if (utility.getElemWidth("tblDetails_stockDetails_1") < 400) {
            document.getElementById("tblDetails_stockDetails_1").classList.add("summary");
            document.getElementById("tblDetails_stockDetails_2").classList.add("summary");
        } else {
            document.getElementById("tblDetails_stockDetails_1").classList.remove("summary");
            document.getElementById("tblDetails_stockDetails_2").classList.remove("summary");
        }

    });

    

};

window.addEventListener('DOMContentLoaded',
    function() {

        StockDetailsModule();
    });
;
var StockQueueApi = {};

function Queue(rootId) {
    //rootId = "body";
    var stockQueue = null;
    var CurrentStock = {};
    var CurrentIsin = null;
    var min, max;
    var subStockQueue = null;
    var self = {};
    self.timerClearClass = {};

    function createQueue(body, sq) {
        body.innerHTML = "";
        var item = null;

        for (var index = 0; index < 5; index++) {
            if (!stockQueue[index])
                stockQueue[index] = {
                    NumberOfOrdersAtBestBuy: "",
                    BestBuyLimitQuantity: "",
                    BestBuyLimitPrice: "",
                    NumberOfOrdersAtBestSell: "",
                    BestSellLimitQuantity: "",
                    BestSellLimitPrice: ""
                };
            item = stockQueue[index];

            var row = document.createElement("tr");

            var tdCssclassBuy = (!(min > 0 && max > 0 )) || item.BestBuyLimitPrice >= min && item.BestBuyLimitPrice <= max ? "tp-co-2" : "tp-co-4";

            AppendToRow(row, tdCssclassBuy, item, "NumberOfOrdersAtBestBuy", index);
            AppendToRow(row, tdCssclassBuy, item, "BestBuyLimitQuantity", index);
            AppendToRow(row, tdCssclassBuy, item, "BestBuyLimitPrice", index);

            var tdCssclassSell = (!(min > 0 && max > 0)) || item.BestSellLimitPrice >= min && item.BestSellLimitPrice <= max ? "tp-co-2" : "tp-co-4";

            AppendToRow(row, tdCssclassSell, item, "BestSellLimitPrice", index);
            AppendToRow(row, tdCssclassSell, item, "BestSellLimitQuantity", index);
            AppendToRow(row, tdCssclassSell, item, "NumberOfOrdersAtBestSell", index);

            body.appendChild(row);;
        }
    }

    StockQueueApi.GetBestOrder = function(side) {
        return side == "Buy" ? stockQueue[0].BestBuyLimitPrice : stockQueue[0].BestSellLimitPrice;
    };

    StockQueueApi.SetQueueList = function (sq) {
        stockQueue = sq;
        var body = $(".stockqueueBody");
        if (body.length > 0)
            for (var i = 0; i < body.length; i++) {
                createQueue(body[i], sq);
            }
        else
            createQueue(body, sq);

        SubScripbeStockQueue(CurrentIsin);
    }

    StockQueueApi.setSymbolInfo = function (symbolInfo, minimize) {
        self.minimizeNums = minimize;
        CurrentStock = symbolInfo;

        CurrentIsin = CurrentStock.ISIN || CurrentStock.NSCCode;

        max = CurrentStock.HighAllowedPrice;
        min = CurrentStock.LowAllowedPrice;
    }

    document.addEventListener("symbolIsinChange_Event",function(e) {
            CurrentStock = e.detail.stock;
            CurrentIsin = e.detail.stock[e.detail.key];
            if (CurrentStock && CurrentStock.HighAllowedPrice) {
                max = CurrentStock.HighAllowedPrice;
                min = CurrentStock.LowAllowedPrice;
            }

    },false);

    function AppendToRow(row, tdCssclassBuy, item, name, index) {
        var td = document.createElement("td");
        td.id = "stockqueue_" + index + "_" + name;
        if (tdCssclassBuy != "")
            td.classList.add(tdCssclassBuy);

        if (index == 0 && name.indexOf("Price") >= 0) {
            td.classList.add("relative");
            var lock = document.createElement("span");
            var lockText = document.createElement("span");
            lock.classList.add("lock");
            lockText.innerHTML = lockOpen;
            lock.appendChild(lockText);

            if (name == "BestBuyLimitPrice") {
                lock.classList.add("Buy");
                lock.onclick = function() {
                    SendOrderApi.ChangeLock("Buy");
                }
            } else if (name == "BestSellLimitPrice") {
                lock.classList.add("Sell");
                lock.onclick = function() {
                    SendOrderApi.ChangeLock("Sell");
                }
            }

            td.appendChild(lock);
        }

        var spanText = document.createElement("span");
        spanText.classList.add("txt");
        spanText.innerText = (self.minimizeNums ? item[name].commaSeperateMinimize() : item[name].commaSeperate());
        if (["BestBuyLimitPrice", "BestSellLimitPrice"].indexOf(name) >= 0) {
            spanText.title = "% " + ((100 * item[name] / CurrentStock.YesterdayPrice) - 100).toFixed(2);
        }
        td.appendChild(spanText);

        if (name != null && ["BestBuyLimitQuantity", "BestBuyLimitPrice", "BestSellLimitPrice", "BestSellLimitQuantity"].indexOf(name) >= 0)
            td.onclick = (function(_index, _name, _item) {
                return function() {
                    SendOrderApi.fillOrderByQueue(_index, _name, _item, stockQueue);
                }
            })(index, name, item);
        row.appendChild(td);
    }

    function SubScripbeStockQueue(nscCode) {
        var isinList = [(nscCode + "_lightrlc").toLowerCase()];
        var schema = [
            'BestBuyLimitPrice_1', 'BestSellLimitPrice_1', 'BestBuyLimitQuantity_1', 'BestSellLimitQuantity_1',
            'NumberOfOrdersAtBestBuy_1', 'NumberOfOrdersAtBestSell_1',
            'BestBuyLimitPrice_2', 'BestSellLimitPrice_2', 'BestBuyLimitQuantity_2', 'BestSellLimitQuantity_2',
            'NumberOfOrdersAtBestBuy_2', 'NumberOfOrdersAtBestSell_2',
            'BestBuyLimitPrice_3', 'BestSellLimitPrice_3', 'BestBuyLimitQuantity_3', 'BestSellLimitQuantity_3',
            'NumberOfOrdersAtBestBuy_3', 'NumberOfOrdersAtBestSell_3',
            'BestBuyLimitPrice_4', 'BestSellLimitPrice_4', 'BestBuyLimitQuantity_4', 'BestSellLimitQuantity_4',
            'NumberOfOrdersAtBestBuy_4', 'NumberOfOrdersAtBestSell_4',
            'BestBuyLimitPrice_5', 'BestSellLimitPrice_5', 'BestBuyLimitQuantity_5', 'BestSellLimitQuantity_5',
            'NumberOfOrdersAtBestBuy_5', 'NumberOfOrdersAtBestSell_5'
        ];

        subStockQueue = LsService.SimpleSubscribe(
            isinList,
            schema,
            StockQueueOnUpdate,
            subStockQueue
        );
    }

    function StockQueueOnUpdate(updateInfo) {
        updateInfo.forEachChangedField(function(name, pos, val) {
            try {
                if (val) {
                    val = parseInt(val);
                    var nameParts = name.split("_");
                    var paramName = nameParts[0];
                    var index = nameParts[1] - 1;
                    if (stockQueue[index]) {
                        stockQueue[index][paramName] = val;
                    }
                    var id = "#stockqueue_" + index + "_" + paramName + " span.txt";
                    var elem = document.querySelector(id);
                    var oldVal = +elem.innerHTML.replaceAll(",", "");
                    elem.innerHTML = (self.minimizeNums ? val.commaSeperateMinimize() : val.commaSeperate());
                    if (["BestBuyLimitPrice", "BestSellLimitPrice"].indexOf(paramName) >= 0) {
                        if (stockQueue[index][paramName])
                            elem.title = "% " + ((100 * stockQueue[index][paramName] / CurrentStock.YesterdayPrice) - 100).toFixed(2);
                        else
                            elem.title = "";
                    }
                    var pp = GlobalVar.pushPositveClass;
                    var pn = GlobalVar.pushNegativeClass;
                    if (!isNaN(oldVal) && pp != null && pp != "" && pn != null & pn != "") {
                        var classToAdd = oldVal < +val ? pp : (oldVal > +val ? pn : "");
                        var classToRemove = classToAdd == pp ? pn : (classToAdd == pn ? pp : "");

                        if (classToAdd != "" ) {
                            elem.parentElement.classList.add(classToAdd);
                            elem.parentElement.classList.remove(classToRemove);

                            function clearClass(cpp, cpn) {
                                if (self.timerClearClass[index] == null)
                                    self.timerClearClass[index] = {};

                                if (self.timerClearClass[index][paramName] != null) {
                                    clearTimeout(self.timerClearClass[index][paramName]);
                                    self.timerClearClass[index][paramName] = null;
                                }
                                self.timerClearClass[index][paramName] = setTimeout(function () {
                                        elem.parentElement.classList.remove(cpp);
                                        elem.parentElement.classList.remove(cpn);

                                        clearTimeout(self.timerClearClass[index][paramName]);
                                        self.timerClearClass[index][paramName] = null;
                                    },1500);
                            }

                            clearClass(pp,pn);
                        }
                    }

                    var tdCssclass = "";
                    if (paramName == "BestBuyLimitPrice")
                        tdCssclass = (!(min > 0 && max > 0)) || val >= min && val <= max ? "tp-co-2" : "tp-co-4";
                    else
                        if (paramName == "BestSellLimitPrice")
                            tdCssclass = (!(min > 0 && max > 0)) || val >= min && val <= max ? "tp-co-2" : "tp-co-4";

                    var td = document.getElementById("stockqueue_" + index + "_" + paramName);

                    if (td && tdCssclass != "") {
                        var buyOrSell = paramName.indexOf("Buy") >= 0 ? "Buy" : "Sell";

                        var tdClassToRemove = tdCssclass == "tp-co-2" ? "tp-co-4" : "tp-co-2";

                        var td1 = document.getElementById(`stockqueue_${index}_Best${buyOrSell}LimitPrice`);
                        td1.classList.remove(tdClassToRemove);
                        td1.classList.add(tdCssclass);

                        var td2 = document.getElementById(`stockqueue_${index}_Best${buyOrSell}LimitQuantity`);
                        td2.classList.remove(tdClassToRemove);
                        td2.classList.add(tdCssclass);

                        var td3 = document.getElementById(`stockqueue_${index}_NumberOfOrdersAtBest${buyOrSell}`);
                        td3.classList.remove(tdClassToRemove);
                        td3.classList.add(tdCssclass);

                    }

                    if (index == 0) {
                        if (SendOrderApi.bindBestSellPrice && paramName == "BestSellLimitPrice") {
                            SendOrderApi.SetOrderPrice(val.commaSeperate());
                        }
                        if (SendOrderApi.bindBestBuyPrice && paramName == "BestBuyLimitPrice") {
                            SendOrderApi.SetOrderPrice(val.commaSeperate());
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
        });
    }

};
;

var CustomerBalanceApi = {};

CustomerBalanceApi.refreshRemain = function () {

    var RemainLbl = $2(".customerBalance_Remain");
    var CreditLbl = $2(".customerBalance_Credit");
    var RealBalanceLbl = $2(".customerBalance_Real");
    var BlockedLbl = $2(".customerBalance_Blocked");
    var AccountLbl = $2(".customerBalance_Account");
    var DerivativeLbl = $2(".customerBalance_Derivative");
    var HamiBalance = $2(".customerHamiBalance_Credit");
    var MarginStatusLbl = $2(".customerBalance_MarginCustomerStatus");

    SiteServices.GetCustomerBalanceData(function (data) {
        if (data && data.Data) {
            RealBalanceLbl.text(utility.NumberColorFormat(data.Data.RealBalance));
            BlockedLbl.text(utility.NumberColorFormat(data.Data.BlockedBalance));
            AccountLbl.text(utility.NumberColorFormat(data.Data.AccountBalance));

            DerivativeLbl.text(utility.NumberColorFormat(data.Data.AccountBalance - (data.Data.Credit ? data.Data.Credit : 0)));

            RemainLbl.text(utility.NumberColorFormat(data.Data.RealBalance - data.Data.Credit));
            CreditLbl.text(utility.NumberColorFormat(data.Data.Credit));

            if (data.Data.HasHamiContract === 1) {
              HamiBalance.text(utility.NumberColorFormat(data.Data.HamiBalance));
            } else {
              document.getElementById('HamiBalanceRow').style.display = 'none';
            }


            var marginColor = data.Data.MarginCustomerStatus == 1 ? '#11bf06'
                : data.Data.MarginCustomerStatus == 2 ? '#fdf41e'
                : data.Data.MarginCustomerStatus == 3 ? '#f90909' : '#11bf06';

            if (window.IsOptionEnable) {
                $("#customerbalance_margincustomerstatus-bullet").css("color", marginColor);
                if (!isNaN(+data.Data.MarginCustomerStatus))
                    MarginStatusLbl.text(translate("MarginCustomerStatus_" + data.Data.MarginCustomerStatus));
            }

            setTimeout(function () {
                if (typeof SendOrderApi != "undefined" && SendOrderApi != null && SendOrderApi.setLblTotalBudget)
                        SendOrderApi.setLblTotalBudget(data.Data.AccountBalance);
                }, 2000);
        }
    });

    if (window.ThemeName == "mofid") {
        var customerRealBalanceHelp = $("#customerRealBalance-help");
        customerRealBalanceHelp.css("display", "inline-block");
        //customerRealBalanceHelp.attr("data-tip", translate("realbalancetitlemofid"));
        customerRealBalanceHelp.attr("title", translate("realbalancetitlemofid"));

    }
}
;

var moneyPaymentApi = {};

function MoneyPayment() {

    var bankList = [];

    SiteServices.GetPaymentOptions(function (data) {
        $("#MoneyPaymentOptions").text("");
        //data.Data = { Result: [{ PDate: "1379/10/05", Date: "2018-10-05", MaxValue: 8504000 },{ PDate: "1379/10/07", Date: "2018-10-06", MaxValue: 54000 }, { PDate: "1379/06/06", Date: "2018-06-06", MaxValue: 0 }] };
        if (data != null && data.Data != null && data.Data.Result != null) {
            for (var i = 0; i < data.Data.Result.length; i++) {
                var item = data.Data.Result[i];

                var li = document.createElement("li");
                var radio = document.createElement("input");
                var label = document.createElement("label");
                var span = document.createElement("span");
                radio.type = "radio";
                radio.name = "paymentOptions";
                radio.value = item.Date;
                radio.setAttribute("MaxValue", item.MaxValue);
                label.appendChild(radio);
                label.appendChild(span);
                if (item.MaxValue <= 0 && item.MaxValue !== -2) {
                    radio.disabled = "disabled";
                    span.innerHTML = item.PDate + " " + translate('PaymentImpossible');
                } else {
                    span.innerHTML =
                      `<span class='dt'>${item.PDate}</span><span class='vl' style='display:${
              item.MaxValue === -2 ? "None" : ""}'>${item.MaxValue.commaSeperate()} ${translate("rial")}</span>`;
                }
                if (item.MaxValue === -2) {
                    $("#maxvalue").style.display = 'none';
                    $("#date").innerHTML = "تاریخ فروش";
                }
                radio.onchange = function (e) {
                    var preVal = document.frmMoneyPayment.moneyPaymeny_receiptAmount.value;
                    if (preVal === "" || preVal === "0") {
                        document.frmMoneyPayment.moneyPaymeny_receiptAmount.value = this.getAttribute("MaxValue") !== "-2"
                          ? (this.getAttribute("MaxValue")).commaSeperate()
                          : "";
                    }
                };
                li.appendChild(label);
                li.onclick = function () {

                }
                $("#MoneyPaymentOptions").appendChild(li);
            }
        }
    });

    SiteServices.GetCustomerBankAccounts(function (data) {
        if (data && data.Data) {
            bankList = data.Data.Result.map(obj => ({ name: obj.AccountNumber + " نزد بانک " + obj.BankTitle, value: obj.Id }));
            utility.AppendOptionsToSelect($("#moneyPaymeny_bank"), bankList);
        }
    });

    moneyPaymentApi.submitFormMoneyPaymeny = function () {
        const param = {};


        if (document.frmMoneyPayment.paymentOptions) {
            param.DueDate = document.frmMoneyPayment.paymentOptions.value;
        } else {
            Notify({ text: translate("selectPaymentDate"), type: "error" });
            return false;
        }
        var ammount = document.frmMoneyPayment.moneyPaymeny_receiptAmount.value != null ? +(document.frmMoneyPayment.moneyPaymeny_receiptAmount.value.toString().replaceAll(",", "")) : 0;
        if (ammount > 0) {
            param.RequestAmount = ammount;
        } else {
            Notify({ text: translate("selectAmount"), type: "error" });
            return false;
        }

        if ([null, ""].indexOf(document.frmMoneyPayment.moneyPaymeny_bank.value) < 0) {
            param.BankAccountId = document.frmMoneyPayment.moneyPaymeny_bank.value;
        } else {
            Notify({ text: translate("selectBankAccount"), type: "error" });
            return false;
        }



        param.Description = document.frmMoneyPayment.moneyPaymeny_description.value;
        param.Tel = document.frmMoneyPayment.moneyPaymeny_phoneNumber.value;

        document.body.click();

        SiteServices.SendMoneyPaymentRequest(param,
            function (data) {
                if (data && data.IsSuccessfull) {
                    document.body.click();
                    Notify({ text: data.MessageDesc, type: "success" });
                } else {
                    Notify({ text: data.MessageDesc, type: "error" });
                }
            },
            function () {
                Notify({ text: data.MessageDesc, type: "error" });
            });
    }
}
;

var MoneyReceiptApi = {};

function MoneyReceipt() {
    var banlListSelect = $("#moneyPayment_BankList");
    var txtAmount = $("#moneyPayment_Amount");
    var selectReason = $("#PaymentForm_paymentreason");
    var PaymentForm_bank = $("#PaymentForm_bank");

    var bankListGateway = [];
    var bankListBroker = [];
    var paymentReasonList = [];

    if (IsAddFishDisable) {
        $("#lblAddFish").hide();
        $("#PaymentFormContainer").hide();
    }

    var rad = document.frmMoneyReceipt.myRadios;
    for (var i = 0; i < rad.length; i++) {
        rad[i].addEventListener('change', function () {
            $("#moneyPaymentContainer").hide();
            $("#PaymentFormContainer").hide();
            $("#" + this.value).show();
        });
    }
    rad[0].click();
    if (typeof (AMIB) != "undefined") {
        var objreceiptDate = new AMIB.persianCalendar('PaymentForm_receiptDate',
            {
                extraInputID: "PaymentForm_receiptDate_Hiden", extraInputFormat: "YYYY-MM-DD", onchange: function (date) {

                    $(".picker").onclicked(function (e) {
                        e.stopPropagation();
                        $(".picker").hide();
                    });
                }
            });
    }

    SiteServices.GetGatewayProviders(function (data) {

        bankListGateway = data.map(function (obj, i) {
            return {
                value: i,
                name: translate(obj.DestinationBankAccountName),
                providerId: obj.FinancialGatewayProvider
            };
        });

        utility.AppendOptionsToSelect(banlListSelect, bankListGateway);

    });

    SiteServices.GetMoneyReasonList(function (data) {
        if (data.IsSuccessfull) {
            paymentReasonList = data.Data.DataCollection.map((obj, i) => ({ name: obj, value: i }));
            utility.AppendOptionsToSelect(selectReason, paymentReasonList);
        } else {
            alert(data.MessageDesc);
        }
    });

    SiteServices.GetBrokerBankForDropDown(function (data) {
        if (data.IsSuccessfull) {
            bankListBroker = data.Data.map(obj => ({ name: obj.Text, value: obj.Value }));
            utility.AppendOptionsToSelect(PaymentForm_bank, bankListBroker);
        }
    });

    MoneyReceiptApi.submitMoneyTransferRequest = function () {
        var amount = txtAmount.numberVal();
        if (amount < 1000) {
            Notify({
                type: "warning",
                text: translate("PleaseSelectTheMoneyMoreThan1000")
            });
            alert("مقدار کمتر از 1000 ریال است");
        } else {
            SiteServices.BeginRequest(bankListGateway[banlListSelect.value].providerId, amount, window.location.hash);
            document.body.click();
        }
    };

    MoneyReceiptApi.submitPaymentForm = function () {
        const record = {
            Id: -1,
            Amount: document.frmMoneyReceipt.PaymentForm_receiptAmount.value,
            BankDocumentNumber: document.frmMoneyReceipt.PaymentForm_receiptID.value,
            BankInterfaceTransactionType: "1,TransactionType_Receipt_Manual_Bank",
            Description: document.frmMoneyReceipt.PaymentForm_paymentreason.value,
            EmergencyPhone: document.frmMoneyReceipt.PaymentForm_phoneNumber.value,
            AccountNumber: document.frmMoneyReceipt.PaymentForm_bank.value,
            PerformDate: document.frmMoneyReceipt.PaymentForm_receiptDate_Hiden.value
        };

        SiteServices.SaveMoneyReceipt(record, function (data) {
            if (data.IsSuccessfull) {
                document.body.click();
                Notify({ text: 'درخواست شما با موفقیت ثبت شد.', type: "success" });
            } else {
                Notify({ text: data.MessageDesc, type: "error" });
            }
        });
    };

    $(".txt-amount-transfer").keyuped(function () {
        var val = +this.value.replaceAll(",", "");
        var res = "";
        if (val) {
            var persianText = "";
            if (val > 10)
                persianText = NumToPersian(Math.floor(val / 10)) + " تومان";
            else
                persianText = val + " ریال";
            res = persianText;
        } else
            res = "";
        this.parentElement.parentElement.querySelector(".amount-persian-text").innerHTML = res;

    });

};
var SendOrderApi = {};

function SendOrderPartial(parentId) {
    var self = {};
    var editOrderId = 0;
    var currentIsin = null;
    var parentElemId = "#" + parentId + " ";
    self.AgreementStatus = { CustomerAgreementAccepted: false, IsSymbolCautionAgreement: false };
    self.btnSetMaxPrice = $(".btnSetMaxPrice");
    self.btnSetMinPrice = $(".btnSetMinPrice");
    self.btnSendOrder = $(parentElemId + "#send_order_btnSendOrder");
    self.btnCancelEdit = $(parentElemId + "#send_order_btnCancel");
    self.calcContainer = $(parentElemId + "#calculator");
    self.txtOrderCount = $(parentElemId + "#send_order_txtCount");
    self.txtOrderCountAll = $(".send_order_txtCount");
    self.txtOrderPrice = $(parentElemId + "#send_order_txtPrice");
    self.txtOrderPriceAll = $(".send_order_txtPrice");
    self.txtTotalBudget = $(parentElemId + "#calc_txtTotalBudget");
    self.txtCalcPrice = $(parentElemId + "#calc_txtPrice");
    self.btnLock = $(parentElemId + "#sendorder_LockBtn");
    self.selectAccountingProvider = $(parentElemId + "#sendorder_select_AccountingProvider");
    self.selectAccountingProviderContainer = $(parentElemId + "#sendorder-AccountingProvider");
    self.txtMaxShown = $(parentElemId + "#sendorder_txtMaxShown");
    self.txtMinimumQuantity = $(parentElemId + "#sendorder_txtMinimumQuantity");
    self.txtValidityDate = document.querySelector(parentElemId + "#sendorder_ValidityDate");
    self.txtValidityDate_Hiden = document.querySelector(parentElemId + "#sendorder_ValidityDate_Hiden");
    self.lblTotalBudget = $(parentElemId + ".lblTotalBudget");
    self.selectValidity = $(parentElemId + "#sendorder_select_OrderValidityType");
    self.chbxSplitOrder = $(parentElemId + "#sendOrder_chbxSplitOrder");
    self.lblAssetRemain = $2(".sendorder_lblRemainAsset");

    self.chbxAgreementContainer = $(parentElemId + "#sendorder_chbxAgreementContainer");
    self.chbxAgreement = $(parentElemId + "#sendorder_chbxAgreement");
    self.btnShowAgreementCu = $(parentElemId + "#sendorder_btnShowAgreement");

    self.chbxAgreementContainerSepah = $(parentElemId + "#sendorder_chbxAgreementContainer_sepah");
    self.chbxAgreementSepah = $(parentElemId + "#sendorder_chbxAgreement_sepah");
    self.btnShowAgreementSepah = $(parentElemId + "#sendorder_btnShowAgreement_sepah");

    self.lblBreakevenPrice = $2(parentElemId + "#sendorder_lblBreakevenPrice");
    self.lblCommission = $2(parentElemId + "#sendorder_lblCommission");
    self.lblTotalPrice = $2(parentElemId + "#sendorder_lblTotalPrice");
    self.datePickerContainer = $(parentElemId + "#sendorder_datePickerContainer");
    self.AdvIcon = $(parentElemId + ".icon-toggleAdvancedBox");
    self.AdvBox = $(parentElemId + ".order-advanced-box");
    self.divSymbolBondAmount = $(parentElemId + "#div-symbol-bond-amount");
    self.lblBondAmount = $2(parentElemId + "#sendorder_lblBond");
    self.calcIsOpen = false;
    self.ordeSideTabs = [];
    self.currentStock = {};
    self.orderSide = 65;
    self.btnLock.text(lockOpen);

    self.shortsellMainContainer = $(parentElemId + "#shortsell_main_container");
    self.shortsellContainer = $(parentElemId + "#shortsell_container");
    self.shortsellQueueItems = $(parentElemId + "#sendorder_select_shortsell_items");
    self.shortsellIsChecked = $(parentElemId + "#SendOrder_chbxShortSell");

    SendOrderApi = {
        bindBestSellPrice: false,
        bindBestBuyPrice: false,
        ChangeLock: function (side) {

            if (side == "Buy") {
                SendOrderApi.bindBestBuyPrice = !SendOrderApi.bindBestBuyPrice;
                SendOrderApi.bindBestSellPrice = false;
            } else {
                SendOrderApi.bindBestBuyPrice = false;
                SendOrderApi.bindBestSellPrice = !SendOrderApi.bindBestSellPrice;
            }

            var isLock = SendOrderApi.bindBestBuyPrice || SendOrderApi.bindBestSellPrice;

            self.btnLock.text(isLock ? lockClose : lockOpen);
            $("stock-queue .lock span").text(lockOpen);

            if (isLock) {
                self.txtOrderPrice.attr("disabled", "disabled");
                $("stock-queue .lock." + side + " span").text(lockClose);
                $(".send_order_txtPriceContainer").addClass("tp-bg-3");
            } else {
                self.txtOrderPrice.removeAttr("disabled");
                $(".send_order_txtPriceContainer").removeClass("tp-bg-3");

            }

        },
        SetOrderPrice: function (price) {
            self.txtOrderPrice.val(price.commaSeperate());
            self.txtCalcPrice.val(price.commaSeperate());
            setOrderExtraInfo();

        },
        setOrderForEdit: function (order) {
            ClearSendOrderForm();
            editOrderId = isNaN(order.orderid) ? 0 : +(order.orderid);
            self.txtOrderPrice.numberVal(order.orderprice);
            self.txtOrderCount.numberVal(order.remain != null ? order.remain : order.excuted);
            self.txtMinimumQuantity.numberVal(order.minimumquantity);
            self.txtMaxShown.numberVal(order.maxShow);
            self.selectAccountingProvider.val(order.Providerid);

            self.orderSide = order.ordersideid ? order.ordersideid : 65;
            tabOrderSideChange(self.orderSide);
            if (editOrderId > 0) {
                self.btnSendOrder.text("ویرایش");
                self.btnCancelEdit.show();
                self.selectAccountingProviderContainer.hide();
            } else {
                self.btnSendOrder.text(self.orderSide == 65 ? "خرید" : "فروش");
                self.btnCancelEdit.hide();
                self.selectAccountingProviderContainer.show();
            }
            if (order.maxShow > 0 || (order.ordervlid != null && order.ordervlid != 74)) {
                self.selectValidity.val(order.ordervlid);
                if (order.ordervlid == 68) {
                    self.txtValidityDate.value = order.gtdate;
                    self.txtValidityDate_Hiden.value = order.gtdateMiladi;
                    self.datePickerContainer.show();
                }
                this.openAdvancedBox();
            } else {
                this.closeAdvancedBox();
            }
            setOrderExtraInfo();
        },
        setSymbol: function (stock, _order, isFromRlc) {
            if (!isFromRlc)
                ClearSendOrderForm();
            self.currentStock = stock;
            currentIsin = self.currentStock.NSCCode;
            if (self.currentStock != null && self.currentStock.HighAllowedPrice != null) {
                self.btnSetMaxPrice.text(self.currentStock.HighAllowedPrice.commaSeperate());
                self.btnSetMinPrice.text(self.currentStock.LowAllowedPrice.commaSeperate());
            }
            self.lblAssetRemain.text("");
            SendOrderApi.refreshSymbolRemainCount(currentIsin, true);
            if (_order)
                SendOrderApi.setOrderForEdit(_order);

            self.AgreementStatus = { CustomerAgreementAccepted: false, IsSymbolCautionAgreement: stock.IsCautionAgreement };

            if (stock.IsCautionAgreement) {

                self.chbxAgreementContainer.show();

                SiteServices.CustomerSymbolCautionStatus(currentIsin,
                    function (data) {
                        try {
                            if (data.IsSuccessfull == true) {
                                self.AgreementStatus.CustomerAgreementAccepted = data.Data.CustomerAgreementAccepted;
                                self.chbxAgreement.checked = self.AgreementStatus.CustomerAgreementAccepted;
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    });
            }
            else
                self.chbxAgreementContainer.hide();

            if (stock.IsSepahAgreement) {
                self.chbxAgreementContainerSepah.show();
            }
            else
                self.chbxAgreementContainerSepah.hide();





            if (IsShortSellEnabled) {
                self.shortsellContainer.hide();
                self.clearShortSellConfigs();
                SiteServices.GetShortSellQueueItemsForSell(currentIsin)
                    .then(function (data) {

                        var symbols = data.map(function (p) {
                            return {
                                name: `${p.Volume} سهم قابل فروش تعهدی با نرخ تشویقی ${p.IncentivePercent
                                    } درصد - محل سرمایه گذاری ${(p.InvestmentPlaceType === 1
                                        ? 'سپرده بانکی'
                                        : 'صندوق سرمایه گذاری')}`,
                                value: `${p.IncentivePercent}|${p.InvestmentPlaceType}|${p.Volume}`
                            };
                        });
                        self.shortsellQueueItems.innerHTML = '';
                        utility.AppendOptionsToSelect(self.shortsellQueueItems, symbols, "name", "value");

                        if (symbols.length > 0 && self.orderSide == '86') {
                            self.shortsellContainer.show();
                            self.shortsellIsChecked.checked = false;
                        }
                    });
            }
        },
        refreshSymbolRemainCount: function (isin, isCallFromInside) {
            if (isCallFromInside || isin == currentIsin) {
                SiteServices.GetRemainAsset(isin,
                    function (data) {
                        if (data) {
                            var remainAsset = isNaN(+data.Data) ? 0 : +data.Data;
                            SendOrderApi.setLblAssetRemain(remainAsset, true);
                        }
                    });
            }
        },
        setLblTotalBudget: function (val) {
            self.lblTotalBudget.text(val.commaSeperate());
        },
        toggleAdvancedBox: function () {

            self.AdvBox.toggleShow();
            self.AdvIcon.toggle("tp-arrowdown");
            self.AdvIcon.toggle("tp-arrowup");
        },
        openAdvancedBox: function () {
            var advBox = $(".icon-toggleAdvancedBox");
            $(".order-advanced-box").show();
            advBox.removeClass("tp-arrowdown");
            advBox.addClass("tp-arrowup");
        },
        closeAdvancedBox: function () {
            var advBox = $(".icon-toggleAdvancedBox");
            $(".order-advanced-box").hide();
            advBox.addClass("tp-arrowdown");
            advBox.removeClass("tp-arrowup");
        },
        focusBuyPrice: function () {
            tabOrderSideChange(65);
        },
        focusSellPriceTxt: function () {
            tabOrderSideChange(86);
        },
        sendOrder: function () {
            self.btnSendOrder.click();
        },
        ContinueSendOrder: ContinueSendOrder,
        showConfirmModal: function () {
            document.getElementById("sendorder_confirmModal").style.display = "block";
        },
        hideConfirmModal: function () {
            document.getElementById("sendorder_confirmModal").style.display = "none";
        },
        setOrderCount: function (c) {
            self.txtOrderCount.val(c);
            setOrderExtraInfo();

        },
        setLblAssetRemain: function (remainAsset, isCallFromInside, isin) {
            if (isCallFromInside || isin == currentIsin)
                self.lblAssetRemain.text(remainAsset.commaSeperate());
        }
    };

    function unLock() {
        SendOrderApi.bindBestBuyPrice = SendOrderApi.bindBestSellPrice = false;
        self.btnLock.text(lockOpen);
        self.txtOrderPrice.removeAttr("disabled");
        var qLock = $("stock-queue .lock span");
        if (qLock != null && qLock.text != null)
            qLock.text(lockOpen);
        $(".send_order_txtPriceContainer").removeClass("tp-bg-3");

    }
    function lockClicked() {
        var isLock = SendOrderApi.bindBestBuyPrice || SendOrderApi.bindBestSellPrice;
        if (isLock) {
            unLock();
            $(".send_order_txtPriceContainer").removeClass("tp-bg-3");
        } else {
            var sideStr = self.orderSide == 65 ? "Sell" : "Buy";
            SendOrderApi.ChangeLock(sideStr);
            self.txtOrderPrice.val(StockQueueApi.GetBestOrder(sideStr));
            $(".send_order_txtPriceContainer").addClass("tp-bg-3");
            setOrderExtraInfo();
        }
    }
    self.btnLock.onclicked(function () {

        lockClicked();

    });

    initSendOrderForm();

    function ClearSendOrderForm() {
        editOrderId = 0;
        self.txtOrderPrice.val("");
        self.txtOrderCount.val("");
        self.txtTotalBudget.val("");
        self.txtCalcPrice.val("");

        unLock();

        self.btnSendOrder.text(self.orderSide == 65 ? "خرید" : "فروش");
        self.btnCancelEdit.hide();
        self.chbxAgreementContainer.hide();

        self.selectValidity.val(74);
        self.txtMaxShown.val("");
        self.txtValidityDate.value = "";
        self.txtValidityDate_Hiden.value = "";
        self.lblBreakevenPrice.text("");
        self.lblCommission.text("");
        self.lblTotalPrice.text("");
        self.divSymbolBondAmount.hide();
        self.datePickerContainer.hide();
        if (self.orderSide == 65)
            self.selectAccountingProviderContainer.show();
    }

    SendOrderApi.fillOrderByQueue = function (queuePosition, parameterName, value, queuedata) {
        var priceChanged = false;
        var _orderSide = parameterName.indexOf("Buy") >= 0 ? "Buy" : "Sell";
        var isLock = SendOrderApi.bindBestBuyPrice || SendOrderApi.bindBestSellPrice;
        if (isLock && (parameterName === "BestBuyLimitPrice" || parameterName === "BestSellLimitPrice")) {
            if (queuePosition == 0) {
                if (parameterName === "BestSellLimitPrice" && SendOrderApi.bindBestSellPrice) {
                    self.txtOrderPriceAll.val(value.BestSellLimitPrice.commaSeperate());
                    priceChanged = true;
                }
                if (parameterName === "BestBuyLimitPrice" && SendOrderApi.bindBestBuyPrice) {
                    self.txtOrderPriceAll.val(value.BestBuyLimitPrice.commaSeperate());
                    priceChanged = true;
                }

            }
            setOrderExtraInfo();
            return;
        }
        if (queuedata == null)
            return;
        switch (_orderSide) {
            case "Buy":
                if (parameterName === "BestBuyLimitQuantity") {
                    var sumBuyQuantity = 0;
                    for (var i = queuePosition; i >= 0; i--) {
                        sumBuyQuantity += queuedata[i].BestBuyLimitQuantity;
                    }
                    if (!isLock) {
                        self.txtOrderPriceAll.val(queuedata[queuePosition].BestBuyLimitPrice.commaSeperate());
                        priceChanged = true;
                    }

                    self.txtOrderCountAll.val(sumBuyQuantity.commaSeperate());

                } else if (parameterName === "BestBuyLimitPrice") {
                    self.txtOrderPriceAll.val(value.BestBuyLimitPrice.commaSeperate());
                    priceChanged = true;
                }
                break;
            case "Sell":
                if (parameterName === "BestSellLimitQuantity") {
                    var sumSellQuantity = 0;
                    for (var j = queuePosition; j >= 0; j--) {
                        sumSellQuantity += queuedata[j].BestSellLimitQuantity;
                    }
                    if (!isLock) {
                        self.txtOrderPriceAll.val(queuedata[queuePosition].BestSellLimitPrice.commaSeperate());
                        priceChanged = true;
                    }
                    self.txtOrderCountAll.val(sumSellQuantity.commaSeperate());

                } else if (parameterName === "BestSellLimitPrice") {
                    self.txtOrderPriceAll.val(value.BestSellLimitPrice.commaSeperate());
                    priceChanged = true;
                }
                break;
        }
        SendOrderApi.countFocus = true;

        if (self.calcIsOpen && priceChanged) {
            CalcCommissionAndCount();
        }
        setOrderExtraInfo();
    }

    function getHiddenPrice() {

        return new Promise(function (resolve, reject) {
            if (self.symbolHiddenPrice && self.symbolHiddenPrice[currentIsin.toLowerCase()]) {
                resolve(self.symbolHiddenPrice[currentIsin.toLowerCase()]);
            }
            if (currentIsin.toLowerCase().startsWith("irr")) {
                SiteServices.GetSymbolHiddenPrice(currentIsin,
                    function (data) {
                        if (data != null && data > 0) {
                            if (!self.symbolHiddenPrice) {
                                self.symbolHiddenPrice = {};
                            }
                            self.symbolHiddenPrice[currentIsin.toLowerCase()] = data;
                            resolve(data);
                        }
                        else {
                            resolve(0);
                        }
                    });
            }
            resolve(0);
        });

    }

    function setOrderExtraInfo() {
        var count = self.txtOrderCount.numberVal();
        var orderPrice = self.txtOrderPrice.numberVal();

        if (orderPrice !== 0 && count !== 0 && currentIsin !== "") {

            var hiddenPrice = getHiddenPrice().then(function (hp) {
                var orderValues = commissionService.calculateTotalcommission((orderPrice + hp) * (self.currentStock.IsOption || self.currentStock.IsAti ? self.currentStock.CSize : 1), count, currentIsin, self.orderSide);

                self.lblBreakevenPrice.text(Math.ceil(orderValues.breakevenPrice / (self.currentStock.IsOption || self.currentStock.IsAti ? self.currentStock.CSize : 1)).commaSeperate());
                self.lblCommission.text(Math.ceil(orderValues.commission).commaSeperate());
                self.lblTotalPrice.text(Math.ceil(orderValues.totalPrice).commaSeperate());
                SiteServices.GetSymbolBond(currentIsin, function (data) {
                    if (data != null && data > 0) {
                        self.divSymbolBondAmount.show();
                        var bondAmount = data * count;
                        self.lblBondAmount.text(bondAmount.commaSeperate());
                        self.lblTotalPrice.text(Math.ceil(orderValues.totalPrice + bondAmount).commaSeperate());
                    }
                });
            });

        }
        if (orderPrice < self.currentStock.LowAllowedPrice || orderPrice > self.currentStock.HighAllowedPrice) {
            $(".send_order_txtPriceContainer").addClass("invalid-value");
        }
        else
            $(".send_order_txtPriceContainer").removeClass("invalid-value");
    }

    function CalcCommissionAndCount(forcedCount) {
        getHiddenPrice().then(function (hp) {
            var karmozd = commissionService.calcCountAndNewCommission(
                currentIsin,
                self.orderSide,
                self.txtTotalBudget.numberVal(),
                (self.txtCalcPrice.numberVal() + hp),
                forcedCount);

            var totalCommission = karmozd.TotalBrokerKarmozd + karmozd.TotalBourseKarmozd;
            var commission = karmozd.TotalBrokerKarmozd + karmozd.TotalBourseKarmozd;
            var totalPrice = (karmozd.Count * self.txtOrderPrice.numberVal()) + ((self.orderSide == 86 ? -1 : 1) * commission);

            self.txtOrderCount.val(karmozd.Count.commaSeperate());

            $(parentElemId + "#calc_lblTotalCommission").text(totalCommission.commaSeperate());
        });


    }

    function SubmitOrder(order, callback, errorCalback) {
        SiteServices.SubmitOrder(order, callback, errorCalback);
    }

    function checkPercentOfMaxShow(order, count) {
        if (order.maxShow > 0) {
            if (order.maxShow < 1000 || order.maxShow < count * 30 / 100) {
                Notify({
                    type: "error",
                    text: translate("RequireMinimum30PercentForMaxShow")
                });
                return false;
            }
        }
        return true;
    }

    document.addEventListener("click", function (e) {
        self.calcContainer.hide();
        self.calcIsOpen = false;
    }, false);

    self.btnSendOrder.onclicked(function () {

        var isin = self.currentStock.Isin != null
            ? self.currentStock.Isin
            : (self.currentStock.NSCCode != null ? self.currentStock.NSCCode : "");
        var price = self.txtOrderPrice.numberVal();
        var count = self.txtOrderCount.numberVal();
        var validity = +self.selectValidity.val();
        var OrderValiditydate = null;

        /// ShortSell
        var shortSellIsEnabled = self.shortsellIsChecked.checked;
        var shortSellIncentivePercent = +self.shortsellQueueItems.val().split('|')[0];
        var shortSellInvestmentPlaceType = self.shortsellQueueItems.val().split('|')[1];
        var shortSellMaxVolume = +self.shortsellQueueItems.val().split('|')[2];

        if (self.AgreementStatus && self.AgreementStatus.IsSymbolCautionAgreement == true && self.chbxAgreement.checked != true) {
            Notify({ type: 'error', text: translate("PleaseTickCautionAgreement") });
            return false;
        }

        if (self.currentStock.IsSepahAgreement == true && self.chbxAgreementSepah.checked != true) {
            Notify({ type: 'error', text: translate("PleaseTickSepahAgreement") });
            return false;
        }

        if (isin == null || isin == "") {
            Notify({
                type: "error",
                text: "لطفا نماد را مشخص نمایید"
            });
            return false;
        }
        if (isNaN(count) || count <= 0) {
            Notify({
                type: "error",
                text: "لطفا تعداد را مشخص نمایید"
            });
            return false;
        }
        if (isNaN(price) || price <= 0) {
            Notify({
                type: "error",
                text: "لطفا قیمت را مشخص نمایید"
            });
            return false;
        }

        if (validity == 68) {
            OrderValiditydate = self.txtValidityDate_Hiden.value;
            if (OrderValiditydate == null || OrderValiditydate == "") {
                Notify({
                    type: "error",
                    text: "لطفا تاریخ اعتبار را وارد نمایید"
                });
                return false;
            }
        }

        if (shortSellIsEnabled) {

            if (validity !== 69) {
                Notify({
                    type: "error",
                    text: "اعتبار فروش تعهدی فقط باید 'انجام و حذف' باشد"
                });
                return false;
            }

            if (count > shortSellMaxVolume) {
                Notify({
                    type: "error",
                    text: "تعداد سفارش بیش از تعداد سهم قابل فروش تعهدی است"
                });
                return false;
            }
        }

        var order = {
            IsSymbolCautionAgreement: self.AgreementStatus.IsSymbolCautionAgreement,
            CautionAgreementSelected: (self.chbxAgreement && self.chbxAgreement.checked) || false,
            IsSymbolSepahAgreement: self.currentStock.IsSepahAgreement,
            SepahAgreementSelected: (self.chbxAgreementSepah && self.chbxAgreementSepah.checked) || false,
            orderCount: count,
            orderPrice: price,
            FinancialProviderId: +self.selectAccountingProvider.val(),
            minimumQuantity: self.txtMinimumQuantity.val(),
            maxShow: self.txtMaxShown.numberVal(),
            orderId: editOrderId,
            isin: isin,
            orderSide: self.orderSide,
            orderValidity: validity,
            orderValiditydate: OrderValiditydate,
            shortSellIsEnabled: shortSellIsEnabled,
            shortSellIncentivePercent: shortSellIncentivePercent,
            shortSellInvestmentPlaceType: shortSellInvestmentPlaceType
        };

        if (!GlobalVar.onlineplus_settings.DontShowOrderConfirm) {
            ShowConfirmOrderModal(order);
        }
        else
            ContinueSendOrder(order);

    });

    self.btnCancelEdit.onclicked(function () {
        ClearSendOrderForm();
    });

    self.lblTotalBudget.onclicked(function () {
        self.txtTotalBudget.val(this.text().trim());
        CalcCommissionAndCount();
        setOrderExtraInfo();
    });

    $(parentElemId + "#sendorder_btnToggleCalc").onclicked(function (e) {
        self.calcContainer.toggleShow();
        e.stopPropagation();
        self.calcIsOpen = !self.calcIsOpen;
    });

    self.calcContainer.onclicked(function (e) {
        e.stopPropagation();
    });

    self.txtOrderCount.keyuped(function () {
        setOrderExtraInfo();
    });

    self.txtOrderPrice.keyuped(function () {
        setOrderExtraInfo();

    });

    self.txtTotalBudget.keyuped(function () {
        CalcCommissionAndCount();
        setOrderExtraInfo();
    });

    self.txtCalcPrice.keyuped(function () {
        self.txtOrderPrice.val(this.numberVal().commaSeperate());
        CalcCommissionAndCount();
        setOrderExtraInfo();
    });


    self.btnShowAgreementCu.onclicked(function (e) {
        if (self.CautionAgreement == null)
            SiteServices.GetCautionAgreement(function (data) {
                self.CautionAgreement = data.Data;
                modalUtility.showInfoModal(self.CautionAgreement.AgreementTitle, self.CautionAgreement.AgreementText);
            });
        else
            modalUtility.showInfoModal(self.CautionAgreement.AgreementTitle, self.CautionAgreement.AgreementText);

    });

    self.btnShowAgreementSepah.onclicked(function (e) {
        modalUtility.showInfoModal(translate("sepahagreementtitle"), translate("sepahagreementtext"));
    });

    document.getElementById("sendorder_DontShowOrderConfirm").onclick = function () {
        var DontShowOrderConfirm = this.checked;
        GlobalVar.onlineplus_settings.DontShowOrderConfirm = DontShowOrderConfirm;
        SiteServices.SaveUserSetting(onlineplus_settingsName, GlobalVar.onlineplus_settings, function (data) { });
    }

    function tabOrderSideChange(side) {
        $(parentElemId + ".ordertabs").removeClass("active");
        $(parentElemId + ".orderside" + side).addClass("active");
        self.orderSide = side;
        $(parentElemId + "#sendorder-container").removeClass("order-side-86");
        $(parentElemId + "#sendorder-container").removeClass("order-side-65");
        $(parentElemId + "#sendorder-container").addClass("order-side-" + self.orderSide);

        if (self.orderSide == 65) {
            self.btnSendOrder.text("خرید");
            self.btnSendOrder.removeClass("tp-3d-bu-re");
            self.btnSendOrder.addClass("tp-3d-bu-gr");
            self.selectAccountingProviderContainer.show();
            self.shortsellMainContainer.hide();
        } else {
            self.btnSendOrder.text("فروش");
            self.btnSendOrder.removeClass("tp-3d-bu-gr");
            self.btnSendOrder.addClass("tp-3d-bu-re");
            self.selectAccountingProviderContainer.hide();
            self.shortsellMainContainer.show();
        }

        setOrderExtraInfo();
    }

    function ContinueSendOrder(order) {

        if (self.chbxSplitOrder.checked && self.currentStock.MaxQOrder != null && order.orderCount > self.currentStock.MaxQOrder) {
            var orders = [];
            var SendCount = Math.floor(order.orderCount / self.currentStock.MaxQOrder);
            var remainAfterDivision = order.orderCount % self.currentStock.MaxQOrder;
            var tempOrder = utility.clone(order);
            tempOrder.orderCount = self.currentStock.MaxQOrder;
            var isValidMaxShown = checkPercentOfMaxShow(order, tempOrder.orderCount);
            if (isValidMaxShown) {
                for (var i = 0; i < SendCount; i++) {
                    orders.push(tempOrder);
                }
            } else {
                return;
            }
            if (remainAfterDivision > 0) {
                var tempOrder2 = utility.clone(order);
                tempOrder2.orderCount = remainAfterDivision;
                orders.push(tempOrder2);
            }
            SiteServices.SendMultipleOrders(orders, sendOrderCalback, sendorderCallbackError);

        }
        else if (order.orderCount > self.currentStock.MaxQOrder) {
            Notify({
                text: translate("MaxOrderQuantityError").format(self.currentStock.MaxQOrder.commaSeperate()),
                type: "error"
            });
            self.AdvBox.show();
        } else {
            var isValidMaxShwn = checkPercentOfMaxShow(order, order.orderCount);
            if (isValidMaxShwn)
                SubmitOrder(order, sendOrderCalback, sendorderCallbackError);
        }
        function sendOrderCalback(res) {
            if (res.IsSuccessfull) {
                //Notify({ type: "info", text: translate("ارسال سفارش انجام شد") });
                if (!window.GlobalVar.onlineplus_settings.keepFieldsAfterSubmit ||
                    order.orderid > 0 ||
                    order.orderId > 0)
                    ClearSendOrderForm();
            } else {
                var errorCode = 'OrdersubmissionError';
                if (res.MessageCode) {
                    errorCode = res.MessageCode;
                }

                Notify({ type: "error", text: translate(errorCode) });
            }
        }
        function sendorderCallbackError() {
            Notify({ type: "error", text: translate("ErrorinOperation") });
        }
    }

    function ContinueSendOrderNew(order) {

        if (self.chbxSplitOrder.checked &&
            self.currentStock.MaxQOrder != null &&
            order.orderCount > self.currentStock.MaxQOrder) {

            var isValidTimeToSplit = marketUtility.CheckMultiOrderTimeLimit();
            if (!isValidTimeToSplit) {
                var _CheckTime = window.CheckOperationPerSecondTimeSpan;
                Notify({
                    text: "بازه زمانی استفاده از تقسیم سفارشات، بعد از " + _CheckTime + " میباشد!",
                    type: "error"
                });
                return false;
            }

            var SendCount = Math.floor(order.orderCount / self.currentStock.MaxQOrder);
            var remainAfterDivision = order.orderCount % self.currentStock.MaxQOrder;

            var timeSpaceDefault = window.OrderLatencyClient;
            var timeSpaceBulk = window.OrderLatencyInEachSequence;
            var OrderCountInEachSequence = window.OrderCountInEachSequence;

            var timeSpace = timeSpaceDefault;

            var sentCount = 0;
            var sendOrderInterval = function () {
                if (OrderCountInEachSequence > 0 && sentCount >= OrderCountInEachSequence) {
                    console.log("sentCount:" + sentCount);
                    sentCount = 0;
                    timeSpace = timeSpaceBulk;
                    console.log("timeSpace:" + timeSpace);
                } else {
                    timeSpace = timeSpaceDefault;
                }
                if (SendCount > 0) {

                    var tempOrder = utility.clone(order);
                    tempOrder.orderCount = self.currentStock.MaxQOrder;

                    var isValidMaxShown = checkPercentOfMaxShow(order, tempOrder.orderCount);
                    if (isValidMaxShown) {
                        console.log(new Date().getMilliseconds());
                        SubmitOrder(tempOrder);
                        sentCount++;
                        setTimeout(sendOrderInterval, timeSpace);
                    }

                } else {
                    if (SendCount <= 0) {
                        if (remainAfterDivision > 0) {
                            var tempOrder2 = utility.clone(order);
                            tempOrder2.orderCount = remainAfterDivision;
                            console.log(new Date().getMilliseconds());
                            SubmitOrder(tempOrder2);
                            sentCount++;
                        }
                    }
                }
                SendCount = SendCount - 1;

            };
            sendOrderInterval();

        } else if (order.orderCount > self.currentStock.MaxQOrder) {
            Notify({
                text: translate("MaxOrderQuantityError").format(self.currentStock.MaxQOrder.commaSeperate()),
                type: "error"
            });
            self.AdvBox.show();
        } else {
            var isValidMaxShwn = checkPercentOfMaxShow(order, order.orderCount);
            if (isValidMaxShwn)
                SubmitOrder(order,
                    function (res) {
                        if (res.IsSuccessfull) {
                            Notify({ type: "info", text: translate("ارسال سفارش انجام شد") });
                            if (!window.GlobalVar.onlineplus_settings.keepFieldsAfterSubmit ||
                                order.orderid > 0 ||
                                order.orderId > 0)
                                ClearSendOrderForm();
                        } else {
                            var errorCode = 'OrdersubmissionError';
                            if (res.MessageCode) {
                                errorCode = res.MessageCode;
                            }

                            Notify({ type: "error", text: translate(errorCode) });
                        }
                    },
                    function () {
                        Notify({ type: "error", text: translate("ErrorinOperation") });
                    });
        }
    }

    function initSendOrderForm() {
        self.ordeSideTabs = $(parentElemId + " .ordertabs");

        self.ordeSideTabs.onclicked(function () {
            if (editOrderId <= 0) {
                tabOrderSideChange(this.getAttribute("orderside"));
            }
        });

        tabOrderSideChange(65);
        self.ordeSideTabs[0].classList.add("active");


        SiteServices.GetAccountingProviders(true, function (data) {
            utility.AppendOptionsToSelect(self.selectAccountingProvider, data, "Title", "Value");
            self.selectAccountingProvider.val(data[0].Value);
        });

        utility.AppendOptionsToSelect(self.selectValidity, orderValidities, "name", "value");

        self.selectValidity.val(orderValidities[0].value);
        self.selectValidity.onchange(function () {
            if (+self.selectValidity.val() == 68)
                self.datePickerContainer.show();
            else
                self.datePickerContainer.hide();
        });


        self.btnSetMaxPrice.onclicked(function () {
            self.txtOrderPrice.val(self.currentStock.HighAllowedPrice.commaSeperate());
            self.txtCalcPrice.val(self.currentStock.HighAllowedPrice.commaSeperate());
            if (self.calcIsOpen) {
                CalcCommissionAndCount();
            }
            setOrderExtraInfo();
        });

        self.btnSetMinPrice.onclicked(function () {
            self.txtOrderPrice.val(self.currentStock.LowAllowedPrice.commaSeperate());
            self.txtCalcPrice.val(self.currentStock.LowAllowedPrice.commaSeperate());
            if (self.calcIsOpen) {
                CalcCommissionAndCount();
            }
            setOrderExtraInfo();
        });

        var objValidityDate = new AMIB.persianCalendar("sendorder_ValidityDate", { extraInputID: "sendorder_ValidityDate_Hiden", extraInputFormat: "YYYY-MM-DD" });
    }

    function ShowConfirmOrderModal(order) {
        SendOrderApi.showConfirmModal();

        document.getElementById("sendorder_ModalConfirm_btnSendOrder").onclick = function (e) {
            ContinueSendOrder(order);
            SendOrderApi.hideConfirmModal();
        };

        if (order != null) {
            document.getElementById("sendorder_modal_orderside").innerHTML = order.orderSide == 65 ? "خرید" : "فروش";
            document.getElementById("sendorder_modal_symbol").innerHTML = self.currentStock.Symbol;
            document.getElementById("sendorder_modal_valume").innerHTML = order.orderCount.commaSeperate();
            document.getElementById("sendorder_modal_price").innerHTML = order.orderPrice.commaSeperate();
            document.getElementById("sendorder_modal_accountType").innerHTML = AccountingProviders.find(a => a.Value == order.FinancialProviderId).Title;
        }
    }

    self.shortsellIsChecked.onchange = function () {
        self.updateShortSellConfigs(self.shortsellIsChecked.checked);
    };

    self.updateShortSellConfigs = function (shortSellIsEnabled) {
        if (shortSellIsEnabled) {
            self.shortsellQueueItems.show();
            self.selectValidity.val(69); // Locked on Kill & Fill
            self.selectValidity.disable();
            self.selectValidity.css('background-color', 'lightgray');
        } else {
            self.shortsellQueueItems.hide();
            self.selectValidity.enable();
            self.selectValidity.css('background-color', '');
        }
    };

    self.clearShortSellConfigs = function () {
        self.shortsellIsChecked.checked = false;
        self.shortsellQueueItems.innerHTML = '';
        self.updateShortSellConfigs(false);
    };
}

function SendOrderSlider() {
    Queue("#queueSlider");
};
var changeBrokerApi = {};

function ChangeBroker() {
    var currentSymbol = "";

    symbolApiChnageBroker.clear();
    document.frmChangeBroker.Description.value = "";
    document.frmChangeBroker.CertificateNumber.value = "";

    changeBrokerApi.ChangeBrokerTypeChanged = function () {
        document.getElementById("CertificateNumber_Row").style.display = +document.frmChangeBroker.ChangeBrokerType.value == 2 ? 'none' : 'inline-block';
    };
    changeBrokerApi.setSymbol = function (isin) {
        currentSymbol = isin;
    };
    changeBrokerApi.submitFrmChangeBroker = function () {
        if (!currentSymbol) {
            Notify({ text: 'نماد را انتخاب نمایید', type: 'error' });
            return false;
        }
        var ChangeBrokerType = +document.frmChangeBroker.ChangeBrokerType.value;
        if (isNaN(ChangeBrokerType) || ChangeBrokerType <= 0) {
            Notify({ text: 'نوع تغییر کارگزار را انتخاب نمایید.', type: 'error' });
            return false;
        }
        if (ChangeBrokerType == 2 && (document.frmChangeBroker.CertificateNumber === "" || document.frmChangeBroker.CertificateNumber == 0)) {
            Notify({ text: 'شماره گواهی نامه را وارد نمایید .', type: 'error' });
            return false;
        }
        var param = {
            ChangeBrokerType: document.frmChangeBroker.ChangeBrokerType.value,
            CertificateNumber: document.frmChangeBroker.CertificateNumber.value,
            Description: document.frmChangeBroker.Description.value,
            SymbolIsin: currentSymbol
        };
        SiteServices.SendChangeBrokerRequest(param, function (data) {
            if (data.IsSuccessfull) {
                document.body.click();
                Notify({ text: 'درخواست شما با موفقیت ثبت شد', type: 'success' });
            } else {
                Notify({ text: data.MessageDesc, type: 'error' });
            }
        }, function (data) {
            Notify({ text: data.MessageDesc, type: 'error' });
        });

        return true;
    }
}

window.addEventListener('DOMContentLoaded',function() {
    document.getElementById("frmChangeBroker").addEventListener("click",
        function(e) {
            e.stopPropagation();
        });
});
;
