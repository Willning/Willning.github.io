window.onload = function(){

	let textArea = document.getElementById("textBox");

	let button = document.getElementById("convert");
		
	var convert = function(){
		console.log(textArea.value);
		var result = pinyin("中");
		console.log(result);
	}

	button.addEventListener("click", convert, false);
}