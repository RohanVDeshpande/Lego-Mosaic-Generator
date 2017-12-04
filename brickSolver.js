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

	    var allSolutions = [];
	    allSolutions.push(makeObject(matrix));

	    var kernel1 = [[1,1],[1,1]];
	    var kernel2 = [[1,1]];
	    var kernel3 = [[1],[1]];
	    var kernel4 = [[1]];

	    var kernelList = [];
	    kernelList.push(kernel1);
	    kernelList.push(kernel2);
	    kernelList.push(kernel3);
	    kernelList.push(kernel4);

	    var kernelKey = [];
	    kernelKey1 = '2x2';
	    kernelKey2 = '2x1';
	    kernelKey3 = '1x2';
	    kernelKey4 = '1x1';

	    kernelKey.push(kernelKey1);
	    kernelKey.push(kernelKey2);
	    kernelKey.push(kernelKey3);
	    kernelKey.push(kernelKey4);

	    //kernelList.length
	    for(var a = 0; a<2;a++){
	    	console.log('round '+a);
	    	allSolutions = solutionController(allSolutions, kernelList[a], kernelKey[a]);
	    }
	    /*
	    for(var k=0; k<allSolutions.length;k++){
	    	var tempConv = convolution(allSolutions[k].data, kernel, true, true, true);
	    	solList = solutionList(tempConv, kernel,allSolutions[k]);
	    	for(var l = 0; l < solList.length; l++){
	    		tempSolutions.push(solList[l]);
	    	}
	    }
	    for(var k = 0; k<tempSolutions.length; k++){
	    	console.log(tempSolutions[k]);
	    	printMatrix(tempSolutions[k].data);
	    }
		*/
	    /*
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
	    */

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
//Function: solutionController()
//Parameters: input Matrix, kernel, should average T/F?, should round down T/F?, append 0 T/F?
//Return: convoluded matrix
*********************************************
//Applies convolusion to input matrix
*/
function solutionController(solutions, kernel, kernelKey){
	var tempSolutions = [];
	for(var k=0; k<solutions.length;k++){
    	var tempConv = convolution(solutions[k].data, kernel, true, true);
    	solList = solutionList(tempConv, kernel,solutions[k], kernelKey);
    	console.log(solList);
    	for(var l = 0; l < solList.length; l++){
    		tempSolutions.push(solList[l]);
    	}
    }
	for(var k = 0; k<tempSolutions.length; k++){
		console.log(tempSolutions[k]);
		printMatrix(tempSolutions[k].data);
	}
	return tempSolutions;
}


/*
//Function: convolution()
//Parameters: input Matrix, kernel, should average T/F?, should round down T/F?, append 0 T/F?
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
		for(b =0; b<kernelWidth-1;b++){
			convRow.push(0);
		}
		convMatrix.push(convRow);
	}
	for(var a =0; a<kernelHeight-1;a++){
		zeroRow = [];
		for(var b =0; b<kernelWidth-1;b++){
			zeroRow.push(0);
		}
		convMatrix.push(zeroRow);
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

function solutionList(convMatrix, kernel, orgObject, kernelKey){

	var kernelWidth = kernel[0].length;
	var kernelHeight = kernel.length;

	coordList = convCoordinates(convMatrix);

	var solutionMatrices = [];

	for(var k = 0; k < coordList.length; k++){
		console.log('Before:');
		printMatrix(convMatrix);
		var convMat = convMatrix;
		var elementNums = 0;
		for(var i = coordList[k][1]; i < convMatrix.length + coordList[k][1]; i++){
			var start = 0;
			if(i==coordList[k][1]){
				start = coordList[k][0];
			}
			console.log('start: '+start);
			for(var j = start; j < convMatrix[0].length; j++){
				if(convMat[i%convMatrix.length][j] == 1){
					console.log('i:'+i+'\tj:'+j);
					for(var a = -1*kernelHeight+1; a < kernelHeight; a++){
						for(var b= -1*kernelWidth+1; b < kernelWidth; b++){
							//console.log('a:'+a+'\tb:'+b);
							if(!(a==0 && b==0)){
								convMat[(i+a)%convMatrix.length][(j+b)%convMatrix[0].length] = 0;
								//console.log('a:'+a+'\tb:'+b);
							}
						}
					}
					elementNums++;
					//console.log('i: '+i+'\t'+'j: '+j);
				}
			}
		}
		console.log('ConvMat:');
		printMatrix(convMat);
		var iKer = insertKernel(convMat, kernel);
		var sub = matrixSubtract(orgObject.data, iKer);
		//printMatrix(sub);
		var temp;
		if(kernelKey == '2x2'){
			temp = editQty(sub, orgObject.Qty.N2x2+elementNums, orgObject.Qty.N2x1, orgObject.Qty.N1x2, orgObject.Qty.N1x1);
		}
		else if(kernelKey == '2x1'){
			temp = editQty(sub, orgObject.Qty.N2x2, orgObject.Qty.N2x1+elementNums, orgObject.Qty.N1x2, orgObject.Qty.N1x1);
		}
		else if(kernelKey == '1x2'){
			temp = editQty(sub, orgObject.Qty.N2x2, orgObject.Qty.N2x1, orgObject.Qty.N1x2+elementNums, orgObject.Qty.N1x1);
		}
		else if(kernelKey == '1x1'){
			temp = editQty(sub, orgObject.Qty.N2x2, orgObject.Qty.N2x1, orgObject.Qty.N1x2, orgObject.Qty.N1x1+elementNums);
		}
		//console.log(temp);
		solutionMatrices.push(temp);
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
		console.log('out of bounds');
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
//editQty(inputMatrix, inputN2x2, inputN2x1, inputN1x2, inputN1x1)
*********************************************
//creates object that with new brick quantity
*/


function editQty(inputMatrix, inputN2x2, inputN2x1, inputN1x2, inputN1x1){
	var object = {
		data: inputMatrix,
		Qty:{
			N2x2:inputN2x2,
			N2x1:inputN2x1,
			N1x2:inputN1x2,
			N1x1:inputN1x1
		}
	}
	return object;
}


/*
//makeObject(inputMatrix)
*********************************************
//creates object that stores the matrix and number of each brick
*/


function makeObject(inputMatrix){
	var object = {
		data: inputMatrix,
		Qty:{
			N2x2:0,
			N2x1:0,
			N1x2:0,
			N1x1:0
		}
	}
	return object;
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
	for(var i = 0; i<matrix.length;i++){
		var line = "";
		for(var j=0; j<matrix[0].length;j++){
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

/*
//copyMat(inputMat)
*********************************************
//copies maxtrix and returns new matrix
*/

function copyMat(inputMat){
	var newMat = [];
	for(var i = 0; i< inputMat.length; i++){
		var rowRes = [];
		for(var j = 0; j< inputMatrix[0].length; j++){
			rowRes.push(inputMatrix[i][j]);
		}
		newMat.push(rowRes);
	}
	return newMat;
}