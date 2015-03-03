
// document.addEventListener( "DOMContentLoaded", function () {

//   console.log("loaded");


//


jQuery(document).ready(function($) {

  var serverBaseUrl = document.domain;

  console.log(serverBaseUrl);
  var socket = io.connect(serverBaseUrl+':8080');
  var sessionId = '';

  socket.on('newImage', onNewImage);

  function onNewImage(event){
    console.log(event);
  };

  socket.emit("newClient",app.session);

  var p = Popcorn( "#video" )
     .parseSRT( "/"+app.session+"/sub.srt")
     .play();

});
//$(document).on('ready', init);