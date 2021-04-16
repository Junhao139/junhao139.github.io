window.onload = function() {
    convertSource();
}

/* GET CONVERTED HTML STRING */
function getMarkdownTexts(url) {
    var iframe = document.createElement("iframe");
    iframe.setAttribute("src", url);
    iframe.setAttribute("id", "GET_CNT_IFRAME_ELEM");
    var elmnt = iframe.contentWindow.document.getElementsByTagName("body")[0].innerHTML;

    var MarkDownConverter = new showdown.Converter();
    markdownOutput = MarkDownConverter.makeHTML(elmnt);
    return markdownOutput;
}

/* MAIN CONVERTER FUNCTION */
function convertSource() {
    /* GET URL PARAMETER */
    var wholeURL = window.location.search;
    var urlParameters = new URLSearchParams(wholeURL);
    var directingFile = urlParameters.get("cnt");

    /* CONVERT TO HTML */
    var markdownOutput = getMarkdownTexts("https://blog.zminutes.com/texts/" + directingFile + ".md");

    /* OUTPUT */
    var parentElem = document.getElementById("pageContent");
    parentElem.innerHTML = markdownOutput;
}