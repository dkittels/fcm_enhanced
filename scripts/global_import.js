document.dispatchEvent(new CustomEvent('getGlobal', { detail: global }))

/*
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "getGlobal") return global;
//    if (request.message === "popup") {
//      chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
//    }
});
*/