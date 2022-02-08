var manifestData = chrome.runtime.getManifest();
var ExtensionVersion = manifestData.version;
var bingUrl = "https://www.bing.com/";
var defaultPC = "U523";
var chromeWS = "https://chrome.google.com/";
var browserDefaultsUrl = "https://browserdefaults.microsoft.com/";

var FeedbackFwlink = "https://go.microsoft.com/fwlink/?linkid=2138838";
var ExtnLanguage = chrome.i18n.getMessage("ExtnLanguage");
var ExtensionId = chrome.runtime.id;
var MachineID = (localStorage.MachineID == undefined || localStorage.MachineID == "" || localStorage.MachineID == null) ? guid() : localStorage.MachineID;

//To redirect feedback page while uninstalling the extension
var uninstallUrl = FeedbackFwlink + "&extnID=" + ExtensionId +"&mkt=" + ExtnLanguage + "&mid=" + MachineID + "&br=gc";
chrome.runtime.setUninstallURL(uninstallUrl);

//Sets '_DPC' & '_NTPC' session cookie in bing.com domain whenever background.js gets executed
setTimeout(function () {
    var _dpc = localStorage["_dpc"];
    if (_dpc != undefined && _dpc != "" && _dpc != null) {
        chrome.cookies.set({ url: bingUrl, domain: '.bing.com', name: '_DPC', value: _dpc }, function (cookie) {
        });
    }
	
	chrome.cookies.set({ url: bingUrl, domain: '.bing.com', name: '_NTPC', value: defaultPC }, function (cookie) {
    });
}, 500);

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == 'install') {
        //Sets the default pc of the extension in local storage
        localStorage["pc"] = defaultPC;

        var strChannel = "organic";
        var strDPC = "organic";

        if (!localStorage["channel"]) {
            chrome.cookies.get({ url: browserDefaultsUrl, name: 'channel' }, function (cookie) {
                // Fetching channel cookie value, store it in localStorage and clear the Channel cookie in browserdefaults.microsoft.com
                if (cookie) {
                    strChannel = cookie.value;
                    strDPC = cookie.value;
                    chrome.cookies.remove({ url: browserDefaultsUrl, name: 'channel' });
                }
            });
        }

        // Fetching PC cookie value from browserdefaults.microsoft.com, store it in localStorage and clear the PC cookie in browserdefaults.microsoft.com
        chrome.cookies.get({ url: browserDefaultsUrl, name: 'pc' }, function (cookie) {
            if (cookie) {
                strDPC = cookie.value + "_" + strChannel;
                chrome.cookies.remove({ url: browserDefaultsUrl, name: 'pc' });
            }
        });

        // Fetching  __utmz cookie value from https://chrome.google.com/
        chrome.cookies.get({ url: chromeWS, name: '__utmz' }, function (cookie) {

            if (cookie) {
                var chromeWSChannel = getChromeWSChannel(cookie.value);
                if (chromeWSChannel != "") {
                    strChannel = chromeWSChannel;
                    strDPC = chromeWSChannel;
                }
                chrome.cookies.remove({ url: chromeWS, name: '__utmz' });
            }
        });


        setTimeout(function () {
            // Setting Channel and DPC value in Local storage
            localStorage["channel"] = strChannel;
            localStorage["_dpc"] = strDPC;
            chrome.cookies.set({ url: bingUrl, domain: '.bing.com', name: '_DPC', value: localStorage["_dpc"] }, function (cookie) {
            });

            //Call for Install Ping
            SendPingDetails("1");

        }, 200);


        setTimeout(function () {
            var redirectionURL = "https://go.microsoft.com/fwlink/?linkid=2128904&trackingid=" + chrome.runtime.id + "&partnercode=" + defaultPC + "&browser=gc";
            if (localStorage["channel"] != undefined && localStorage["channel"] != "" && localStorage["channel"] != null) {
                redirectionURL += "&channel=" + localStorage["channel"];
            }
            chrome.tabs.create({ url: redirectionURL });
        }, 300);
    }
    else if (details.reason == 'update') {
		
		localStorage["ChangeItback"] = "False";
        //For existing users, if the 'pc' is available in localStorage and the same is not the default one, 
        //store the value under '_dpc' localStorage and replace the 'pc' localStorage with the default one
        if (localStorage["pc"] != defaultPC) {
            localStorage["_dpc"] = localStorage["pc"];
            localStorage["pc"] = defaultPC;
        }


        // Update the Channel details in DPC Values
        if (!localStorage["channel"]) {
            localStorage["channel"] = "organic";
        }

        if (!localStorage["_dpc"]) {
            localStorage["_dpc"] = localStorage["channel"];
        }
        else {

            if (localStorage["_dpc"].indexOf('_') === -1 && localStorage["_dpc"] !== localStorage["channel"]) {
                localStorage["_dpc"] = localStorage["_dpc"] + "_" + localStorage["channel"];
            }
            else {
                // Nothing to udpate 
            }
        }

        setTimeout(function () {
            //Call for Update Ping
            SendPingDetails("3");
        }, 300);
    }

});

