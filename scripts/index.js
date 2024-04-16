

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
