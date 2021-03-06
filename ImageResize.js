var fs = require('fs');
var Jimp = require("jimp");
var path = ".//temp//";

function widthChange(){
	iterator = parseInt(document.getElementById('iterator').innerHTML);
	prevWidth = parseInt(document.getElementById('imgWidth').innerHTML);
	prevHeight = parseInt(document.getElementById('imgHeight').innerHTML);
	console.log(prevWidth);
	console.log(prevHeight);
    width = parseInt(document.getElementById('mWidth').value);
	height = Math.round(width/prevWidth*prevHeight);
	document.getElementById('mHeight').value = height;
}
function heightChange(){
	iterator = parseInt(document.getElementById('iterator').innerHTML);
	prevWidth = parseInt(document.getElementById('imgWidth').innerHTML);
	prevHeight = parseInt(document.getElementById('imgHeight').innerHTML);
	console.log(prevWidth);
	console.log(prevHeight);
    height = parseInt(document.getElementById('mHeight').value);
	width = Math.round(height/prevHeight*prevWidth);
	console.log(width);
	console.log(height);
	document.getElementById('mWidth').value = width;
}

document.getElementById('MosaicDimensions').addEventListener('click',function(){
    iterator = parseInt(document.getElementById('iterator').innerHTML);
    Jimp.read("./temp/"+iterator+".png", function (err, img) {
	    if (err){
	    	console.log(err)
	    }
	    width = parseInt(document.getElementById('mWidth').value);
	    height = parseInt(document.getElementById('mHeight').value);
	    img.resize(width,height);
	    iterator++;
	    document.getElementById('iterator').innerHTML = iterator;
	    img.write(".//temp//"+iterator+".png");
	    setTimeout(function(){
	    	updateImg(".//temp//"+iterator+".png", 'orgImg');
	    	document.getElementById('imgWidth').innerHTML = width;
			document.getElementById('imgHeight').innerHTML = height;
	    	addToHistory();
	    }, 100);
	});
},false);