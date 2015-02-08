var fs 			= require('fs');
var parser 	= require('vdata-parser');
var _ 			= require('underscore');
var say 		= require('say');
var moment 	= require('moment');
var s 			= require("underscore.string");	

parser.fromFile(__dirname + '/cal.ics', function (err, data) {

	var events = data.VCALENDAR.VEVENT;
	var currentEvent = 0;
	var lyrics;
	
	function sayNext(){
		var e = events[currentEvent];

		var start =	moment(tc(e["DTSTART;TZID=Europe/Paris"]), moment.ISO_8601);
		var end 	=	moment(tc(e["DTEND;TZID=Europe/Paris"]), moment.ISO_8601);

		console.log(
			"\t" + e.DTSTAMP
			+ "\t" + tc(e.DTSTAMP) 
			+ "\t" + start.format("DD MM YYYY, HH:mm:ss") + "\t -> \t" + end.format("DD MM YYYY, HH:mm:ss")
			+ "\t" + end.from(start, true) 
			+ "\t \t \t" + e.SUMMARY 

		);//	console.log(e);


		say.speak('Vicki', e.SUMMARY, sayNext);
		currentEvent++;
	}

	if (err) throw err;


	var events = _.sortBy(events, function(e){ return tc(e.DTSTAMP);});
	_.each(events, function(e, index) {

		var mom = tc(e.DTSTAMP);

		console.log(moment(mom, moment.ISO_8601).format("Do MMMM YYYY, h:mm:ss"));
		console.log(e.SUMMARY);
		console.log(" ");

		lyrics = lyrics+' '+ e.SUMMARY;
	}, this);


	// all song
	//say.speak('Good News', lyrics);

	// one by one
	sayNext();

	//console.log(events[13]['LAST-MODIFIED']);


	// save a json
	var outputFilename = __dirname + '/bv.json';
	fs.writeFile(outputFilename, JSON.stringify(data, null, 4), function(err) {
		if(err) console.log(err);
		else console.log("JSON saved to " + outputFilename);
	});

	// lyrics
	var lyricsFilename = __dirname + '/bv.txt';
	fs.writeFile(lyricsFilename, lyrics, function(err) {
		if(err) console.log(err);
		else console.log("JSON saved to " + lyricsFilename);
	});  
});

function tc(time){
	// reformat ICS TIMECODE

	var ts = time;
	ts = s.insert(ts, 4, '-');
	ts = s.insert(ts, 7, '-');
	ts = s.insert(ts, 13, ':');
	ts = s.insert(ts, 16, ':');
	return ts
}
