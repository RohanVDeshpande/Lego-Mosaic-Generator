//Generate Color Palette in HTML
$(document).ready(function(){
	var colors = [[39, 37, 31],[217, 217, 214],[100, 100, 100], [150, 150, 150], [55, 33, 0], [170, 125, 85], [137, 125, 98], [176, 160, 111], [0, 69, 26], [0, 133, 43], [112, 142, 124], [88, 171, 65], [252, 172, 0], [214, 121, 35], [30, 90, 168], [70, 155, 195], [157, 195, 247], [114, 0, 18], [180, 0, 0], [95, 49, 9]];
	$.each(colors, function(index, value){
		$('#colorPalette').append("<li class='colorPalElm' style='background-color:rgb("+value+")'></li>");
	});
})


//Click Colors that were used in image
$(document).on('click', '.usedColor', function () {
	$('.selectedColor').removeClass('selectedColor');
	$(this).addClass('selectedColor');
});

//Click Colors from color palette
$(document).on('click', '.colorPalElm', function () {
	$('.colorPalSelected').removeClass('colorPalSelected');
	$(this).addClass('colorPalSelected');
});

function changeColor(){
	console.log('changeColor');
	iterator = parseInt(document.getElementById('iterator').innerHTML);
	Jimp.read("./temp/"+iterator+".jpg", function (err, img) {
		if (err){
	    	console.log(err)
	    }
	    var previousColorStr = document.getElementsByClassName('selectedColor')[0].style.backgroundColor;
	    var previousColor = previousColorStr.substring(4, previousColorStr.length-1).replace(/ /g,'').split(',');
	    console.log(previousColor);
	    var newColorStr = document.getElementsByClassName('colorPalSelected')[0].style.backgroundColor;
	    var newColor = newColorStr.substring(4, newColorStr.length-1).replace(/ /g,'').split(',');
	    var newHex = Jimp.rgbaToInt(parseInt(newColor[0]),parseInt(newColor[1]),parseInt(newColor[2]),255);
	    console.log(newColor);
		for(var i =0; i<width;i++){
	    	for(var j=0; j<height;j++){
	    		//console.log(i+', '+j);
	    		color = Jimp.intToRGBA(img.getPixelColor(i,j));
	    		diff = Math.pow(color.r-parseInt(previousColor[0]),2)+Math.pow(color.g-parseInt(previousColor[1]),2)+Math.pow(color.b-parseInt(previousColor[2]),2);
	    		if(diff<20){
	    			console.log(diff);
	    			img.setPixelColor(newHex,i,j);
	    		}

	    	}
	    }
	    
	    var ul = document.getElementById('allColors');
		var elements = ul.getElementsByTagName('li');
		if(elements != null){
			var addColor = true;
			var addColorIndex = -1;
			var removeColorIndex = -1;
			console.log(previousColor);
			console.log(newColor);
			for(var i =0; i<elements.length; i++){
				var panelColorStr = elements[i].style.backgroundColor;
				var panelColor = panelColorStr.substring(4, panelColorStr.length-1).replace(/ /g,'').split(',');
				
				console.log(panelColor);
				if(panelColor[0] == previousColor[0] && panelColor[1] == previousColor[1] && panelColor[2] == previousColor[2]){
					addColorIndex = i;
					console.log('true')
				}
				else if(panelColor[0] == newColor[0] && panelColor[1] == newColor[1] && panelColor[2] == newColor[2]){
					addColor = false;
					removeColorIndex = i;
				}
			}
			if(addColor){
				elements[addColorIndex].style.backgroundColor = newColorStr;
				elements[addColorIndex].innerHTML = newColor;
			}
			else{
				elements[addColorIndex].outerHTML = "";
			}
		}
		
	    iterator++;
	    document.getElementById('iterator').innerHTML = iterator;
	    img.write(".//temp//"+iterator+".jpg");
	    setTimeout(function(){
	    	updateImg(".//temp//"+iterator+".jpg", 'orgImg');
	    	addToHistory();
	    }, 100);

	});
}