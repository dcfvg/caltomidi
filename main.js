var fs        = require('fs-extra');
var glob      = require("glob");
var path      = require("path");
var gm        = require('gm');
var markdown  = require( "markdown" ).markdown;
var srt       = require("srt").fromString;
var glob      = require("glob-all");

var fs      = require('fs');
var parser  = require('vdata-parser');
var _       = require('underscore');
var say     = require('say');
var moment  = require('moment');
var s       = require("underscore.string");

var midi = require("midi");

var output = new midi.output();


module.exports = function(app, io){
  console.log("main module initialized");

  var sessions_p = "sessions/";


  var events,
  curEvt = 0,  
  t0 = 0,
  speed = 635;

  var time0 = 0;


  speed = 635;
  //speed = 300;
  
  console.log("portcount",output.getPortCount());
  console.log("portname",output.getPortName(0));
  output.openPort(0);
  output.sendMessage([144,0,1]);


  io.on("connection", function(socket){
    socket.on("newClient", onNewClient);
    socket.on("subStart", onSubStart);
    socket.on("subStop", onSubStop);
  });
  function init(){
    parser.fromFile(sessions_p + '/bv.ics', function (err, data) {

      events = _.sortBy(data.VCALENDAR.VEVENT, function(e){ return tc(e.DTSTAMP);});
      t0 = getTiming(events[30]); // first valid date 

      _.each(events, function(e, index) {
        addToTimeline(index);
        //console.info(e);
      });

      console.log(events.length,"events in the calendar");

      // // save a json
      var outputFilename = sessions_p + '/bv.json';
      fs.writeFile(outputFilename, JSON.stringify(data, null, 4), function(err) {
        if(err) console.log(err);
        else console.log("JSON saved to " + outputFilename);
      });

    });
  };
  // events
  function onSubStart (req){
    console.log("start",req);

    glob(sessions_p+req.session+'/slides/'+pad(req.subId, 3)+'-*/*', {nocase: true, sync: true}, function(er, images){
      //console.log(images);
      io.sockets.emit("newSubStart", {sub:req,images:images});
    });
  };
  function onSubStop(req){
    //console.log("stop",req);
    io.sockets.emit("newSubStop", {sub:req});
  }
  function onNewClient (req){
    console.log("new",req);
  };

  function tc(time){ 
    // reformat ICS TIMECODE
    time = s.insert(time, 4, '-');
    time = s.insert(time, 7, '-');
    time = s.insert(time, 13, ':');
    time = s.insert(time, 16, ':');

    return time;
  }

  function getTiming(e){

    var day       = moment(e["DTSTART;VALUE=DATE"], "YYYYMM"),
        start     = moment(tc(e["DTSTART;TZID=Europe/Paris"]), moment.ISO_8601),
        end       = moment(tc(e["DTEND;TZID=Europe/Paris"]), moment.ISO_8601),
        hDuration = end.from(start, true),
        startX    = start.format("X"),
        endX      = end.format("X"),
        duration  = (endX-startX),
        creation  = moment(tc(e["CREATED"]), moment.ISO_8601)
        ;
    return {
      day       :   day,
      start     :   start,
      end       :   end,
      startX    :   startX,
      endX      :   endX,
      duration  :   duration,
      hDuration :   hDuration,
      creation  :   creation
    } 
  }
  function addToTimeline(i){


    var e = events[i];
    var timing = getTiming(e);
        if(time0 == 0) time0 = timing.startX - 5;

    var t = (timing.startX - t0.startX) / speed;
    
    if(t !== "NaN" && t>0){
        console.log("in ", t/1000, "s : \t\t"+e.SUMMARY);

        setTimeout(function(){
            var shuffled = e.SUMMARY.split('').sort(function(){return 0.2-Math.random()}).join('');

            
            //io.sockets.emit("newEventStart", {e:e});
            var vol = timing.duration;
            if(vol > 216000) vol = 216000;
            vol = timing.duration % 216000
            vol = Math.round(vol.map( 0 , 216000 , 50 , 255 ));

            var note = timing.start.format("hh");
            
            var voice = "Vicki";
            if(note % 2 == 0 ) voice = "Bells";

            rate = Math.round(vol.map( 0 , 216000 , 1 , 30 ));


            //say.speak(voice, rate, shuffled);
            output.sendMessage([145,note,vol]);

            console.log(timing.startX, timing.start.format("DD MM YYYY, HH:mm:ss"),"\t\t note:",note,"\t", timing.duration,"s \t vol:",vol ,"\t", e.SUMMARY );
        }, t);
    }
  }

  Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
    return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
  }
  init();


  // helpers
  function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
  }
};