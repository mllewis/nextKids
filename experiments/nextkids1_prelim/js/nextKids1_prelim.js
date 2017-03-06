// Nextkids1 preliminaries -- parent-report vocab norming and practice trials. 

// Overview: (i) Parameters (ii) Helper Functions (iii) Control Flow

// TO DO:
// fix formatting on pictures and checklist

// ---------------- PARAMETERS ------------------
var bin_cutoff = 10 // this determines the min words parents must report in order to go to "high" bin

// parent word checklist
var wordList = [ "pig", "cow", "goat", "squirrel", "raccoon", "tiger", "elephant", "giraffe", "zebra", "monkey",
 "duck", "chicken", "rooster", "bird", "owl", "ostrich", "peacock", "penguin", "swan", "flamingo"] // curently this isn't used anywhere; hard coded in html

// practice triad task objects
var obj = ["table", "chair", "carrot", "strawberry", "trombone", "banana"];

// google spreadsheet key to next links
var next_link_key = "1-QGzQBfKb70BX0nEBV1r9fhG1zwb8fwbTUruYkjTFS4"

// php url for saving data (note: permissions of csv file must be set to write)
var php_url = "http://sapir.psych.wisc.edu/~molly/nextKids1/nextkids1_save_results.php"

// global variables
var counter = 1
var next_bin
var timeafterClick = 1000;
var clickDisabled
var next_low_link
var next_high_link
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

// get next link from googlesheet
getUrls = function(data, tabletop){
	urls = tabletop.sheets("urls").toArray()
	next_low_link = urls[0][0]
	next_high_link = urls[0][1]
}

var tabletop = Tabletop.init({ 
 				   key: next_link_key,
                   callback: getUrls,
                   simpleSheet: true })

// preload images
var images = new Array();
for (i = 0; i<obj.length; i++) {
	images[i] = new Image();
	images[i].src = "images/" + obj[i] + ".jpg";
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
		//subject ID
  		if (document.getElementById("subjectID").value.length < 1) {
			$("#checkMessage").html('<font color="red">You must input a subject ID</font>');
			return;
		}
  		experiment.subid = document.getElementById("subjectID").value;
		experiment.getParentVocab();
	}, 

	getParentVocab: function () {      
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

	     if (score < bin_cutoff) {
	     	next_bin = "low"
	     } else {
	     	next_bin = "high"
	     }

	    // save data to data file
		var dataforRound = experiment.subid; 
		dataforRound += "," + experiment.date + "," + experiment.timestamp + "," + score + "," + JSON.stringify(checkedItems) + "\n";
		//alert(JSON.stringify(checkedItems))
		$.post(php_url, {postresult_string : dataforRound});

		// Start practice trilas
		experiment.practiceTrial()

	},

	practiceTrial: function () { 
		setTimeout(function() {clickDisabled = false, 2000})
		
		center_html = '<img class="center-block img-responsive" src="images/' + obj[0] + '.jpg">'
	 	$("#center").html(center_html) 

	 	left_html = '<img class="center-block img-responsive pic" src="images/' + obj[1] + '.jpg" id="leftpic">'
	 	$("#left").html(left_html) 

	 	right_html = '<img class="center-block img-responsive pic" src="images/' + obj[2] + '.jpg" id="rightpic">'
	 	$("#right").html(right_html) 

		showSlide("practiceSlide");

		$('.pic').bind('click touchstart', function(event) {

			if (clickDisabled == false){
				var picID = $(event.currentTarget).attr('id');

		    	$(document.getElementById(picID)).css('margin', "8px");
				$(document.getElementById(picID)).css('border', "solid 8px red");
				clickDisabled = true;

				//remove the pictures from the image array that have been used, and the word from the wordList that has been used
				obj.splice(0, 3);

				setTimeout(function() {
					if (counter == 2) {
						experiment.go_to_next_expt();
						return;
					} else {
						experiment.practiceTrial();
						counter++;
					}	

					$(document.getElementById(picID)).css('border', "none"); 
					$(document.getElementById(picID)).css('margin', "8px white");

				}, timeafterClick);
			}
	    })
	},

	go_to_next_expt: function() {
		if (next_bin == "low"){
			window.location.href = next_low_link
		} else if (next_bin == "high"){
			window.location.href = next_high_link
		}
	}
}
		