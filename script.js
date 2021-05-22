window.onload = function() {
    repartAllHrefs();
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