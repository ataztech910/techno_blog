//application config ---------------------------
const storageName = "thp_users_auth";
//----------------------------------------------
const submit = document.getElementById("submit");
const clear = document.getElementById("clear");

clear.onclick = () => {
  clearList();
};

submit.onclick = () => {
  var xhttp = new XMLHttpRequest();

  var shortName = document.getElementById("shortName");
  var author_name = document.getElementById("authorName");
  var link = document.getElementById("link");
  var tokenlist = document.getElementById("tokenlist");

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      console.log("result", xhttp.responseText);
      console.log("result type", typeof xhttp.responseText);
      const result = JSON.parse(xhttp.responseText);

      getDataFromStorage(tokenlist);

      saveIntoStorage({
        shortName: shortName.value,
        author_name: author_name.value,
        link: link.value,
        accessToken: result.result.access_token,
        authUrl: result.result.auth_url,
        loggedIn: "true",
      });
    }
  };

  xhttp.open(
    "GET",
    `https://api.telegra.ph/createAccount?short_name=${shortName.value}&author_name=${author_name.value}&author_url=https://t.me/${link.value}`,
    true
  );
  xhttp.send();
};

const saveIntoStorage = (data) => {
  chrome.storage.local.get([storageName], (result) => {
    console.log("result", result);
    console.log("result type", typeof result);
    const usersList = checkNotEmpty(result[storageName])
      ? JSON.parse(result[storageName])
      : [];
    usersList.forEach((element) => {
      element.loggedIn = "false";
    });
    usersList.unshift(data);
    console.log("new data is", usersList);
    chrome.storage.local.set(
      { [storageName]: JSON.stringify(usersList) },
      () => {
        console.log("Value is set to ", JSON.stringify(usersList));
        chrome.tabs.update({ active: true, url: data.authUrl });
        getDataFromStorage(tokenlist);
      }
    );
  });
};

const clearList = () => {
  chrome.storage.local.set({ [storageName]: "" }, () => {
    console.log("Value is set to ", {});
    getDataFromStorage(tokenlist);
  });
};

const checkNotEmpty = (element) => {
  console.log("element", element);
  return JSON.stringify(element) !== "{}" && element !== "";
};

const getDataFromStorage = (tokenlist) => {
  tokenlist.innerHTML = `
    <div class="UserElement UserElement--header">
        <div>short name</div>
        <div>author name</div>
        <div>link</div>
        <div>status</div>
        <div>actions</div>
    </div>
  `;
  chrome.storage.local.get([storageName], (result) => {
    const usersList = checkNotEmpty(result[storageName])
      ? JSON.parse(result[storageName])
      : [];
    console.log("usersList", usersList);
    if (usersList.length > 0) {
      for (let i = 0; i < usersList.length; i++) {
        const element = document.createElement("div");
        element.className = "UserElement";
        let useToken = "<div></div>";
        if (usersList[i].loggedIn === "false") {
          useToken = `<div><input type="button" value="use token" id="useToken" data-token="${usersList[i].accessToken}"/></div>`;
        }
        element.innerHTML = `
                <div>${usersList[i].shortName}</div>
                <div>${usersList[i].author_name}</div>
                <div>${usersList[i].link}</div>
                <div>${usersList[i].loggedIn}</div>
                ${useToken}`;
        tokenlist.appendChild(element);
      }
    }
  });
};

getDataFromStorage(tokenlist);

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "useToken") {
    console.log("dataset", e.target.dataset);
    
    chrome.runtime.sendMessage({token: e.target.dataset.token}, 
        (response) => { 
            console.log("response", response);
            if (response.response === 'token_recived') {

              chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {token: e.target.dataset.token}, function(response) {
                  console.log(response);
                });
              });


              chrome.storage.local.get([storageName], (result) => {
                const usersList = JSON.parse(result[storageName]);
                usersList.forEach(element => {
                  if (element.accessToken === e.target.dataset.token) {
                    element.loggedIn = 'true';
                  } else {
                    element.loggedIn = 'false';
                  }
                });
                chrome.storage.local.set(
                  { [storageName]: JSON.stringify(usersList) },
                  () => {
                    console.log("Value is set to ", JSON.stringify(usersList));
                    chrome.tabs.update({ active: true, url: 'https://telegra.ph/' });
                    getDataFromStorage(tokenlist);
                  }
                );
              });
              
            }
        }
    ); 
  }
});
