window.onload = function() {
    convertSource();
    setInterval(function() {customPageMargin();}, 50);
}

/* CREATE IFRAME */
function createIframe(url) {
    var iframe = document.createElement("iframe");
    iframe.setAttribute("src", url);
    iframe.setAttribute("id", "GET_CNT_IFRAME_ELEM");
    return iframe;
}

/* GET CONVERTED HTML STRING */
function getMarkdownTexts(iframeElement) {
    var elmnt = iframeElement.contentDocument || iframeElement.contentWindow.document;
    var bodyElement = elmnt.getElementsByTagName("pre")[0].innerHTML;

    var MarkDownConverter = new showdown.Converter();
    var markdownOutput = MarkDownConverter.makeHtml(bodyElement);
    return markdownOutput;
}

/* MAIN CONVERTER FUNCTION */
function convertSource() {
    /* GET URL PARAMETER */
    var wholeURL = window.location.search;
    var urlParameters = new URLSearchParams(wholeURL);
    var directingFile = urlParameters.get("cnt");

    /* CONVERT TO HTML */
    var outputIframe = createIframe("https://blog.zminutes.com/texts/" + directingFile + ".md");
    outputIframe.style.display = "none";
    document.getElementsByTagName("body")[0].appendChild(outputIframe);

    outputIframe.onload = function () {
        var markdownOutput = getMarkdownTexts(outputIframe);

        /* OUTPUT */
        var parentElem = document.getElementById("pageContent");
        parentElem.innerHTML = markdownOutput;
    }
}

/* CUSTOM PAGE MARGIN TO FIX PAGE */
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