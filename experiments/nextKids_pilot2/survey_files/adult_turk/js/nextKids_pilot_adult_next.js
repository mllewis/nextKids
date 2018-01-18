// Nextkids1 preliminaries -- parent-report vocab norming and practice trials. 

// Overview: (i) Parameters (ii) Helper Functions (iii) Control Flow

// ---------------- PARAMETERS ------------------ 
// parent word checklist
var wordList = [ "pig", "cow", "squirrel", "raccoon", "elephant", "giraffe", "zebra", "monkey",
 "duck", "rooster", "bird", "owl", "ostrich", "peacock", "penguin", "swan"] // curently this isn't used anywhere; hard coded in html

// practice triad task objects
var obj = ["table", "chair", "plane", "strawberry", "trombone", "banana"];

// google spreadsheet key to next links (note: make sure publish google doc)
var next_link_key = "1-QGzQBfKb70BX0nEBV1r9fhG1zwb8fwbTUruYkjTFS4"

// global variables
var counter = 1
var next_bin
var timeafterClick = 1000;
var clickDisabled
var next_young_link
var next_mid_link
var next_old_link
var next_test_link
var next_adult_link
var next_adult_turk_link

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
	next_young_link = urls[0][0]
	next_mid_link = urls[0][1]
	next_old_link = urls[0][2]
	next_test_link = urls[0][3]
	next_adult_link = urls[0][5]
	next_adult_turk_link = urls[0][6]

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

	subid: Math.floor((Math.random() * 10000000000) + 1), // random number
		//inputed at beginning of experiment
	date: getCurrentDate(),
		//the date of the experiment
	timestamp: getCurrentTime(),

	startExperiment: function() {
		showSlide("instructions2")
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

				$(document.getElementById(picID)).css('border', "solid 8px red");
				clickDisabled = true;

				var picID = $(event.currentTarget).attr('id');
		    	if (picID === "leftpic") {
					experiment.chosenpic = obj[1];
		    	} else {
					experiment.chosenpic = obj[2];
				}

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

				}, timeafterClick);
			}
	    })
	},

	go_to_next_expt: function() {	
		 //appends subid to link in order to pass to NEXT framework
		window.location.href = "http://ec2-54-245-188-12.us-west-2.compute.amazonaws.com:8000/query/query_page/query_page/f06ed513bf263f9f6ab767e718ab47"
		// window.location.href = "http://ec2-54-245-188-12.us-west-2.compute.amazonaws.com:8000/query/query_page/query_page/f06ed513bf263f9f6ab767e718ab47?participant=" + experiment.subid

	}
}
		