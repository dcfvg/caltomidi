var fs 			= require('fs');
var parser 	= require('vdata-parser');
var _ 			= require('underscore');
var say 		= require('say');
var moment 	= require('moment');
var s 			= require("underscore.string");

function tc(time){ 
	// reformat ICS TIMECODE
	time = s.insert(time, 4, '-');
	time = s.insert(time, 7, '-');
	time = s.insert(time, 13, ':');
	time = s.insert(time, 16, ':');

	return time;
}

function getTiming(e){

	var start 	=	moment(tc(e["DTSTART;TZID=Europe/Paris"]), moment.ISO_8601),
			end 		=	moment(tc(e["DTEND;TZID=Europe/Paris"]), moment.ISO_8601),
			hDuration = end.from(start, true),
			startX 	=	start.format("X"),
			endX 		=	end.format("X"),
			duration= (endX-startX)
			;

	return {
		start    	: 	start,
		end 		 	: 	end,
		startX    : 	startX,
		endX 		 	: 	endX,
		duration 	: 	duration,
		hDuration :  	hDuration
	} 
}
function addToTimeline(i){

	var e = events[i];
	var timing = getTiming(e);
	var t = (timing.startX - t0.startX) / speed;

	console.log("in ", t/1000, "s : \t\t"+e.SUMMARY);

	if(t != "NaN" && t>0){
		setTimeout(function(){
			console.log(timing.start.format("DD MM YYYY, HH:mm:ss"),"\t", timing.hDuration,"\t", e.SUMMARY );
		}, t);
	}
}

var events,
		curEvt = 0,  
		t0 = 0,
		speed = 1000;

parser.fromFile(__dirname + '/bv.ics', function (err, data) {

	events = _.sortBy(data.VCALENDAR.VEVENT, function(e){ return tc(e.DTSTAMP);});
	t0 = getTiming(events[28]); // first valid date 

	_.each(events, function(e, index) {
		addToTimeline(index);
	});

	// // save a json
	var outputFilename = __dirname + '/bv.json';
	fs.writeFile(outputFilename, JSON.stringify(data, null, 4), function(err) {
		if(err) console.log(err);
		else console.log("JSON saved to " + outputFilename);
	});

});

