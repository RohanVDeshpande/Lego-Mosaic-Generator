var fs = require('fs');
var Jimp = require("jimp");
var path = ".//temp//";
var forEach = require('async-foreach').forEach;

var savedSteps = 0;

var colors = [[39, 37, 31],[217, 217, 214],[100, 100, 100], [150, 150, 150], [55, 33, 0], [170, 125, 85], [137, 125, 98], [176, 160, 111], [0, 69, 26], [0, 133, 43], [112, 142, 124], [88, 171, 65], [252, 172, 0], [214, 121, 35], [30, 90, 168], [70, 155, 195], [157, 195, 247], [114, 0, 18], [180, 0, 0], [95, 49, 9]];

var kernelObj = [
	    	/*{
	    		legoid:3020,
	    		data:[[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1]],
	    		key:'8x6',
	    		price:0.36,
	    		color:[231, 76, 60]
	    	},
	    	{
	    		legoid:3020,
	    		data:[[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]],
	    		key:'6x4',
	    		price:0.18,
	    		color:[39, 174, 96]
	    	},
	    	{
	    		legoid:3020,
	    		data:[[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],
	    		key:'4x4',
	    		price:0.12,
	    		color:[46, 204, 113]
	    	},
	    	{
	    		legoid:3020,
	    		data:[[1,1,1,1],[1,1,1,1]],
	    		key:'4x2',
	    		price:0.06,
	    		color:[241, 196, 15]
	    	},
	    	{
	    		legoid:3020,
	    		data:[[1,1,],[1,1],[1,1],[1,1]],
	    		key:'2x4',
	    		price:0.06,
	    		color:[231, 76, 60]
	    	},
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
	    	*/{
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

var pixMat = [];
var copyPixMat = [];
/*
//function: brickInstructions()
*********************************************
//called from left panel icon...
//... reads black/whie image and constructs matrix
//runs 2x2 convolution (!in progress)
*/

function separateImage(){
	iterator = parseInt(document.getElementById('iterator').innerHTML);
	Jimp.read("./temp/"+iterator+".png", function (err, img) {
	    if (err){
	    	console.log(err)
	    }
	    for(var j = 0; j<img.bitmap.width;j++){
	    	var matRow = [];
	    	for(var i = 0; i<img.bitmap.height;i++){
	    		for(var l = 0; l<colors.length;l++){
	    			color = Jimp.intToRGBA(img.getPixelColor(i,j));
		    		if(color.r == colors[l][0] && color.g == colors[l][1] && color.b == colors[l][2]){
		    			matRow.push(l);
		    			l=colors.length;
		    		}
	    		}
	    	}
	    	pixMat.push(matRow);
	    }
	    printMatrix(pixMat);

	    /*
	    var searchVal = pixMat[0][0];
	    console.log('searching for: '+searchVal);
		var region = [];
		var point1 = [0,0];
		region.push(point1);
		region.concat(searchForVal(searchVal, 0 , 0, pixMat.length, pixMat[0].length));
		printMatrix(pixMat);
		*/
		removeMat = copyMat(pixMat);
		copyPixMat = copyMat(pixMat);

		var allRegions = [];

	    for(var i = 0; i<pixMat.length;i++){
	    	for(var j = 0; j<pixMat[0].length;j++){
	    		//console.log('i: '+i+"\t j: "+j);
	    		if(removeMat[i][j] != -1){
	    			pixMat = copyMat(copyPixMat);
	    			var searchVal = pixMat[i][j];
	    			pixMat[i][j] = -1;
	    			removeMat[i][j] = -1;
	    			console.log('searching for: '+searchVal);
	    			searchForVal(searchVal, i , j);
	    			var bin = binaryTransform(pixMat);
	    			allRegions.push(bin);
	    			//printMatrix(bin);
	    		}	
	    	}
	    }
	    console.log(allRegions);
	    brickInstructions(img, allRegions[0]);
	});
}

function searchForVal(searchVal, i ,j){
	var maxHeight = pixMat.length;
	var maxWidth = pixMat[0].length;
	//UP ROW (Left, Center, Right)
	if(i>0 && j>0 && pixMat[i-1][j-1] == searchVal){
		removeMat[i-1][j-1] = -1;
		pixMat[i-1][j-1] = -1;
		searchForVal(searchVal, i-1 , j-1);
	}
	if(i>0 && pixMat[i-1][j] == searchVal){
		removeMat[i-1][j] = -1;
		pixMat[i-1][j] = -1;
	    searchForVal(searchVal, i-1 , j);
	}
	if(i>0 && j< maxWidth -1 && pixMat[i-1][j+1] == searchVal){
		removeMat[i-1][j+1] = -1;
		pixMat[i-1][j+1] = -1;
		searchForVal(searchVal, i-1 , j+1);
	}
	//Center Row (Left, Right)
	if(j>0 && pixMat[i][j-1] == searchVal){
		removeMat[i][j-1] = -1;
		pixMat[i][j-1] = -1;
	    searchForVal(searchVal, i, j-1);
	}
	if(j< maxWidth -1 && pixMat[i][j+1] == searchVal){
		removeMat[i][j+1] = -1;
		pixMat[i][j+1] = -1;
	    searchForVal(searchVal, i , j+1);
	}

	//Bottom Row (Left, Center, Right)
	if(i< maxHeight -1 && j>0 && pixMat[i+1][j-1] == searchVal){
		removeMat[i+1][j-1] = -1;
		pixMat[i+1][j-1] = -1;
	    searchForVal(searchVal, i+1 , j-1);
	}
	if(i< maxHeight -1 && pixMat[i+1][j] == searchVal){
		removeMat[i+1][j] = -1;
		pixMat[i+1][j] = -1;
	    searchForVal(searchVal, i+1 , j);
	}
	if(i< maxHeight -1 && j< maxWidth - 1 && pixMat[i+1][j+1] == searchVal){
		removeMat[i+1][j+1] = -1;
		pixMat[i+1][j+1] = -1;
	    searchForVal(searchVal, i+1 , j+1);
	}
}

function brickInstructions(img, matrix){
	printMatrix(matrix);

	var t0 = performance.now();
    var allSolutions = [];
    allSolutions.push(makeObject(matrix));
    
    //kernelObj.length
    for(var a = 0; a<kernelObj.length;a++){
    	allSolutions = solutionController(allSolutions, kernelObj[a]);
    	console.log(kernelObj[a].key);
    	var sum = 0;
	    for(var i = 0; i < allSolutions.length; i++){
	    	var string = "";
	    	var cost = allSolutions[i].Qty.Cost;
	    	sum += cost;
	    	string += Math.round(cost * 100) / 100;
	    	for(var j = 0; j<allSolutions[i].Qty.QtyMat.length; j++){
	    		string += "\t";
	    		string += allSolutions[i].Qty.QtyMat[j];
	    	}
	    }
	    var average = sum/allSolutions.length;
	    console.log('Cost Average was ' + average);


	    var squareDeviationSum = 0;
	    for(var i = 0; i < allSolutions.length; i++){
	    	squareDeviationSum += Math.pow((allSolutions[i].Qty.Cost - average),2);
	    }
	    squareDeviationSum /= allSolutions.length;
	    var stdev = Math.sqrt(squareDeviationSum);
	    console.log('Standard Deviation was ' + stdev);

	    var itemsRemoved = 0;
	    var upperBound = average + 0.04 * (kernelObj.length - a) * stdev;
	    for(var i = allSolutions.length - 1; i > -1; i--){
	    	if(allSolutions[i].Qty.Cost > upperBound){
	    		//console.log(i+' was removed');
	    		allSolutions.splice(i, 1);
	    		itemsRemoved++;
	    	}
	    }
	    console.log(itemsRemoved + ' items were removed');
    }

    var t1 = performance.now();
	console.log("Solver Algorithm took " + (t1 - t0) + " milliseconds.")

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
}

/*function brickInstructions(){

	var t0 = performance.now();

	iterator = parseInt(document.getElementById('iterator').innerHTML);
	Jimp.read("./temp/"+iterator+".png", function (err, img) {
	    if (err){
	    	console.log(err)
	    }
	    var matrix = [];
	    for(var i =0; i<img.bitmap.height; i++){
	    	var row = [];
	    	for(var j=0; j<img.bitmap.width;j++){
	    		var color = Jimp.intToRGBA(img.getPixelColor(j,i));
	    		if(color.r>230 && color.g>230 && color.b>230){
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
	    		legoid:3020,
	    		data:[[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1]],
	    		key:'8x6',
	    		price:0.36,
	    		color:[231, 76, 60]
	    	},
	    	{
	    		legoid:3020,
	    		data:[[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]],
	    		key:'6x4',
	    		price:0.18,
	    		color:[39, 174, 96]
	    	},
	    	{
	    		legoid:3020,
	    		data:[[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],
	    		key:'4x4',
	    		price:0.12,
	    		color:[46, 204, 113]
	    	},
	    	{
	    		legoid:3020,
	    		data:[[1,1,1,1],[1,1,1,1]],
	    		key:'4x2',
	    		price:0.06,
	    		color:[241, 196, 15]
	    	},
	    	{
	    		legoid:3020,
	    		data:[[1,1,],[1,1],[1,1],[1,1]],
	    		key:'2x4',
	    		price:0.06,
	    		color:[231, 76, 60]
	    	},
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
	    	allSolutions = solutionController(allSolutions, kernelObj[a]);
	    	console.log(kernelObj[a].key);
	    	var sum = 0;
		    for(var i = 0; i < allSolutions.length; i++){
		    	var string = "";
		    	var cost = allSolutions[i].Qty.Cost;
		    	sum += cost;
		    	string += Math.round(cost * 100) / 100;
		    	for(var j = 0; j<allSolutions[i].Qty.QtyMat.length; j++){
		    		string += "\t";
		    		string += allSolutions[i].Qty.QtyMat[j];
		    	}
		    	//console.log(string);
		    }
		    var average = sum/allSolutions.length;
		    console.log('Cost Average was ' + average);


		    var squareDeviationSum = 0;
		    for(var i = 0; i < allSolutions.length; i++){
		    	squareDeviationSum += Math.pow((allSolutions[i].Qty.Cost - average),2);
		    }
		    squareDeviationSum /= allSolutions.length;
		    var stdev = Math.sqrt(squareDeviationSum);
		    console.log('Standard Deviation was ' + stdev);

		    var itemsRemoved = 0;
		    var upperBound = average + 0.04 * (kernelObj.length - a) * stdev;
		    for(var i = allSolutions.length - 1; i > -1; i--){
		    	if(allSolutions[i].Qty.Cost > upperBound){
		    		//console.log(i+' was removed');
		    		allSolutions.splice(i, 1);
		    		itemsRemoved++;
		    	}
		    }
		    console.log(itemsRemoved + ' items were removed');
	    }

	    var t1 = performance.now();
		console.log("Solver Algorithm took " + (t1 - t0) + " milliseconds.")

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
	    img.write(".//temp//"+iterator+".png");
	    setTimeout(function(){
	    	updateImg(".//temp//"+iterator+".png", 'orgImg');
	    	addToHistory();
	    }, 100);
	});
}
*/

/*
//Function: solutionController()
//Parameters: input Matrix, kernel, should average T/F?, should round down T/F?, append 0 T/F?
//Return: convoluded matrix
*********************************************
//Applies convolusion to input matrix
*/
function solutionController(solutions, kernelObj){
	var tempSolutions = [];
	for(var k=0; k<solutions.length;k++){
    	var tempConv = convolution(solutions[k].data, kernelObj.data, true, true);
    	solList = solutionList(tempConv, kernelObj,solutions[k]);
    	for(var l = 0; l < solList.length; l++){
    		tempSolutions.push(solList[l]);
    	}
    }
    console.log('Number of Possibilities: '+tempSolutions.length);
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

function solutionList(convMatrix, kernelObj, orgObject){
	var kernel = kernelObj.data;
	var kernelWidth = kernel[0].length;
	var kernelHeight = kernel.length;

	coordList = convCoordinates(convMatrix);

	var solutionMatrices = [];

	for(var k = 0; k < coordList.length; k++){
		var convMat = copyMat(convMatrix);
		var elementNums = 0;
		for(var i = coordList[k][1]; i < convMatrix.length + coordList[k][1]+2; i++){
			var start = 0;
			if(i==coordList[k][1]){
				start = coordList[k][0];
			}
			for(var j = start; j < convMatrix[0].length; j++){
				if(convMat[i%convMatrix.length][j] == 1){
					for(var a = -1*kernelHeight+1; a < kernelHeight; a++){
						for(var b= -1*kernelWidth+1; b < kernelWidth; b++){
							if(!(a==0 && b==0) && !(i+a<0) && !(j+b<0)){
								convMat[(i+a)%convMatrix.length][(j+b)%convMatrix[0].length] = 0;
							}
						}
					}
					elementNums++;
				}
			}
		}
		if(!matInList(solutionMatrices, convMat)){
			var iKer = insertKernel(convMat, kernel);
			var sub = matrixSubtract(orgObject.data, iKer);
			var temp = editQty(sub, orgObject.Qty.QtyMat, elementNums, orgObject.ConvMat, convMat, kernelObj.price, orgObject.Qty.Cost);
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
	//var string = "";
	for(var k = 0; k<allSolutions.length;k++){
		var cost = allSolutions[k].Qty.Cost;
		if(k==0 || cost<minCost){
			minIndex = k;
			minCost = cost
		}
	}
	/*
	fs.writeFile("./temp/test.txt", string, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    console.log("The file was saved!");
	}); */
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

	for(var i = 0; i<matObj.Qty.QtyMat.length; i++){
		result += matObj.Qty.QtyMat[i] * kernelObj[i].price;
	}
	matObj.Qty.cost = result;
	return result;
}

/*
//editQty(inputMatrix, oldQty, newQty, oldConv, newConv)
*********************************************
//creates object...
//... pushes new Qty to oldQty list...
//... and pushes new Convolution Matrix to list of convolution matrices
*/

function editQty(inputMatrix, oldQty, newQty, oldConv, newConv, brickPrice, previousCost){
	var newCost = previousCost + brickPrice * newQty;
	var list = []
	for(var i = 0; i<oldConv.length;i++){
		list.push(oldConv[i]);
	}
	list.push(newConv);

	var qtyList = [];
	for(var i = 0; i < oldQty.length;i++){
		qtyList.push(oldQty[i]);
	}
	qtyList.push(newQty);
	var object = {
		data: inputMatrix,
		Qty:{
			Cost: newCost,
			QtyMat:qtyList
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
			QtyMat:[]
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
			line+= matrix[i][j] +"\t";
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

/*
//binaryTransform(inputMatrix)
*********************************************
//copies matrix --> all values of -1 become 1...
//... all other values become 0
*/

function binaryTransform(inputMatrix){
	var newMat = [];
	for(var i = 0; i< inputMatrix.length; i++){
		var rowRes = [];
		for(var j = 0; j< inputMatrix[0].length; j++){
			if(inputMatrix[i][j] == -1){
				rowRes.push(1);
			}
			else{
				rowRes.push(0);
			}
		}
		newMat.push(rowRes);
	}
	return newMat;
}





document.getElementById('addGrid').addEventListener('click',function(){
	iterator = parseInt(document.getElementById('iterator').innerHTML);
	Jimp.read("./temp/"+iterator+".png", function (err, img) {
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
		    //Draw Vertical Lines (White Color)
		    for(var i = 0; i < prevWidth; i++){
		    	for(var j = 0; j<prevHeight*20; j++){
		    		gridImg.setPixelColor(Jimp.rgbaToInt(255,255,255, 255), i*20, j);
		    	}
		    }
		    //Draw Vertical Line on last column
		    for(var j = 0; j<prevHeight*20; j++){
		    	gridImg.setPixelColor(Jimp.rgbaToInt(255,255,255, 255), prevWidth*20-1, j);
		    }
		    for(var i = 0; i < prevHeight; i++){
		    	for(var j = 0; j<prevWidth*20; j++){
		    		gridImg.setPixelColor(Jimp.rgbaToInt(255,255,255, 255), j, i*20);
		    	}
		    }
		    //Draw Horizontal Line on last row
		    for(var j = 0; j<prevWidth*20; j++){
		    	gridImg.setPixelColor(Jimp.rgbaToInt(255,255,255, 255), j, prevHeight*20-1);
		    }
		});
	    
	    iterator++;
	    document.getElementById('iterator').innerHTML = iterator;
	    gridImg.write(".//temp//"+iterator+".png");
	    setTimeout(function(){
	    	updateImg(".//temp//"+iterator+".png", 'orgImg');
	    	document.getElementById('imgWidth').innerHTML = gridImg.bitmap.width;
			document.getElementById('imgHeight').innerHTML = gridImg.bitmap.height;
	    	addToHistory();
	    }, 100);
	});
},false);