chrome.tabs.onActivated.addListener(function () {
    var PingDate = "PingDate";
    if (localStorage.PingDate == "" || localStorage.PingDate != new Date().toDateString()) {
        //Call for Update Ping
        SendPingDetails("2");
        localStorage[PingDate] = new Date().toDateString()
    }
});

/* Function to create an unique machine id */
function guid() {
    var MI = "MachineID";
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    var MachineGUID = s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
    MachineGUID = MachineGUID.toLocaleUpperCase();
    localStorage[MI] = MachineGUID;
    return MachineGUID;
}


function SendPingDetails(status) {

    var startIndex = navigator.userAgent.indexOf("(");
    var endIndex = navigator.userAgent.indexOf(")");
    var OS = navigator.userAgent.substring(startIndex + 1, endIndex).replace(/\s/g, '');

    var browserLanguage = navigator.language;

    var ExtensionName = manifestData.name.replace(/ /g, "").replace('&', 'and');

    var BrowserVersion = navigator.userAgent.substr(navigator.userAgent.indexOf("Chrome")).split(" ")[0].replace("/", "");

    var MUID = "";
    chrome.cookies.get({ url: bingUrl, name: 'MUID' }, function (cookie) {
        if (cookie && cookie.value != "" && cookie.value != null) {
            MUID = cookie.value;
        }
    });

    setTimeout(function () {
        var pc = localStorage.pc == undefined || localStorage.pc == "" || localStorage.pc == null ? "UWDF" : localStorage.pc;
        var pingURL = 'http://g.ceipmsn.com/8SE/44?';
        var tVData = 'TV=is' + pc + '|pk' + ExtensionName + '|tm' + browserLanguage + '|bv' + BrowserVersion + '|ex' + ExtensionId + '|es' + status;
        if (MUID != "")
            tVData = tVData + "|mu" + MUID;
        if (localStorage["channel"])
            tVData = tVData + "|ch" + localStorage["channel"];
        if (localStorage["_dpc"])
            tVData = tVData + "|dp" + localStorage["_dpc"];
        pingURL = pingURL + 'MI=' + MachineID + '&LV=' + ExtensionVersion + '&OS=' + OS + '&TE=37&' + tVData;
        pingURL = encodeURI(pingURL);  // For HTML Encoding
        var xhr = new XMLHttpRequest();
        xhr.open("GET", pingURL, true);
        xhr.send();
    }, 500);
};

function getChromeWSChannel(cookieValue) {

    // Sample Chrome Webstore PaidAds cookie Value: 73091649.1608191832.10.6.utmcsr=bgads|utmccn=rwdsus|utmcmd=(not%20set)
	//Cookie value: 73091649.1614306380.141.5.utmcsr=bgads|utmccn=rwdsus|utmcmd=rwdmed|utmcct=rwdcon
	//DPC: source_medium_campaign_content (bgads_rwdmed_rwdsus_rwdcon)
    var strSource = "";
    var strCampaign = "";
	var strMedium = "";
	var strContent = "";
    var strWSChannel = "";
    var splitStr = cookieValue.split(".");

    if (splitStr[splitStr.length - 1] != "") {
        var utmValues = splitStr[splitStr.length - 1].split("|");

        for (i = 0; i < utmValues.length; i++) {
            var utmValue = utmValues[i].split("=");
            if (utmValue[0] == "utmcsr") {
                strSource = utmValue[1];
            }
            else if (utmValue[0] == "utmccn") {
                strCampaign = utmValue[1];
            }
			 else if (utmValue[0] == "utmcmd") {
                strMedium = utmValue[1];
            }
			 else if (utmValue[0] == "utmcct") {
                strContent = utmValue[1];
            }
        }

        if (strSource == "bgads") {
			
            strWSChannel = strSource;
			
			if (strMedium != "(not%20set)" && strMedium != "(direct)" && strMedium != "(organic)") {
				strWSChannel = strWSChannel + "_" + strMedium ;
            }
			
            if (strCampaign != "(not%20set)" && strCampaign != "(direct)" && strCampaign != "(organic)") {
				strWSChannel = strWSChannel  + "_" + strCampaign ;
            }
			
			 if (strContent != "(not%20set)" && strContent != "(direct)" && strContent != "(organic)" && strContent !="") {
				strWSChannel = strWSChannel + "_" + strContent;
            }
        }

        return strWSChannel;
    }
}

chrome.runtime.onMessage.addListener(function (msg) {
	if (msg == "setMachineID") {
		chrome.cookies.set({ url: browserDefaultsUrl, domain: '.browserdefaults.microsoft.com', name: 'MachineID', value: localStorage["MachineID"], sameSite: 'no_restriction', secure: true }, function (cookie) {

        });
	}
});
