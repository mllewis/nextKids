// Nextkids1 preliminaries -- parent-report vocab norming and practice trials. 

// Overview: (i) Parameters (ii) Helper Functions (iii) Control Flow

// ---------------- PARAMETERS ------------------ 
// parent word checklist
var wordList = [ "pig", "cow", "squirrel", "raccoon", "elephant", "giraffe", "zebra", "monkey",
 "duck", "rooster", "bird", "owl", "ostrich", "peacock", "penguin", "swan"] // curently this isn't used anywhere; hard coded in html

// php url for saving data (note: permissions of csv file must be set to write and apply!)
var php_url = "http://sapir.psych.wisc.edu/~molly/nextKids2b/survey/nextkids2_save_results.php"


// global variables
var counter = 1
var next_bin
var timeafterClick = 1000;
var clickDisabled
var checkedItems = {}

// ---------------- HELPER ------------------
// show slide function
function showSlide(id) {
  $(".slide").hide(); //jquery - all elements with class of slide - hide
  $("#"+id).show(); //jquery - element with given id - show
}

// date function
getCurrentDate = function() {
	var currentDate = new Date();
	var day = currentDate.getDate();
	var month = currentDate.getMonth() + 1;
	var year = currentDate.getFullYear();
	return (month + "/" + day + "/" + year);
}

getCurrentTime = function() {
	var currentTime = new Date();
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();

	if (minutes < 10) minutes = "0" + minutes;
	return (hours + ":" + minutes);
}

// -----------------------------------------------

showSlide("instructions");

// MAIN EXPERIMENT
var experiment = {

	subid: "",
		//inputed at beginning of experiment
	date: getCurrentDate(),
		//the date of the experiment
	timestamp: getCurrentTime(),

	//Checks to see whether the experimenter inputted appropriate values before moving on with the experiment
	checkInput: function() {
		//alert($("#myForm input[type='radio']:checked").val())

		//subject ID
  		if (document.getElementById("subjectID").value.length < 1 | !$("#myForm input[type='radio']:checked").val()) {
			$("#checkMessage").html('<font color="red">You must input subject information</font>');
			return;
		}
  		experiment.subid = document.getElementById("subjectID").value;
		experiment.group = $("#myForm input[type='radio']:checked").val()

		showSlide("parentVocab");

	}, 

	scoreVocab: function () {   
		 // get checked items
		 i = 0;   
	      $("#check-list-box li.active").each(function(idx, li) {
	            checkedItems[i] = $(li).text();
	            i++;
	        })

	     // get score (could do something more elabotrate here with aoaData.js)
	     var score = Object.keys(checkedItems).length

	     if (experiment.group != "test") {
		    // save data to data file
			var dataforRound = experiment.subid; 
			dataforRound += "," + experiment.date + "," + experiment.timestamp + "," + experiment.group  + ",vocab_data," + score + "," + JSON.stringify(checkedItems) + "\n";
			//alert(JSON.stringify(checkedItems))
			$.post(php_url, {postresult_string : dataforRound});
		  }

		// thanks
		showSlide("thanks")

	},

}
		