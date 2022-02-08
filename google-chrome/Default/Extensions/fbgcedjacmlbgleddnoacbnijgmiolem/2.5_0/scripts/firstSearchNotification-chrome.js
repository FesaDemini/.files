// First Search Notification - only show on first address bar search

var promptMarket = chrome.i18n.getMessage("ExtnLanguage");
var browserLanguage = (navigator.language || navigator.userLanguage).toLowerCase();
var pc = "U523";
var formCode = "U523DF";

function firstSearchNotification(tabId, changeInfo) {
    if (changeInfo.url) {
        var isBingExtensionSearch = changeInfo.url.includes("search?FORM="+formCode+"&PC="+pc+"&q=");
        var showFirstSearchNotification = localStorage["showFirstSearchNotification"];

        if (isBingExtensionSearch && (showFirstSearchNotification == null || showFirstSearchNotification == undefined || showFirstSearchNotification == "")) {
            localStorage["showFirstSearchNotification"] = "false";
            chrome.tabs.insertCSS(tabId, { file: "templates/firstSearchNotification-chrome.css" });
            chrome.tabs.executeScript(tabId, { file: "scripts/injectFirstSearchNotification.js" });

        }
        else if (isBingExtensionSearch && localStorage["showFirstSearchNotification"] == "false") {
            chrome.tabs.onUpdated.removeListener(firstSearchNotification);
        }
    }
}

setTimeout(function () {
    if (navigator.language.length == 5) {
        if (localStorage["ChangeItback"] != "False") {         // only for new user
			console.log("ChangeItback"); 
            var showFirstSearchNotification = localStorage["showFirstSearchNotification"];
            if (showFirstSearchNotification == null || showFirstSearchNotification == "" || showFirstSearchNotification == undefined) {  // to restrict 2nd search injection
                if (promptMarket == browserLanguage) {
                    chrome.tabs.onUpdated.addListener(firstSearchNotification);
                }
            }
        }
    }
    else {
        promptMkt = promptMarket.substring(0, 2);
        if (localStorage["ChangeItback"] != "False") {
			console.log("ChangeItback1"); 
            var showFirstSearchNotification = localStorage["showFirstSearchNotification"];
            if (showFirstSearchNotification == null || showFirstSearchNotification == "" || showFirstSearchNotification == undefined) {
                if (promptMkt == browserLanguage) {
                    chrome.tabs.onUpdated.addListener(firstSearchNotification);
                }
            }
        }
    }
}, 200);


var externalCallback = null;
var notificationDismissed = false;
chrome.runtime.onMessage.addListener(
    function (request) {
        if (request == "notificationDismissed") {
            notificationDismissed = true;
            if (externalCallback) {
                externalCallback({ isEnabled: "true" });
            }
        }
        return true;
    }
);


chrome.runtime.onMessageExternal.addListener(
    function (request, sender, sendResponse) {
        const url = 'https://browserdefaults.microsoft.com/';
        if (sender && sender.url && sender.url.toLocaleLowerCase().includes(url) && request == "isExtensionEnabled") {
            if (notificationDismissed) {
                sendResponse({ isEnabled: "true" });
            }
            else {
                console.log("sendResponse:" + sendResponse);
                externalCallback = sendResponse;
            }
        }
        return true;
    }
);

