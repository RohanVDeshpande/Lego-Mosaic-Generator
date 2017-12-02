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

	    var kernel = [[1,1],[1,1]];

		console.log('2x2 Convolution Matrix:');
	    var convmatrix = convolution(matrix, kernel, true, true, true);
	    printMatrix(convmatrix);
	    console.log('Conv+Kernel Matrix:');
	    convmatrix = insertKernel(convmatrix, kernel);
	    printMatrix(convmatrix);
	    console.log('Substraction Matrix:')
	    matrix = matrixSubtract(matrix, convmatrix);
	    printMatrix(matrix);

	    kernel = [[1,1]];

	    convmatrix = convolution(matrix, kernel, true, true, true);
	    console.log('1x2 Conv:');
	    printMatrix(convmatrix);

	    console.log('Solution List:');
	    solList = solutionList(convmatrix, kernel)
	    for(var k = 0; k < solList.length; k++){
	    	console.log('Solution Number '+k);
	    	printMatrix(solList[k]);
	    }

	    /*
	    console.log('Conv+Kernel Matrix:')
	    convmatrix = insertKernel(convmatrix, [[1,1]]);
	    printMatrix(convmatrix);
		*/

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
//Parameters: input Matrix, kernel, should average T/F?, should round down T/F?, append 0 T/F?
//Return: convoluded matrix
*********************************************
//Applies convolusion to input matrix
*/
function convolution(matrix, kernel, average, round, append){
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
		if(append){
			convRow.push(0);
		}
		convMatrix.push(convRow);
	}
	if(append){
		var zeroRow = [];
		for(var k =0; k<matrixWidth+1;k++){
			zeroRow.push(0);
		}
		convMatrix.push(zeroRow)
	}
	return convMatrix;
}

/*
//solutionList(convMatrix, kernel)
//Parameters: convolution matrix, kernel
//Return: List of potential solutions
*********************************************
//Eliminates overlapping bricks...
//... iterates to create all potential solutions
*/

function solutionList(convMatrix, kernel){
	var kernelWidth = kernel[0].length;
	var kernelHeight = kernel.length;

	coordList = convCoordinates(convMatrix);

	var solutionMatrices = [];

	for(var k = 0; k < coordList.length; k++){
		var convMat = convMatrix;
		for(var i = coordList[k][1]; i < convMatrix.length - kernelHeight + 1; i++){
			for(var j = coordList[k][0]; j < convMatrix[0].length - kernelWidth + 1; j++){
				if(convMat[i][j] == 1){
					console.log('i:'+i+'\tj:'+j);
					for(var a = -1*kernelHeight+1; a < kernelHeight; a++){
						for(var b= -1*kernelWidth+1; b < kernelWidth; b++){
							console.log('a:'+a+'\tb:'+b);
							if(!(a==0 && b==0)){
								convMat[i+a][j+b] = 0;
								console.log('a:'+a+'\tb:'+b);
							}
						}
					}
				}
			}
		}
		solutionMatrices.push(convMat);
	}
	return solutionMatrices;
}

/*
//convCoordinates(convMat)
//Parameters: convolution Matrix
*********************************************
//Returns coordinates [[x1,y1],[x2,y2]...] of pixel
*/

function convCoordinates(convMatrix){
	var coordinates = [];
	for(var i = 0; i < convMatrix.length; i++){
		for(var j = 0; j < convMatrix[0].length; j++){
			if(convMatrix[i][j] == 1){
				var coordinate = [];
				coordinate.push(j);	//x coordinate
				coordinate.push(i); //y coordinate
				coordinates.push(coordinate);
			}
		}
	}
	console.log(coordinates);
	return coordinates;
}


/*
//Matrix Substraction Function
//Parameters: Matrix1, Matrix2
//Return Matrix3
*********************************************
//
*/

function matrixSubtract(matrix1, matrix2){
	if(matrix1.length == matrix2.length && matrix2[0].length == matrix1[0].length){
		var resMatrix = [];
		for(var i = 0; i<matrix1.length; i++){
			var resRow = [];
			for(var j = 0; j<matrix1[0].length; j++){
				var res = matrix1[i][j] - matrix2[i][j];
				resRow.push(res);
			}
			resMatrix.push(resRow);
		}
		return resMatrix;
	}
	else{
		return [];
	}
}

/*
//insertKernel(matrix, kernel)
*********************************************
//Insert Kernel into Convolution Matrix
*/

function insertKernel(matrix, kernel){
	var result = zero(matrix[0].length, matrix.length);
	for(var i = 0; i < matrix.length; i++){
		for(var j = 0; j < matrix[0].length; j++){
			if(matrix[i][j]==1){
				for(var a = 0; a < kernel.length; a++){
					for(var b=0; b < kernel[0].length; b++){
						result[i+a][j+b] = kernel[a][b];
					}
				}
			}
		}
	}

	return result;
}


/*
//Prints Matrix in console
*********************************************
//Make sure console timestamp is turned on...
//... so that console log does not stack
*/

function printMatrix(matrix){
	if(matrix == null){
		console.log("NULL Matrix ERR!");
		return;
	}
	var width = matrix[0].length;
	for(var i = 0; i<matrix.length;i++){
		var line = "";
		for(var j=0; j<width;j++){
			line+= matrix[i][j] +"  ";
		}
		console.log(line);
	}
}

/*
//zero(width, height)
*********************************************
//Create Zero Matrix of specified width and height
*/
function zero(width, height){
	var result = [];
	for(var i = 0; i< height; i++){
		var rowRes = [];
		for(var j = 0; j< width;j++){
			rowRes.push(0);
		}
		result.push(rowRes);
	}
	return result;
}