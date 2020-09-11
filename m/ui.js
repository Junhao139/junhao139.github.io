var menu_nowSelected = 0;

function menu_Clicked( listNum ) {
    document.getElementById(menu_nowSelected.toString()).style.backgroundColor = "#fff";
    document.getElementById(menu_nowSelected.toString()).style.color = "#bbb";
    menu_nowSelected = listNum;
}

function menu_HighLight() {
    document.getElementById(menu_nowSelected.toString()).style.backgroundColor = "#107fa8";
    document.getElementById(menu_nowSelected.toString()).style.color = "#fff";
}

function wpMenu_fade() {
    var nowScroll = document.documentElement.scrollTop || document.body.scrollTop;
    var wHeight = window.innerHeight;
    if (nowScroll > 149 || nowScroll < 251) {
        document.getElementById("wp_menu_bd").style.transform = "translateY(" + (nowScroll - 150 < 0 ? 0 : nowScroll - 150) + "px)";
        document.getElementById("wp_menu_bd").style.opacity = (1 - ((nowScroll - 150) / 100)).toString();
    }
}

setInterval(function(){
    menu_HighLight();
    wpMenu_fade();
}, 1);