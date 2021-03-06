var fs = require('fs');
var Jimp = require("jimp");
var path = ".//temp//";

//bool == true when it will check image size
function brickify(bool){
	iterator = parseInt(document.getElementById('iterator').innerHTML);
	document.getElementById('allColors').innerHTML = "";
	Jimp.read("./temp/"+iterator+".png", function (err, img) {
		if (err){
	    	console.log(err)
	    }
	    width = img.bitmap.width;
	    height = img.bitmap.height;
	    if(bool && width>300 && height>300){
	    	alert('Image Size is too large!<br>Are you sure you want to continue?');
	    }
	    else{
	    	for(var i =0; i<width;i++){
	    	for(var j=0; j<height;j++){
	    		//console.log(i+', '+j);
	    		color = Jimp.intToRGBA(img.getPixelColor(i,j));
	    		//console.log(color);
	    		pixelError(color, i, j);
		    	}
		    }

		    iterator++;
		    document.getElementById('iterator').innerHTML = iterator;
		    img.write(".//temp//"+iterator+".png");
		    setTimeout(function(){
		    	updateImg(".//temp//"+iterator+".png", 'orgImg');
		    	addToHistory();
		    }, 100);
	    }


	    function pixelError(pixelColor, x, y){
			var colors = [[39, 37, 31],[217, 217, 214],[100, 100, 100], [150, 150, 150], [55, 33, 0], [170, 125, 85], [137, 125, 98], [176, 160, 111], [0, 69, 26], [0, 133, 43], [112, 142, 124], [88, 171, 65], [252, 172, 0], [214, 121, 35], [30, 90, 168], [70, 155, 195], [157, 195, 247], [114, 0, 18], [180, 0, 0], [95, 49, 9]];
			//Black, white Dark Bluish Grey, Light Bluish Grey
			list2 = pixelColor;
			var min = 999;
			var minIndex = -1;
			forEach(colors, function(item, index, arr){
				var change = Math.pow(item[0]-list2.r,2)+Math.pow(item[1]-list2.g,2)+Math.pow(item[2]-list2.b,2);
				change = Math.sqrt(change);
				//console.log('Index: '+index+' Value: '+change);
				if(change < min){
					min = change;
					minIndex = index;
				}
			});
			img.setPixelColor(Jimp.rgbaToInt(colors[minIndex][0], colors[minIndex][1], colors[minIndex][2], 255), x, y);

			var ul = document.getElementById('allColors');
			var elements = ul.getElementsByTagName('li');
			if(elements != null){
				var addToList = true;
				for(var i =0; i<elements.length; i++){
					if(elements[i].innerHTML == colors[minIndex]){
						addToList = false;
					}
				}
			}
			if(elements == null || addToList == true){
				ul.innerHTML = "<li class='usedColor' style='background-color:rgb("+colors[minIndex]+");'>"+colors[minIndex]+"</li>" + ul.innerHTML;
			}
		}
	});



	//image.getPixelColor(x, y);
}