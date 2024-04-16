window.addEventListener("load", (event) => {
    requestComments();
})

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

function movePage(page){
    const url_base = "resources/CF.pdf#page="
    const reader_elem = document.getElementById("iframe-reader");
    reader_elem.src = url_base.concat(page.toString())

    if (reader_elem.style.display == "" | reader_elem.style.display == "none"){
        handleReader("#iframe-reader")
    }
}

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
        alert("Por favor, fazer o login para enviar a sua busca.");
        return;
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


let readerOn = false

function handleReader(elemId){
    if (readerOn) {
        turnOff(elemId)
    } else {
        turnOn(elemId)
    }
}

function turnOff(elemId){
    const elem = document.querySelector(elemId);
    elem.style.display = "none"
    readerOn = false
}

function turnOn(elemId){
    const elem = document.querySelector(elemId);
    elem.style.display = "block"
    readerOn = true
}

async function requestComments(){
    const url = "http://127.0.0.1:5000/comments";

    const response = await handleRequest(url, "GET").then((result) => result);
    const responseJson = await response.json()
    const responseStatus = response.status
    const responseData = responseJson["data"];

    if(responseStatus == 200){
        createCommentsElements(responseData["comments"]);
    } else {
        const msg = responseData["message"]
        alert(`Não foi possivel inserir comentário. 
        O status da resposta: ${responseStatus}. 
        Menssagem: ${msg}`);
    }

}

function createCommentsElements(commentsData){
    const commentsList = document.getElementById("comments-list");
    commentsList.replaceChildren();
    commentsData.forEach((comment) => {
        const username = comment["username"];
        const content = comment["content"];
        const createdAt = comment["created_at"];

        const divCard = document.createElement("div");
        divCard.className = "card";
        const divBody = document.createElement("div");
        divBody.className = "card-body";
        const cardTitle = document.createElement("h5");
        const cardText = document.createElement("p");
        const cardFooter = document.createElement("span");

        cardTitle.innerText = username;
        cardTitle.className = "card-title";
        cardText.innerText = content;
        cardText.className = "card-text border border-secondary-subtle p-3";
        
        divBody.appendChild(cardTitle);
        divBody.appendChild(cardText);
        
        cardFooter.innerText = createdAt;
        cardFooter.className = "mb-2 px-3 text-end fw-lighter";

        divCard.appendChild(divBody);
        divCard.appendChild(cardFooter);

        commentsList.appendChild(divCard)
    })
}

async function addComment(){    
    const commentInput = document.getElementById("addCommentArea");
    const commentModal = document.getElementById("commentModal");
    const modal = bootstrap.Modal.getInstance(commentModal);
    
    const tokenData = getTokenFromSession()

    if (!tokenData){
        alert("Por favor, fazer o login para enviar o seu comentário.");
        modal.hide();
        return;
    } else{
        const data = {
            "content": commentInput.value
        }
    
        const url = "http://127.0.0.1:5000/comments";
        const token = tokenData.token;
        
        const response = await handleRequest(url, "POST", data, token).then((result) => result);
        const responseJson = await response.json()
        const responseStatus = response.status
        const responseData = responseJson["data"];

        if(responseStatus != 200){
            const msg = responseData["message"]
            alert(`Erro ao buscar os comentários.
            O status da resposta: ${responseStatus}. 
            Menssagem: ${msg}`);
        }
        commentInput.value = "";
    }
    
    requestComments();
    modal.hide();
}