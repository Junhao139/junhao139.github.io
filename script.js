window.onload = function() {
    repartAllHrefs();
    setTimeout(logo_Animation, 1000);
};

function repartAllHrefs() {
    var elems = document.getElementsByTagName("a");
    for (var i = 0, sums = 0; i < elems.length; ++i) {
        if (elems[i].getAttribute("zm-cnt-src") != null) {
            elems[i].setAttribute("id", "CNTLINK_" + sums);
            elems[i].setAttribute("href", "./reader.html?cnt=" + elems[i].getAttribute("zm-cnt-src"));

            ++sums;
        }
    }
}

function logo_Animation() {
    var elem_container = document.getElementById("welcome_logo");
    var elem_img = document.getElementById("welcome_logo_img");

    elem_container.style.marginTop = "0px";
    elem_container.style.marginBottom = "10px";
    elem_img.style.width = "64px";
}