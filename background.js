console.log('bg loaded');
let token = null;
function modifyHeaders(e) {
    // TODO сделать универсальную проверку
    if (token) {
        if (e.url === "https://edit.telegra.ph/check" || e.url === "https://edit.telegra.ph/save") {
            console.log(e);
            const index = e.requestHeaders.findIndex(element => element.name === "Cookie");
            console.log('index', index);
            e.requestHeaders.splice(index, 1);
            e.requestHeaders.push({
                name: "Cookie",
                value: `tph_token=${token}`
            })
        }
        return {
            requestHeaders: e.requestHeaders
        };
    }
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    modifyHeaders,
    {urls: ['<all_urls>']},
    ['blocking', 'requestHeaders', 'extraHeaders']
);

chrome.runtime.onMessage.addListener( (request,sender,sendResponse) => {
    // console.log('from message', {request,sender,sendResponse});
    if (request.token) {
        token = request.token;
        sendResponse({response : "token_recived"});
    }
});
