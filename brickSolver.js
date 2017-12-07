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
	    
	    var kernelObj = [
	    	{
	    		legoid:3022,
	    		data:[[1,1],[1,1]],
	    		key:'2x2',
	    		price:0.05,
	    		color:[26, 188, 156]
	    	},
	    	{
	    		legoid:3023,
	    		data:[[1,1]],
	    		key:'2x1',
	    		price:0.04,
	    		color:[211, 84, 0]
	    	},
	    	{
	    		legoid:3023,
	    		data:[[1],[1]],
	    		key:'1x2',
	    		price:0.04,
	    		color:[41, 128, 185]
	    	},
	    	{
	    		legoid:3024,
	    		data:[[1]],
	    		key:'1x1',
	    		price:0.07,
	    		color:[142, 68, 173]
	    	},
	    ];

	    //kernelObj.length
	    for(var a = 0; a<kernelObj.length;a++){
	    	//kernelObj[a].data, kernelObj[a].key
	    	//kernelList[a], kernelKey[a]
	    	allSolutions = solutionController(allSolutions, kernelObj[a].data, kernelObj[a].key);
	    }
	    console.log('Total Number of Solutions:'+ allSolutions.length);
	    var minIndex = optimizeCost(allSolutions, kernelObj);
	    console.log('Min Cost Mat:');
	    console.log(allSolutions[minIndex]);
	    for(var i = 0; i<allSolutions[minIndex].ConvMat.length; i++){
	    	console.log('Round '+(i+1));
	    	var iKer = insertKernel(allSolutions[minIndex].ConvMat[i],kernelObj[i].data);
	    	printMatrix(iKer);
	    	for(var l = 0; l < iKer.length;l++){
	    		for(var w = 0; w< iKer[0].length;w++){
	    			if(iKer[l][w]==1){
	    				var color = kernelObj[i].color;
	    				img.setPixelColor(Jimp.rgbaToInt(color[0], color[1], color[2], 255),w,l);
	    			}
	    		}
	    	}
	    }
	    prevWidth = parseInt(document.getElementById('imgWidth').innerHTML);
		prevHeight = parseInt(document.getElementById('imgHeight').innerHTML);

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
    	//console.log(solList);
    	for(var l = 0; l < solList.length; l++){
    		tempSolutions.push(solList[l]);
    	}
    }
    /*
	for(var k = 0; k<tempSolutions.length; k++){
		console.log(tempSolutions[k]);
		printMatrix(tempSolutions[k].data);
	}*/
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
		//console.log('Before:');
		//printMatrix(convMatrix);
		var convMat = copyMat(convMatrix);
		var elementNums = 0;
		for(var i = coordList[k][1]; i < convMatrix.length + coordList[k][1]; i++){
			var start = 0;
			if(i==coordList[k][1]){
				start = coordList[k][0];
			}
			for(var j = start; j < convMatrix[0].length; j++){
				if(convMat[i%convMatrix.length][j] == 1){
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
		//console.log(solutionMatrices.length);
		//printMatrix(convMat)
		if(!matInList(solutionMatrices, convMat)){
			//console.log('^not in list')
			var iKer = insertKernel(convMat, kernel);
			var sub = matrixSubtract(orgObject.data, iKer);
			//printMatrix(sub);
			var temp;
			if(kernelKey == '2x2'){
				temp = editQty(sub, orgObject.Qty.N2x2+elementNums, orgObject.Qty.N2x1, orgObject.Qty.N1x2, orgObject.Qty.N1x1, orgObject.ConvMat, convMat);
			}
			else if(kernelKey == '2x1'){
				temp = editQty(sub, orgObject.Qty.N2x2, orgObject.Qty.N2x1+elementNums, orgObject.Qty.N1x2, orgObject.Qty.N1x1, orgObject.ConvMat, convMat);
			}
			else if(kernelKey == '1x2'){
				temp = editQty(sub, orgObject.Qty.N2x2, orgObject.Qty.N2x1, orgObject.Qty.N1x2+elementNums, orgObject.Qty.N1x1, orgObject.ConvMat, convMat);
			}
			else if(kernelKey == '1x1'){
				temp = editQty(sub, orgObject.Qty.N2x2, orgObject.Qty.N2x1, orgObject.Qty.N1x2, orgObject.Qty.N1x1+elementNums, orgObject.ConvMat, convMat);
			}
			//console.log(temp);
			solutionMatrices.push(temp);
		}
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
	//console.log(coordinates);
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
//optimizeCost(allSolutions, kernelObj)
*********************************************
//finds solution with lowest cost.
//returns index of solution with lowest cost
*/

function optimizeCost(allSolutions, kernelObj){
	var minIndex = 0;
	var minCost = 0;
	for(var k = 0; k<allSolutions.length;k++){
		var cost = calculateCost(allSolutions[k],kernelObj);
		if(k==0 || cost<minCost){
			minIndex = k;
			minCost = cost
		}
	}
	console.log('Min Cost: '+minCost);
	return minIndex;
}



/*
//calculateCost(matObj, kernelObj)
*********************************************
//calculates cost. stores in matObj, and returns cost
*/
function calculateCost(matObj, kernelObj){
	var result = 0;
	result += matObj.Qty.N2x2 * kernelObj[0].price;
	result += matObj.Qty.N2x1 * kernelObj[1].price;
	result += matObj.Qty.N1x2 * kernelObj[2].price;
	result += matObj.Qty.N1x1 * kernelObj[3].price;
	matObj.Qty.cost = result;
	return result;
}

/*
//editQty(inputMatrix, inputN2x2, inputN2x1, inputN1x2, inputN1x1, oldConv, newConv)
*********************************************
//creates object that with new brick quantity
*/


function editQty(inputMatrix, inputN2x2, inputN2x1, inputN1x2, inputN1x1, oldConv, newConv){
	var list = []
	for(var i = 0; i<oldConv.length;i++){
		list.push(oldConv[i]);
	}
	list.push(newConv);
	var object = {
		data: inputMatrix,
		Qty:{
			Cost:0,
			N2x2:inputN2x2,
			N2x1:inputN2x1,
			N1x2:inputN1x2,
			N1x1:inputN1x1
		},
		ConvMat:list
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
			Cost:0,
			N2x2:0,
			N2x1:0,
			N1x2:0,
			N1x1:0
		},
		ConvMat:[]
	}
	return object;
}

/*
//matEquals(matrix1, matrix2)
*********************************************
//Returns true if both matrices are equal
*/

function matEquals(matrix1, matrix2){
	//console.log('Matrix 1:');
	//printMatrix(matrix1);
	//console.log('Matrix 2:');
	//printMatrix(matrix2);
	if(matrix1.length == matrix2.length && matrix1[0].length == matrix2[0].length){
		var isEqual = true;
		for(var i = 0; i < matrix1.length; i++){
			for(var j = 0; j < matrix1[0].length; j++){
				if(matrix1[i][j] != matrix2[i][j]){
					isEqual = false;
				}
			}
		}
		return isEqual;
	}
	else{
		console.log('dimension error');
		return false;
	}
}

/*
//matInList(matList, matrix2)
*********************************************
//Returns true if both matrices are equal
*/

function matInList(matListObj, matrix1){
	var inList = false;
	for(var r = 0; r<matListObj.length;r++){
		if(matEquals(matListObj[r].ConvMat[matListObj[r].ConvMat.length-1],matrix1)){
			inList = true;
		}
	}
	return inList;
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

function copyMat(inputMatrix){
	var newMat = [];
	for(var i = 0; i< inputMatrix.length; i++){
		var rowRes = [];
		for(var j = 0; j< inputMatrix[0].length; j++){
			rowRes.push(inputMatrix[i][j]);
		}
		newMat.push(rowRes);
	}
	return newMat;
}


document.getElementById('addGrid').addEventListener('click',function(){
	iterator = parseInt(document.getElementById('iterator').innerHTML);
	Jimp.read("./temp/"+iterator+".jpg", function (err, img) {
	    if (err){
	    	console.log(err)
	    }
	    prevWidth = img.bitmap.width;
		prevHeight = img.bitmap.height;

		var gridImg = new Jimp(prevWidth*20, prevHeight*20, 0x000000FF, function (err, gridImg) {
		    for(var i = 0; i<prevHeight; i++){
		    	for(var j = 0; j<prevWidth; j++){
		    		var color = img.getPixelColor(j,i);
		    		for(var a = 0; a<20; a++){
		    			for(var b = 0; b<20; b++){
		    				gridImg.setPixelColor(color,j*20+a,i*20+b);
		    			}
		    		}
		    	}
		    }

		    for(var i = 0; i < prevWidth; i++){
		    	for(var j = 0; j<prevHeight*20; j++){
		    		gridImg.setPixelColor(Jimp.rgbaToInt(255,255,255, 255), i*20, j);
		    	}
		    }
		    for(var i = 0; i < prevHeight; i++){
		    	for(var j = 0; j<prevWidth*20; j++){
		    		gridImg.setPixelColor(Jimp.rgbaToInt(255,255,255, 255), j, i*20);
		    	}
		    }
		});
	    
	    iterator++;
	    document.getElementById('iterator').innerHTML = iterator;
	    gridImg.write(".//temp//"+iterator+".jpg");
	    setTimeout(function(){
	    	updateImg(".//temp//"+iterator+".jpg", 'orgImg');
	    	document.getElementById('imgWidth').innerHTML = gridImg.bitmap.width;
			document.getElementById('imgHeight').innerHTML = gridImg.bitmap.height;
	    	addToHistory();
	    }, 100);
	});
},false);