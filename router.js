var _ = require("underscore");
var url = require('url')
var fs = require('fs');

module.exports = function(app,io,m){

  /**
  * routing event
  */

  app.get("/", getIndex);
  app.get("/player/:session", getPlayer);
  /**
  * routing functions
  */

  // GET
  function getIndex(req, res) {
    res.render("index", {title : "subslide"});
  };
  function getPlayer(req, res) {
    var session = req.param('session');
    res.render("player", {
      title : "Prise de notes",
      session : session
    });
  };
};
