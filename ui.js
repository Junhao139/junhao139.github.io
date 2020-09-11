
function topBar() {
	if (document.documentElement.scrollTop > 10) {
		document.getElementById("navBar").style.background = "rgba(253, 253, 253, 1)";
		document.getElementById("navBar").style.boxShadow = "0 0 15px -7.5px rgba(32, 48, 48, 0.75)";
		document.getElementById("navBar_title").style.color = "#000";
	} else {
		document.getElementById("navBar").style.background = "rgba(253, 253, 253, 0)";
		document.getElementById("navBar").style.boxShadow = "0 0 15px -7.5px rgba(0, 0, 0, 0)";

		document.getElementById("navBar_title").style.color = "#fff";
	}
}

var innerHeight = window.innerHeight;
var nowTime = new Date;
function onload() {
	document.getElementById("Time").innerHTML = nowTime.getFullYear() + " 年 " + (nowTime.getMonth() + 1) + " 月 " + nowTime.getDate() + " 日 " + nowTime.getHours() + " : " + nowTime.getMinutes();
	document.getElementById("main").style.height = innerHeight + "px";
	if ((window.innerWidth / window.innerHeight) < 1.5) {
		document.getElementById("main").style.backgroundSize = "auto 100%";
	} else {
		document.getElementById("main").style.backgroundSize = "100% auto";
	}
}

setInterval(function(){topBar(), onload()}, 1);
