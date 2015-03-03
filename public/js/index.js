jQuery(document).ready(function($) {

  var serverBaseUrl = document.domain;
  var socket = io.connect(serverBaseUrl+':8080');
  var sessionId = '';

  socket.on('newSubStart', onNewSubStart);
  socket.on('newSubStop', onNewSubStop);
  socket.on('newEventStart', onNewEventStart);

  function onNewSubStart(event){
    $("#sub").html(event.sub.text);
    if( event.images.length > 0){
    	var image = event.images[Math.floor(Math.random() * event.images.length)].replace("sessions","");
    	$("body").css("background-image","url('"+image+"')");
    }
  };
  function onNewSubStop(){
  	$("#sub").html(" ");
		$("body").css("background-image","none");
  };
  socket.emit("newClient","public");

  function onNewEventStart(event){
    console.log(event.e);
      
  }
});