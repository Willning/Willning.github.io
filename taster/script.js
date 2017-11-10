window.onload = function(){

	//global constant to count how many words are chosen 
	count = 0;

	//global var containg the flavor table.
	var flavorLines;

	//before anything load the list so searching can take place
	
	var extractFlavorCSV = function() { 
		let output = this

      		function listener() {

      			let list = this.responseText;

      			var flavorChart = list;

      			flavorLines = flavorChart.split("\n");			
				
      			
      		}

      		var xhr = new XMLHttpRequest();
      		xhr.open("GET", "./flavors.csv")
      		xhr.addEventListener("load" , listener);
      		xhr.send();

	};


	extractFlavorCSV();

	document.getElementById("result").style.display = "none";
	document.getElementById("resultLabel").style.display = "none";

	//search function for when the search button is pressed. Idea is to search each individual term, against every word. most matches is top.
	//if two things have the same score, the food earlier in the list is chosen. 

	var search = function() {

		let searchTerms = document.getElementById("labels").innerText
		
		console.log("Searching for " + searchTerms );

		let wordArray = searchTerms.split(" ");

		let score = [];

		//run through every line
		for (var j = 0; j<flavorLines.length;j++){

			//parse out the word here. 
			let foodName = flavorLines[j].split(",")[0];
			score[foodName] = 0;

			for (var i = 0; i<wordArray.length; i++){
				//search through every term for. 
				//use an assosicative array to store the frequencies of matches?

				if (flavorLines[j].includes(wordArray[i])){

					score[foodName]++;

				}else{
					//penalise mismatches harder. 
					score[foodName] -= 2;					
				}

			}

			//this whole part is to eliminate flavor descriptors that don't match our search terms
			let foodArray = flavorLines[j].split(",");
			for (var k =1 ; k<foodArray.length;k++){
				if (foodArray[k] !== ""){
					if (!searchTerms.includes(foodArray[k])){
						score[foodName]--;
					}
				}
			}
			
	    }	    	      
	    
	    document.getElementById("result").innerText = getMax(score);

	    if (getMax(score) !== ""){
	    	toggleMatch(true);
	    }else{
	    	toggleMatch(false);
	    }

	}

	//toggles the closest match pane on and off
	var toggleMatch = function(on){

		let resultPane = document.getElementById("result");
		let resultlabel = document.getElementById("resultLabel");

		if (on){

			resultPane.style.display = "block";
			resultlabel.style.display = "block";

		}else{

			resultPane.style.display = "none";
			resultlabel.style.display = "none";
		}
		
	}


	//get highest value in array.
	var getMax = function(score){
		//now rank based upon highest score. 
		//if things have the same score, just takes earlier one.
		//return multiple things?		

		let closestMatch = "";

		for (var food in score){
			if (score[closestMatch] === undefined){
				closestMatch = food;
			}

			if(score[food] > score[closestMatch]){
				closestMatch = food;
			}			

		}

		return closestMatch;
	}



	document.getElementById("search").addEventListener("click", search);
	document.getElementById("clear").addEventListener("click",clearSearch);



	var addFlavor  = function() {
		//stub to add a flavor to the desciptor
		var flavor = this.id;	
		if ((count < 6) && (!this.clicked)){

				this.classList.add("flavor-clicked");	
			
				console.log(flavor);
				appendFlavor(flavor + " ");			

				this.clicked = true;

			} else {
				this.classList.remove("flavor-clicked");				
				removeFlavor(flavor);
				this.clicked = false; 

			}
		};
		

	var classname = document.getElementsByClassName("flavor");

	for (var i = 0; i < classname.length; i++) {

		classname[i].addEventListener('click', addFlavor, false);
	}


	//append a new flavor descciprtion to the flavor profile
	function appendFlavor(flavor){

		document.getElementById("labels").innerHTML += " " +flavor;
		count++;

	}


	//remove a description if it is in the list
	function removeFlavor(flavor){

		var original = document.getElementById("labels").innerText;

		if (original.includes(flavor)){
			document.getElementById("labels").innerHTML = original.replace(flavor, " ");
			count--;
		}

	}

	//remove all decriptors from the list, also resets all the buttons
	function clearSearch(){

		document.getElementById("labels").innerHTML = "";

		var classname = document.getElementsByClassName("flavor");
		toggleMatch(false);
		count = 0;

		for (var i = 0; i < classname.length; i++) {
			classname[i].clicked=false;
			classname[i].classList.remove("flavor-clicked");
		}
	}

}



