var app = require('electron').remote; 
var dialog = app.dialog;
var fs = require('fs');
var Jimp = require("jimp");
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
	    iterator = parseInt(document.getElementById('iterator').innerHTML);
	    console.log(iterator);
	    iterator++;
	    console.log(iterator);
	    document.getElementById('iterator').innerHTML = iterator;
	    img.write(path+iterator+".jpg");
	    document.getElementById('mWidth').value = img.bitmap.width;
		document.getElementById('mHeight').value = img.bitmap.height;
		setTimeout(function(){
			addToHistory();
		},100);
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
	    iterator = parseInt(document.getElementById('iterator').innerHTML);
	    iterator++;
	    document.getElementById('iterator').innerHTML = iterator;
	    img.write(".//temp//"+iterator+".jpg");
	    setTimeout(function(){
	    	updateImg(".//temp//"+iterator+".jpg", 'orgImg');
	    	addToHistory();
	    }, 100);
	});
},false);

function addToHistory(){
	iterator = parseInt(document.getElementById('iterator').innerHTML);
	document.getElementById('img-history').innerHTML = "<li><img src='.//temp//"+iterator+".jpg'></li>" + document.getElementById('img-history').innerHTML;
}