function customPageMargin() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    if ((width / height) < 0.6) {
        document.getElementsByTagName("body")[0].style.margin = "120px 10px 20px 10px";
    } else if ((width / height) < 1.0) {
        document.getElementsByTagName("body")[0].style.margin = "120px 10% 20px 10%";
    } else {
        document.getElementsByTagName("body")[0].style.margin = "120px 20% 20px 20%";
    }
}