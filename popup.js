//application config ---------------------------
const storageName = "thp_users_auth";
//application UI elements ----------------------
const submit = document.getElementById("submit");
// const clear = document.getElementById("clear");
const cancel = document.getElementById("cancel");
const addAuthor = document.getElementById("addAuthor");
const form = document.getElementById("AuthForm");
const list = document.getElementById("ListManager");
//----------------------------------------------
addAuthor.onclick = () => {
  list.style.display = "none";
  form.style.display = "block";
};

cancel.onclick = () => {
  list.style.display = "block";
  form.style.display = "none";
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
        getDataFromStorage(tokenlist);
      }
    );
  });
  // console.log("data", data);
  authUser(data.accessToken);
};

const clearList = () => {
  chrome.storage.local.set({ [storageName]: "" }, () => {
    console.log("Value is set to ", {});
    getDataFromStorage(tokenlist);
  });
};

const checkNotEmpty = (element) => {
  console.log("element", element);
  return element && JSON.stringify(element) !== "{}" && element !== "";
};

const getDataFromStorage = (tokenlist) => {
  chrome.storage.local.get([storageName], (result) => {
    const usersList = checkNotEmpty(result[storageName])
      ? JSON.parse(result[storageName])
      : [];
    console.log("usersList", usersList);
    if (usersList.length > 0) {

      tokenlist.innerHTML = `
        <div class="UserElement UserElement--header">
            <div class="UserElement__div">#</div>
            <div class="UserElement__div">Author name</div>
            <div class="UserElement__div">Status</div>
            <div class="UserElement__div">Actions</div>
        </div>
      `;

      for (let i = 0; i < usersList.length; i++) {
        const element = document.createElement("div");
        element.className = "UserElement";
        let useToken = `<div class="UserElement__div"></div>`;
        if (usersList[i].loggedIn === "false") {
          useToken = `<div class="UserElement__div">
                  <div class="tooltip">
                    <img id="useToken" class="actionIcon" src="/icons/copywriting.png" alt="Use this token" data-token="${usersList[i].accessToken}"/>
                    <span class="tooltiptext">Use token</span>
                  </div>
              </div>`;
        }
        element.innerHTML = `
                <div class="UserElement__div">${i+1}</div>
                <div class="UserElement__div">${usersList[i].author_name}</div>
                <div class="UserElement__div">
                  <div class="badge badge--${usersList[i].loggedIn}">
                    ${usersList[i].loggedIn}
                  </div>  
                </div>
                ${useToken}`;
        tokenlist.appendChild(element);
      }
    }
    else {
      tokenlist.innerHTML = `<div class="emptyAuthors">No authors. Create one to proceed</div>`;
    }
  });
};

getDataFromStorage(tokenlist);

const authUser = (token) => {
  chrome.runtime.sendMessage({token: token},
      (response) => {
        console.log("response", response);
        if (response.response === 'token_recived') {

          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {token: token}, function(response) {
              console.log(response);
            });
          });


          chrome.storage.local.get([storageName], (result) => {
            const usersList = JSON.parse(result[storageName]);
            usersList.forEach(element => {
              if (element.accessToken === token) {
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

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "useToken") {
    console.log("dataset", e.target.dataset);
    authUser(e.target.dataset.token);
  }
});
