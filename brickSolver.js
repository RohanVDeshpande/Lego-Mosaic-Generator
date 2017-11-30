var fs = require('fs');
var Jimp = require("jimp");
var path = ".//temp//";
var forEach = require('async-foreach').forEach;


/*
//function: brickInstructions()
*********************************************
//called from left panel icon...
//... reads black/whie image and constructs matrix
//runs 2x2 convolution (!in progress)
*/

function brickInstructions(){
	iterator = parseInt(document.getElementById('iterator').innerHTML);
	Jimp.read("./temp/"+iterator+".jpg", function (err, img) {
	    if (err){
	    	console.log(err)
	    }
	    var matrix = [];
	    for(var i =0; i<img.bitmap.height; i++){
	    	var row = [];
	    	for(var j=0; j<img.bitmap.width;j++){
	    		if(Jimp.intToRGBA(img.getPixelColor(j,i)).r>230){
	    			row.push(1);
	    		}
	    		else{
	    			row.push(0);
	    		}
	    	}
	    	matrix.push(row);
	    }
	    console.log('Matrix:');
	    printMatrix(matrix);
		console.log('Convolution Matrix:');
	    convolution(matrix, [[1,1],[1,1]], true, true);


	    iterator++;
	    document.getElementById('iterator').innerHTML = iterator;
	    img.write(".//temp//"+iterator+".jpg");
	    setTimeout(function(){
	    	updateImg(".//temp//"+iterator+".jpg", 'orgImg');
	    	addToHistory();
	    }, 100);
	});
}



/*
//Function: convolution()
//Parameters: input Matrix, kernel, should average T/F?, should round down T/F?
//Return: convoluded matrix
*********************************************
//Applies convolusion to input matrix
*/
function convolution(matrix, kernel, average, round){
	var matrixWidth = matrix[0].length;
	var matrixHeight = matrix.length;
	var kernelWidth = kernel[0].length;
	var kernelHeight = kernel.length;
	var convMatrix = [];
	for(var i = 0; i<matrixHeight - kernelHeight + 1; i++){
		var convRow = [];
		for(var j = 0; j<matrixWidth - kernelWidth + 1; j++){
			var sum = 0;
			for(var a=0; a< kernelHeight;a++){
				for(var b = 0; b<kernelWidth;b++){
					sum += matrix[i+a][j+b]*kernel[a][b];
				}
			}
			if(average){
				sum/= (kernelWidth * kernelHeight);
			}
			if(round){
				sum = Math.floor(sum);
			}
			convRow.push(sum);
		}
		convMatrix.push(convRow);
	}
	printMatrix(convMatrix);
}




/*
//Prints Matrix in console
*********************************************
//Make sure console timestamp is turned on...
//... so that console log does not stack
*/

function printMatrix(matrix){
	var width = matrix[0].length;
	for(var i = 0; i<matrix.length;i++){
		var line = "";
		for(var j=0; j<width;j++){
			line+= matrix[i][j] +" ";
		}
		console.log(line);
	}
}