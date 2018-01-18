// Nextkids3

// Overview: (i) Parameters (ii) Helper Functions (iii) Control Flow

// ---------------- PARAMETERS ------------------ 

// google spreadsheet key to next links (note: make sure publish google doc)
var stimuli_google_sheet_key = "1WC4n9h78wXmSIqmXsJ3_ebNwY_Iz7hTkB2XHfO5CEOw"

// php url for saving data (note: permissions of csv file must be set to write and apply!)
var php_url = "http://sapir.psych.wisc.edu/~molly/nextKids3/experiment/nextkids3_save_data.php"

var NUMPRACTICE = 2
var NUMCRITICALTRIALS = 5
var TIMEAFTERCLICK = 1000;

// global variables
var counter_practice = 1
var counter_crit= 1
var next_bin
var clickDisabled

var tax_stim_crit
var theme_stim_crit
var percept_stim_crit
var tax_stim_practice
var theme_stim_practice
var percept_stim_practice
var current_stim_practice
var current_stim_crit

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
getStims = function(data, tabletop){
	stim = tabletop.sheets("stimulus_sheet").toArray()

	// map functions gets column of 2d array
	tax_stim_practice = stim.map(function(value,index) { return value[0];});
	theme_stim_practice = stim.map(function(value,index) { return value[1];});
	percept_stim_practice = stim.map(function(value,index) { return value[2];});
	tax_stim_crit = stim.map(function(value,index) { return value[3];});
	theme_stim_crit = stim.map(function(value,index) { return value[4];});
	percept_stim_crit = stim.map(function(value,index) { return value[5];});
}

var tabletop = Tabletop.init({ 
 				   key: stimuli_google_sheet_key,
                   callback: getStims,
                   simpleSheet: true })

// preload images
//var images = new Array();
//for (i = 0; i<obj.length; i++) {
//	images[i] = new Image();
//	images2[i] = new Image();
//	images[i].src = "images/" + percept_stim_practice[i] + ".jpg";
//	images2[i].src = "images/" + percept_stim_practice[i] + ".jpg";

//}
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
  		if (document.getElementById("subjectID").value.length < 1 | !$("#condition_selector input[type='radio']:checked").val()) {
			$("#checkMessage").html('<font color="red">You must input subject information</font>');
			return;
		}
  		experiment.subid = document.getElementById("subjectID").value;
		experiment.condition = $("#condition_selector input[type='radio']:checked").val()

		experiment.getConditionInfo()
	}, 

	getConditionInfo: function() {
		if (experiment.condition == "perceptual"){
			current_stim_practice = percept_stim_practice
			current_stim_crit = percept_stim_crit
		} else if (experiment.condition== "taxonomic"){
			current_stim_practice = tax_stim_practice
			current_stim_crit = tax_stim_crit
		} else if (experiment.condition == "thematic"){
			current_stim_practice = theme_stim_practice
			current_stim_crit = theme_stim_crit
		}
		experiment.practiceTrial()
	},


	practiceTrial: function () { 
		setTimeout(function() {clickDisabled = false, 2000})

		center_html = '<img style="width:25%" class="center-block img-responsive" src="images/' + current_stim_practice[0] + '.jpg">'
	 	$("#center").html(center_html) 

	 	left_html = '<img style="width:50%" class="center-block img-responsive pic" src="images/' + current_stim_practice[1] + '.jpg" id="leftpic">'
	 	$("#left").html(left_html) 

	 	right_html = '<img style="width:50%" class="center-block img-responsive pic" src="images/' + current_stim_practice[2] + '.jpg" id="rightpic">'
	 	$("#right").html(right_html) 

		showSlide("triadSlide");

		$('.pic').bind('click touchstart', function(event) {

			if (clickDisabled == false){
				var picID = $(event.currentTarget).attr('id');

				$(document.getElementById(picID)).css('border', "solid 10px red");
				clickDisabled = true;

				var picID = $(event.currentTarget).attr('id');
		    	if (picID === "leftpic") {
					experiment.chosenpic = current_stim_practice[1];
		    	} else {
					experiment.chosenpic = current_stim_practice[2];
				}

				// save data to data file
				var dataforRound = experiment.subid; 
				dataforRound += "," + experiment.date + "," + experiment.timestamp + "," + experiment.condition  + ",practice_trial," + counter_practice + "," + experiment.chosenpic + "," + current_stim_practice[0] + "," + current_stim_practice[1] + "," + current_stim_practice[2] + "\n";
				$.post(php_url, {postresult_string : dataforRound});

				//remove the pictures from the image array that have been used
				current_stim_practice.splice(0, 3);

				setTimeout(function() {
					if (counter_practice == NUMPRACTICE) {
						experiment.criticalTrial();
						return;
					} else {
						experiment.practiceTrial();
						counter_practice++;
					}	

					$(document.getElementById(picID)).css('border', "none"); 

				}, TIMEAFTERCLICK);
			}
	    })
	},

criticalTrial: function () { 
		setTimeout(function() {clickDisabled = false, 2000})

		// sample three items randomly from stimulus set
		current_trial_crit = _.sample(current_stim_crit, 3);

		center_html = '<img style="width:25%" class="center-block img-responsive" src="images/' + current_trial_crit[0] + '.jpg">'
	 	$("#center").html(center_html) 

	 	left_html = '<img style="width:50%" class="center-block img-responsive pic" src="images/' + current_trial_crit[1] + '.jpg" id="leftpic">'
	 	$("#left").html(left_html) 

	 	right_html = '<img style="width:50%" class="center-block img-responsive pic" src="images/' + current_trial_crit[2] + '.jpg" id="rightpic">'
	 	$("#right").html(right_html) 

		showSlide("triadSlide");

		$('.pic').bind('click touchstart', function(event) {

			if (clickDisabled == false){
				var picID = $(event.currentTarget).attr('id');

				$(document.getElementById(picID)).css('border', "solid 10px red");
				clickDisabled = true;

				var picID = $(event.currentTarget).attr('id');
		    	if (picID === "leftpic") {
					experiment.chosenpic = current_trial_crit[1];
		    	} else {
					experiment.chosenpic = current_trial_crit[2];
				}

				// save data to data file
				var dataforRound = experiment.subid; 
				dataforRound += "," + experiment.date + "," + experiment.timestamp + "," + experiment.condition  + ",critical_trial," + counter_crit + "," + experiment.chosenpic  + "," + current_trial_crit[0] + "," + current_trial_crit[1] + "," + current_trial_crit[2] + "\n";
				$.post(php_url, {postresult_string : dataforRound});

				setTimeout(function() {
					if (counter_crit == NUMCRITICALTRIALS) {
						experiment.endExperiment();
						return;
					} else {
						experiment.criticalTrial();
						counter_crit++;
					}	

					$(document.getElementById(picID)).css('border', "none"); 

				}, TIMEAFTERCLICK);
			}
	    })
	},

	endExperiment: function () { 


	}

}
		