var app = require('electron').remote; 
var dialog = app.dialog;
var fs = require('fs');
var Jimp = require("jimp");
var path = ".//temp//";
var forEach = require('async-foreach').forEach;
    
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
	document.getElementById('img-history').innerHTML = "<li id='wrap"+iterator+"'><img id='"+iterator+"' onclick='restoreHistory(this.id)' src='.//temp//"+iterator+".jpg?"+(new Date()).getTime()+"'><span>"+iterator+"</span></li>" + document.getElementById('img-history').innerHTML;
}
function restoreHistory(objectID){
	updateImg(".//temp//"+objectID+".jpg", 'orgImg');
	recreateHistory(objectID);
}
function recreateHistory(objectID){
	var ul = document.getElementById('img-history');
	var elements = ul.getElementsByTagName('li');
	forEach(elements, function(item, index, arr) {
	  num = parseInt(item.id.substring(4));
	  if(num > objectID){
	  	console.log(num);
	  	deleteObj(num);

	  }
	  //deleteObj(num);
	});
	setTimeout(function(){
		document.getElementById('iterator').innerHTML = objectID;
	},200)
}
function deleteObj(number){
	console.log('deleting '+number);
	//document.getElementById('wrap'+number).outerHTML = "";
	setTimeout(function(){
		document.getElementById('wrap'+number).outerHTML = "";
	},100);
}