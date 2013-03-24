// Dependencies
var config = require('config-heroku')
var request = require('request')

var pipeUrl = function(path,req,res,next){
  // pipe this file from the cdn to the request.
  request(path).pipe(res)
}

module.exports = function(app){
  Object.keys(config.client.cdnjavascripts).forEach(function(path){
    app.get(path,pipeUrl.bind(app,config.client.cdnjavascripts[path]))
  })
}