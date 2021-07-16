console.log('bg loaded');
function modifyHeaders(e) {
    if (e.url === "https://edit.telegra.ph/check") {
        console.log(e);
        const index = e.requestHeaders.findIndex(element => element.name === "Cookie");
        console.log('index', index);
        e.requestHeaders.splice(index, 1);
        e.requestHeaders.push({
            name: "Cookie",
            value: "tph_token=3ff0f0f34bd72dd02b7cf6dce47fef3d4c2b59014dbe6df901f011a55b32"
        })
    }
    return {
        requestHeaders: e.requestHeaders
    };
}

chrome.webRequest.onBeforeSendHeaders.addListener(
    modifyHeaders,
    {urls: ['<all_urls>']},
    ['blocking', 'requestHeaders', 'extraHeaders']
);
