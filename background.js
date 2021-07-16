console.log('bg loaded');
function modifyHeaders(e) {
    // TODO сделать универсальную проверку
    if (e.url === "https://edit.telegra.ph/check" || e.url === "https://edit.telegra.ph/save") {
        console.log(e);
        const index = e.requestHeaders.findIndex(element => element.name === "Cookie");
        console.log('index', index);
        e.requestHeaders.splice(index, 1);
        e.requestHeaders.push({
            name: "Cookie",
            value: "tph_token=24b31202062fb4a166849dc7230fd2734d66a16a5679602f44cffa85d12f"
        })
    }
    return {
        // requestHeaders: e.requestHeaders
    };
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    modifyHeaders,
    {urls: ['<all_urls>']},
    ['blocking', 'requestHeaders', 'extraHeaders']
);

chrome.runtime.onMessage.addListener( (request,sender,sendResponse) => {
    console.log('from message', {request,sender,sendResponse});
})