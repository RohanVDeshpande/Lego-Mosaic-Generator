$(document).on('click', '.usedColor', function () {
	$('.selectedColor').removeClass('selectedColor');
	$(this).addClass('selectedColor');
});