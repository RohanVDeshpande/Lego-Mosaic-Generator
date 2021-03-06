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
	    img.write(path+iterator+".png");
	    document.getElementById('mWidth').value = img.bitmap.width;
		document.getElementById('mHeight').value = img.bitmap.height;
		document.getElementById('imgWidth').innerHTML = img.bitmap.width;
		document.getElementById('imgHeight').innerHTML = img.bitmap.height;
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
	    lenna.write(".//temp//temp.png");
	    setTimeout(function(){
	    	linkImage("./temp/temp.png", 'mosImg');
	    }, 100);
	});
}*/
function makeGrayscale(){
	iterator = parseInt(document.getElementById('iterator').innerHTML);
	Jimp.read("./temp/"+iterator+".png", function (err, img) {
	    if (err){
	    	console.log(err)
	    }
	    img.greyscale();
	    iterator = parseInt(document.getElementById('iterator').innerHTML);
	    iterator++;
	    document.getElementById('iterator').innerHTML = iterator;
	    img.write(".//temp//"+iterator+".png");
	    setTimeout(function(){
	    	updateImg(".//temp//"+iterator+".png", 'orgImg');
	    	addToHistory();
	    }, 100);
	});
}

function addToHistory(){
	iterator = parseInt(document.getElementById('iterator').innerHTML);
	document.getElementById('img-history').innerHTML = "<li id='wrap"+iterator+"'><img id='"+iterator+"' onclick='restoreHistory(this.id)' src='.//temp//"+iterator+".png?"+(new Date()).getTime()+"'><span>"+iterator+"</span></li>" + document.getElementById('img-history').innerHTML;
}
function restoreHistory(objectID){
	document.getElementById('allColors').innerHTML = "";
	updateImg(".//temp//"+objectID+".png", 'orgImg');
	updateDimensions(".//temp//"+objectID+".png");
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

function changePanel(id){
	console.log(id);
	var activeObj = document.getElementsByClassName('active')[0]
	if(activeObj != null){
		activeObj.classList.remove("active");
	}
	if(id == 'changeDimensions'){
		document.getElementById('dimensions').classList.add("active");
	}
	else if(id == 'togglePaint'){
		document.getElementById('paint').classList.add("active");
	}
	else if(id == 'instructions-toggle'){
		document.getElementById('instructions').classList.add("active");
	}
}
function updateDimensions(path){
	Jimp.read(path, function (err, img) {
	    if (err){
	    	console.log(err)
	    }
	    document.getElementById('imgWidth').innerHTML = img.bitmap.width;
	    document.getElementById('mWidth').value = img.bitmap.width
		document.getElementById('imgHeight').innerHTML = img.bitmap.height;
		document.getElementById('mHeight').value = img.bitmap.height
	});
}