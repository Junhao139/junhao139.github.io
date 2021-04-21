/* GLOBAL VARIABLES */
var contentIsLoaded = false;

window.onload = function() {
    convertSource("local");
    setInterval(function() {customPageMargin();}, 50);
    var contentLoadIntervalID = setInterval(function() {
        if (!contentIsLoaded) {
            askForChangingSource(true);
        } else {
            askForChangingSource(false);
            clearInterval(contentLoadIntervalID);
        }
    }, 4000);
}

/* GET CONVERTED HTML STRING */
function getMarkdownTexts(originalString) {
    var MarkDownConverter = new showdown.Converter({ strikethrough : true });
    var markdownOutput = MarkDownConverter.makeHtml(originalString);
    return markdownOutput;
}

/* LOAD CONTENT WITH CALLED SOURCE */
function getMarkdownContentWithSource(sourceType, fileName) {
    var directedURL;
    switch (sourceType) {
    case "local":
        directedURL = "https://blog.zminutes.com/texts/";
        break;
    case "gitRaw":
        directedURL = "https://raw.githubusercontent.com/Junhao139/junhao139.github.io/master/texts/";
        break;
    case "replit":
        directedURL = "https://PersonalBlogContainer.junhaoliu.repl.co/texts/";
        break;
    }

    directedURL += fileName;

    /* GET CONTENTS THEN PUSH THEM */
    $.get(
        directedURL,
        function (callback, status) {
            if (!contentIsLoaded) {
                document.getElementById("pageContent").innerHTML = getMarkdownTexts(callback);
                document.getElementById("textInfos").innerText = "阅读时长：" + getReadingDuration(callback.length) + " 分钟"; 
                contentIsLoaded = true;
            }
        }
    );
}

/* MAIN CONVERTER FUNCTION */
function convertSource(sourceType) {
    /* GET URL PARAMETER */
    var wholeURL = window.location.search;
    var urlParameters = new URLSearchParams(wholeURL);
    var directingFile = urlParameters.get("cnt");

    /* CONVERT TO HTML */
    getMarkdownContentWithSource(sourceType, directingFile + ".md");
}

/* ASK FOR IF THE CONTENT IS NOT LOAD AFTER A WHILE */
function askForChangingSource(option) {
    var elem = document.getElementById("wantToChangeSource");

    switch (option) {
    case true:
        elem.style.display = "block";
        break;
    case false:
        elem.style.display = "none";
        break;
    }
}

/* CALCULATE READING LENGTH THROUGH STRING LENGTH */
function getReadingDuration(strLength) {
	var duration = strLength / 500;

	if (duration < 1) {
		return "&lt 1";
	} else {
		return (Math.round(duration)).toString();
	}
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