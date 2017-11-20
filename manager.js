var app = require('electron').remote; 
var dialog = app.dialog;
var fs = require('fs');
var Jimp = require("jimp");
var iterator = 0;
var path = ".//temp//";
var globalWidth = 0;
    
document.getElementById('select-file').addEventListener('click',function(){
    dialog.showOpenDialog(function (fileNames) {
    	iterator = 0;
        if(fileNames === undefined){
            console.log("No file selected");
        }else{
            linkImage(fileNames[0],'orgImg');
            copyImage(fileNames[0]);
        }
    }); 
},false);
function copyImage(imgPath){
	Jimp.read(imgPath, function (err, img) {
		if (err){
	    	console.log(err)
	    }
	    iterator++;
	    img.write(path+iterator+".jpg");
	    document.getElementById('mWidth').value = img.bitmap.width;
		document.getElementById('mHeight').value = img.bitmap.height;
		if(iterator == 1){
			globalWidth = img.bitmap.width;
			document.getElementById('orgImg').style = "width:"+globalWidth+"px;";
		}
	});
}
document.getElementById('MosaicDimensions').addEventListener('click',function(){
    Jimp.read("./temp/"+iterator+".jpg", function (err, lenna) {
	    if (err){
	    	console.log(err)
	    }
	    width = document.getElementById('mWidth').value;
	    height = document.getElementById('mHeight').value;
	    if(width.includes("%")){
	    	width = parseInt(lenna.bitmap.width * parseInt(width)/100);
	    	document.getElementById('mWidth').value = width;
	    }
	    if(height.includes("%")){
	    	height = parseInt(lenna.bitmap.height * parseInt(height)/100);
	    	document.getElementById('mHeight').value = height;
	    }
	    if(!(width.includes("%") && height.includes("%"))){
	    	width = parseInt(width);
	    	height = parseInt(height);
	    }
	    console.log(width);
	    console.log(height);
	    lenna.resize(width,height);
	    lenna.write(".//temp//"+iterator+".jpg");
	    setTimeout(function(){
	    	linkImage(".//temp//"+iterator+".jpg", 'orgImg');
	    }, 100);
	});
},false);
function linkImage(imgPath, id){
	document.getElementById(id).src = imgPath;
}
/*
 function linkOrgImage(imgPath){
	linkImage(imgPath, 'orgImg');
	Jimp.read(imgPath, function (err, lenna) {
	    if (err){
	    	console.log(err)
	    }
	    lenna.greyscale();                 // set greyscale 
	    lenna.write(".//temp//temp.jpg");
	    setTimeout(function(){
	    	linkImage("./temp/temp.jpg", 'mosImg');
	    }, 100);
	});
}*/