window.onload = function(){

	var scroll = function(){
		//scroll to the start ofthe article div here
		document.getElementById('top').scrollIntoView();
	}

	document.getElementById("scrollButton").addEventListener("click", scroll);

}