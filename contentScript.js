//application config ---------------------------
const storageName = "thp_users_auth";
//----------------------------------------------
let current_token = null;

const checkNotEmpty = (element) => {
    // console.log("element", element);
    return JSON.stringify(element) !== "{}" && element !== "";
};

chrome.storage.local.get([storageName], (result) => {
    // console.log(result);
    const usersList = checkNotEmpty(result[storageName])
      ? JSON.parse(result[storageName])
      : [];
      usersList.forEach(element => {
        if (element.loggedIn === 'true') {
            current_token = element.accessToken;
        }
    });
})

const doc = document.getElementsByClassName('tl_page_wrap');
const page = document.getElementsByClassName('tl_page');
const wrapper = document.createElement("div");
const list = document.createElement("div");
const content = document.getElementsByClassName('tl_article');

let parentDiv = page[0] ? page[0].parentNode : undefined;
let xhttp = new XMLHttpRequest();

list.className = 'tl_artiles_list';
list.id = 'tl_artiles_list';
page[0].appendChild(list);

wrapper.className = "tl_ui_wrapper";
wrapper.innerHTML = `
    <div class="Navigation">
        <div class="Navigation__element">
            <div id="list" class="neo_button">Articles</div>
        </div>
        <div class="Navigation__element">
            <div id="new" class="neo_button">New article<div/>
        </div>
    </div>
`

parentDiv.insertBefore(wrapper, page[0]);

chrome.runtime.onMessage.addListener( (request,sender,sendResponse) => {
    console.log('from message', {request,sender,sendResponse});
    current_token = request.token;
    sendResponse({response : "token_recived"});
});

const copy = (text) => {
    const input = document.createElement('textarea');
    input.innerHTML = text;
    document.body.appendChild(input);
    input.select();
    const result = document.execCommand('copy');
    document.body.removeChild(input);
    return result;
}

document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "list") {
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
              content[0].style.display = 'none';
              const tl_artiles_list = document.getElementById('tl_artiles_list')
              tl_artiles_list.style.display = 'block';
              const result = JSON.parse(xhttp.responseText);

              if (result.result.pages.length > 0) {
                let list = '';
                result.result.pages.forEach(element => {
                    const img = element.image_url ? `<div class="Article__image"><img src="${element.image_url}"></div>` : '<div class="Article__image">no image</div>';
                    list += `
                        <tr class="tableItem">
                            <td onclick="location.href = '${element.url}'">${img}</td>    
                            <td onclick="location.href = '${element.url}'"><a href="${element.url}">${element.title}</a></td>    
                            <td onclick="location.href = '${element.url}'">${element.views}</td>    
                            <td>
                                <div class="copyToClipboard" id="copyToClipboard" data-url="${element.url}">
                                    copy to clipboard
                                </div>
                            </td>    
                        </tr>
                    `
                });
                tl_artiles_list.innerHTML = `
                    <div><h1 class="h1--list">Articles list</h1></div>
                    <table class="Articles__listTable">
                    <thead>
                        <tr>
                         <th>image</th>
                         <th>title</th>
                         <th>visits</th>
                         <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list}
                    </tbody>
                    </table>
                    `;
                    const copyToClipboard = document.getElementById('copyToClipboard');
                      copyToClipboard.onclick = (e) => {
                          copy(e.target.dataset.url);
                          e.target.innerHTML = "copied";
                          setTimeout(() => {
                              e.target.innerHTML = "copy to clipboard";
                          },600);

                    }
              } else {
                tl_artiles_list.innerHTML = 'No articles. Create one to see it in the list';
              }
            }
          };
          console.log(`https://api.telegra.ph/getPageList?access_token=${current_token}`);
          xhttp.open(
            "GET",
            `https://api.telegra.ph/getPageList?access_token=${current_token}`,
            true
          );
          xhttp.send();
    } else if(e.target && e.target.id === "new") {
        location.href = "https://telegra.ph/";
    }
});

