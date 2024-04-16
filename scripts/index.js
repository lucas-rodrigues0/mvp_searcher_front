
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

