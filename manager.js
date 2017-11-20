var app = require('electron').remote; 
var dialog = app.dialog;
var fs = require('fs');
var Jimp = require("jimp");
var iterator = 0;
var path = ".//temp//";
    
document.getElementById('select-file').addEventListener('click',function(){
    dialog.showOpenDialog(function (fileNames) {
    	iterator = 0;
        if(fileNames === undefined){
            console.log("No file selected");
        }else{
        	updateImg(fileNames[0]);
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
	});
}
/*
function linkImage(imgPath, id){
	document.getElementById(id).src = imgPath;
}
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
document.getElementById('Grayscale').addEventListener('click',function(){
    Jimp.read("./temp/"+iterator+".jpg", function (err, img) {
	    if (err){
	    	console.log(err)
	    }
	    img.greyscale();
	    iterator++;
	    img.write(".//temp//"+iterator+".jpg");
	    setTimeout(function(){
	    	updateImg(".//temp//"+iterator+".jpg", 'orgImg');
	    }, 100);
	});
},false);