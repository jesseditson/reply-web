var config = require('config-heroku')
var _ = require('underscore')
var glob = require('glob')

var getPaths = function(files,folder){
  return _.flatten(files.map(function(p){
    return glob.sync('public/'+folder+'/' + p)
  }).map(function(a,i){
    if(!a.length) return files[i]
    return a.map(function(u){
      var u = u.replace(/^public/,'')
      return u
    })
  }).filter(function(e){
    return e
  }))
}

module.exports = function(app) {
  var javascripts, stylesheets
  javascripts = Object.keys(config.client.cdnjavascripts).concat(getPaths(config.client.javascripts,'javascripts'))
  stylesheets = Object.keys(config.client.css).reduce(function(ss,query){
    ss[query] = getPaths(config.client.css[query],'css')
    return ss
  },{})
  
  app.locals({
    stylesheets : stylesheets,
    javascripts : javascripts,
    title : config.title,
    pageName : ""
  })
}

var serverStartTime = new Date().getTime()

module.exports.middleware = function(req, res, next){
  res.locals.user = req.user
  res.locals.host = req.host
  next()
}

