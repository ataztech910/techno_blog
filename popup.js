const submit = document.getElementById('submit');
submit.onclick = () => {
    const shortName = document.getElementById('shortName');
    const name = document.getElementById('name');
    const link = document.getElementById('link');

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log('result', xhttp.responseText);
            console.log('result type', typeof xhttp.responseText);
            const result = JSON.parse(xhttp.responseText);
            document.getElementById("tokenlist").innerHTML = result.result.access_token;
            chrome.tabs.update({active: true, url: result.result.auth_url});
        }
    };
    xhttp.open("GET", `https://api.telegra.ph/createAccount?short_name=${shortName.value}&author_name=${name.value}&author_url=https://t.me/${link.value}`, true);
    xhttp.send();
};