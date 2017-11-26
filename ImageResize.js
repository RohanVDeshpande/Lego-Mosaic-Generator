var fs = require('fs');
var Jimp = require("jimp");
var path = ".//temp//";

function widthChange(){
	iterator = parseInt(document.getElementById('iterator').innerHTML);
	prevWidth = parseInt(document.getElementById('imgWidth').innerHTML);
	prevHeight = parseInt(document.getElementById('imgHeight').innerHTML);
    width = parseInt(document.getElementById('mWidth').value);
	height = Math.round(width/prevWidth*prevHeight);
	document.getElementById('mHeight').value = height;
}
function heightChange(){
	iterator = parseInt(document.getElementById('iterator').innerHTML);
	Jimp.read("./temp/"+iterator+".jpg", function (err, img) {
	    if (err){
	    	console.log(err)
	    }
	    height = parseInt(document.getElementById('mHeight').value);
    	width = Math.round(height/img.bitmap.height*img.bitmap.width);
    	document.getElementById('mWidth').value = width;
	});
}

document.getElementById('MosaicDimensions').addEventListener('click',function(){
    iterator = parseInt(document.getElementById('iterator').innerHTML);
    Jimp.read("./temp/"+iterator+".jpg", function (err, img) {
	    if (err){
	    	console.log(err)
	    }
	    width = parseInt(document.getElementById('mWidth').value);
	    height = parseInt(document.getElementById('mHeight').value);
	    img.resize(width,height);
	    iterator++;
	    document.getElementById('iterator').innerHTML = iterator;
	    img.write(".//temp//"+iterator+".jpg");
	    setTimeout(function(){
	    	updateImg(".//temp//"+iterator+".jpg", 'orgImg');
	    	addToHistory();
	    }, 100);
	});
},false);