var fs = require('fs');
var Jimp = require("jimp");
var iterator = 0;
var path = ".//temp//";

function widthChange(){
	Jimp.read("./temp/"+iterator+".jpg", function (err, img) {
	    if (err){
	    	console.log(err)
	    }
	    width = parseInt(document.getElementById('mWidth').value);
    	height = Math.round(width/img.bitmap.width*img.bitmap.height);
    	document.getElementById('mHeight').value = height;
	});
}
function heightChange(){
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
    Jimp.read("./temp/"+iterator+".jpg", function (err, img) {
	    if (err){
	    	console.log(err)
	    }
	    width = parseInt(document.getElementById('mWidth').value);
	    height = parseInt(document.getElementById('mHeight').value);
	    img.resize(width,height);
	    iterator++;
	    img.write(".//temp//"+iterator+".jpg");
	    setTimeout(function(){
	    	updateImg(".//temp//"+iterator+".jpg", 'orgImg');
	    }, 100);
	});
},false);