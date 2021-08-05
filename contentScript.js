//application config ---------------------------
const storageName = "thp_users_auth";
//----------------------------------------------
let current_token = null;

const checkNotEmpty = (element) => {
    console.log("element", element);
    return JSON.stringify(element) !== "{}" && element !== "";
};

chrome.storage.local.get([storageName], (result) => {
    console.log(result);
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
            <input type="button" value="Articles list" id="list" class="buttonForNavigation" />
        </div>
        <div class="Navigation__element">
            <input type="button" value="New article" id="new" class="buttonForNavigation" />
        </div>
    </div>
`

parentDiv.insertBefore(wrapper, page[0]);

chrome.runtime.onMessage.addListener( (request,sender,sendResponse) => {
    console.log('from message', {request,sender,sendResponse});
    current_token = request.token;
    sendResponse({response : "token_recived"});
});

document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "list") {
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
              content[0].style.display = 'none';
              const tl_artiles_list = document.getElementById('tl_artiles_list')
              tl_artiles_list.style.display = 'block';
              const result = JSON.parse(xhttp.responseText);
              console.log("result", result);
              if (result.result.pages.length > 0) {
                let list = '';
                result.result.pages.forEach(element => {
                    const img = element.image_url ? `<div class="Article__image"><img src="${element.image_url}"></div>` : '<div class="Article__image">no image</div>';
                    list += `
                        <div class="Article" onclick="location.href = '${element.url}'">
                            ${img}
                            <div>
                                <a href="${element.url}">${element.title}</a>
                            </div>
                            <div class="Article__desc">
                                ${element.views}
                            </div>
                            
                        </div>
                    `    
                });
                tl_artiles_list.innerHTML = `
                    <div><h1>Articles list</h1></div>
                    <div class="Article Article--header">
                        <div>image</div>
                        <div>title</div>
                        <div>visits</div>
                    </div>
                    ${list}`;
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
