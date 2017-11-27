var ALERT_TITLE = "Warning!";
var YES_BUTTON_TEXT = "Yes";
var NO_BUTTON_TEXT = "No";

if(document.getElementById) {
	window.alert = function(txt) {
		createCustomAlert(txt);
	}
}

function createCustomAlert(txt) {
	d = document;

	if(d.getElementById("modalContainer")) return;

	mObj = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
	mObj.id = "modalContainer";
	mObj.style.height = d.documentElement.scrollHeight + "px";
	
	alertObj = mObj.appendChild(d.createElement("div"));
	alertObj.id = "alertBox";
	if(d.all && !window.opera) alertObj.style.top = document.documentElement.scrollTop + "px";
	alertObj.style.left = (d.documentElement.scrollWidth - alertObj.offsetWidth)/2 + "px";
	alertObj.style.visiblity="visible";

	h1 = alertObj.appendChild(d.createElement("h1"));
	h1.appendChild(d.createTextNode(ALERT_TITLE));

	msg = alertObj.appendChild(d.createElement("p"));
	//msg.appendChild(d.createTextNode(txt));
	msg.innerHTML = txt;

	btnN = alertObj.appendChild(d.createElement("a"));
	btnN.id = "noBtn";
	btnN.appendChild(d.createTextNode(NO_BUTTON_TEXT));
	btnN.href = "#";
	btnN.focus();
	btnN.onclick = function() { removeCustomAlert();return false; }


	btnY = alertObj.appendChild(d.createElement("a"));
	btnY.id = "yesBtn";
	btnY.appendChild(d.createTextNode(YES_BUTTON_TEXT));
	btnY.href = "#";
	btnY.focus();
	btnY.onclick = function() { brickifyContinue();return false; }


	alertObj.style.display = "block";
	
}

function removeCustomAlert() {
	document.getElementsByTagName("body")[0].removeChild(document.getElementById("modalContainer"));
}
function ful(){
alert('Alert this pages');
}
function brickifyContinue(){
	brickify(false);
	removeCustomAlert();
}
