
async function handleRequest(url, method, data, token){
    let formattedUrl = url
    const options = {
        "method": method,
        "headers": {"Content-Type": "application/json"}
    }
    if (method == "GET" && data){
        formattedUrl += new URLSearchParams(data).toString();
    }

    if (method == "POST"){
        options["body"] = JSON.stringify(data);
    }

    if (token){
        options["headers"]["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(formattedUrl, options);

    return response
}


function setTokenToSession(token, account_id){
    sessionStorage.setItem("token", token)
    sessionStorage.setItem("account_id", account_id)
}

function getTokenFromSession(){
    const token = sessionStorage.getItem("token");
    const accountId = sessionStorage.getItem("account_id");
    if (accountId){
        return {"token": token, "account_id": accountId};
    } else {
        return false;
    }
}


const signin = document.querySelector(".sign-in");
const register = document.querySelector(".register");
const form = document.querySelector("#loginForm");
const switchs = document.querySelectorAll(".switch");

let current = 1;

function tabSignin(){
    form.style.marginLeft = "-100%";
    signin.style.outline = "none";
    register.style.outline = "#b2babb solid 1px";
    switchs[current - 1].classList.add("active");
}

function tabRegister(){
    form.style.marginLeft = "0";
    register.style.outline = "none";
    signin.style.outline = "#b2babb solid 1px";
    switchs[current - 1].classList.remove("active");
}

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {};
    const baseUrl = "http://127.0.0.1:5000/account";
    let url = "";

    if (e.submitter.id == "signinBtn") {
        const email = document.getElementById("signinEmail");
        const password = document.getElementById("signinPassword");
        if (email.value == "" || password.value == "") {
            alert("Os campos de email e password são necessários.");
        } else {
            data["email"] = email.value;
            data["password"] = password.value;

            url = baseUrl.concat("/login")
            
            email.value = "";
            password.value = "";
        }
    }

    if (e.submitter.id == "registerBtn") {
        const email = document.getElementById("registerEmail");
        const username = document.getElementById("registerUsername")
        const password = document.getElementById("registerPassword");
        const checkPassword = document.getElementById("checkPassword");
        if (email.value == "" || password.value == "" || username.value == "") {
            alert("Os campos de email, nome e password são necessários.");
        } else if (password.value != checkPassword.value) {
            alert("Certifique que a senha esteja correta");
        } else {
            data["email"] = email.value;
            data["password"] = password.value;
            data["username"] = username.value;
    
            url = baseUrl.concat("/register")
        }
    }

    const loginModal = document.getElementById("loginModal");
    const modal = bootstrap.Modal.getInstance(loginModal);

    const response = await handleRequest(url, "POST", data).then((result) => result);
    const responseJson = await response.json()
    const responseStatus = response.status
    const responseData = responseJson["data"];

    if(responseStatus == 200){
        const token = responseData["token"];
        const accountId = responseData["account_id"];
        if(token){
            setTokenToSession(token, accountId)
        }
    } else {
        const msg = responseData["message"]
        alert(`Não foi possivel realizar o login. 
        O status da resposta: ${responseStatus}. 
        Menssagem: ${msg}`);
    }

    modal.hide();
});

function movePage(page){}

function handleQueryResults(results){
    const resultsContainer = document.querySelector(".results");
    const resultList = document.getElementById("result-list");
    resultList.replaceChildren();
    if(!results) {
        const span = document.createElement("span")
        span.textContent = "Nenhum resultado encontrado"
        span.className = "noresult-span"
        resultList.appendChild(span)
    } else {
        for(key in results){
            const li = document.createElement("li");
            const pageLink = document.createElement("span")
            pageLink.innerHTML = `<a class="btn-page" href="#iframe-reader" onclick="movePage(${key})">Página ${key}:</a>`
            li.appendChild(pageLink)
            const highlight = document.createElement("p")
            highlight.innerHTML = results[key]
            highlight.insertAdjacentText("afterbegin", "(...) ")
            highlight.insertAdjacentText("beforeend", " (...)")
            li.appendChild(highlight)
            li.className = "list-group-item"
            resultList.appendChild(li)
        }
    }
    resultsContainer.style.display = "block";
}


const searcher = document.getElementById("searcherForm");

searcher.addEventListener("submit", async (e) => {
    e.preventDefault();

    const query = document.getElementById("queryInput");
    const tokenInfo = getTokenFromSession();
    if(!tokenInfo){
        alert("Por favor, fazer o login para enviar o seu comentário.");
    }

    const baseUrl = "http://127.0.0.1:5000/searcher?";

    if (query.value != ""){
        const data = {"query": query.value}
        const token = tokenInfo["token"]
        
        const response = await handleRequest(baseUrl, "GET", data, token).then((result) => result);
        const responseJson = await response.json()
        const responseStatus = response.status
        let results = undefined
        const responseData = responseJson["data"];

        if(responseStatus == 200){
            results = responseData["results"];
            if(responseData["total_count"] == 0){
                results = false
            } 
        } else {
            const msg = responseData["message"]
            results = false
            alert(`Não foi possivel realizar a busca. 
            O status da resposta: ${responseStatus}. 
            Menssagem: ${msg}`);
        }

        query.value = "";
        handleQueryResults(results)
    }
});
