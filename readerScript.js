window.onload = function() {
    convertSource();
    setInterval(function() {customPageMargin();}, 50);
}

/* GET CONVERTED HTML STRING */
function getMarkdownTexts(originalString) {
    var MarkDownConverter = new showdown.Converter({ strikethrough : true });
    var markdownOutput = MarkDownConverter.makeHtml(originalString);
    return markdownOutput;
}

/* MAIN CONVERTER FUNCTION */
function convertSource() {
    /* GET URL PARAMETER */
    var wholeURL = window.location.search;
    var urlParameters = new URLSearchParams(wholeURL);
    var directingFile = urlParameters.get("cnt");

    /* CONVERT TO HTML */
    var directingURL_local = "https://blog.zminutes.com/texts/" + directingFile + ".md";
    var directingURL_gitRaw = "https://raw.githubusercontent.com/Junhao139/junhao139.github.io/master/texts/" + directingFile + ".md";
    var usedSource = directingURL_local;

    $.get(
        usedSource,
        function (callback, status) {
            document.getElementById("pageContent").innerHTML = getMarkdownTexts(callback);
        }
    )
}

/* CUSTOM PAGE MARGIN TO FIX PAGE */
function customPageMargin() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    var container = document.getElementById("pageContent");

    if ((width / height) < 0.6) {
        container.style.margin = "120px 10px 20px 10px";
    } else if ((width / height) < 1.0) {
        container.style.margin = "120px 10% 20px 10%";
    } else {
        container.style.margin = "120px 20% 20px 20%";
    }
}