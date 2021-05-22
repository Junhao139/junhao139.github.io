window.onload = function() {
    repartAllHrefs();
};

function repartAllHrefs() {
    var elems = document.getElementsByTagName("a");
    for (var i = 0, sums = 0; i < elems.length; ++i) {
        if (elems[i].getAttribute("zm-cnt-src") != null) {
            elems[i].setAttribute("id", "CNTLINK_" + sums);
            elems[i].setAttribute("onclick", "jumpToThatPage('CNTLINK_" + sums + "');");

            ++sums;
        }
    }
}

function jumpToThatPage( divElementID ) {
    var element = document.getElementById(divElementID);
    var elemSrc = element.getAttribute("zm-cnt-src");

    window.location = "./reader.html?cnt=" + elemSrc;
}