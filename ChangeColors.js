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

