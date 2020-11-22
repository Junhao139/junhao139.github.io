function menu_Show() {
    var nowScroll = document.documentElement.scrollTop || document.body.scrollTop;
    var wHeight = window.innerHeight;
    if (nowScroll > (wHeight - 100)) {
        document.getElementById("menu").style.left = "0px";
        document.getElementById("menu").style.top = "75px";
        document.getElementById("menu").style.padding = "20px 5px 20px 5px";
    } else {
        document.getElementById("menu").style.left = "-90px";
        document.getElementById("menu").style.top = "250px";
        document.getElementById("menu").style.padding = "80px 5px 120px 5px";
    }
}

var value = 0;
function space4Cnt() {
    var wHeight = window.innerHeight;
    if (!value) {
        document.getElementById("space4Cnt").style.minHeight = wHeight + "px";
        value = wHeight;
    }
}

function showTime() {
    var time = new Date;
    var hours = time.getHours();
    var minutes = time.getMinutes();
    document.getElementById("logo_name").innerHTML = "<b>zMinutes.com</b> - " + hours + " : " + (minutes < 10 ? "0" + minutes : minutes);
}

function initUserPreference() {
    var obj = document.getElementById("");
}

setInterval(function() {
    space4Cnt();
    menu_Show();
    showTime();
}, 2);
