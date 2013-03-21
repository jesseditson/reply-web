var wrench = require('wrench')

module.exports = function(app){
  // scan the current directory recursively and set up any js files as routes
  wrench.readdirRecursive(__dirname, function(error, files) {
    ;(files || []).forEach(function(file){
      if(/^index/.test(file) || !/\.js$/.test(file)) return
      // require js files
      var route = require('./' + file)
      if(typeof route != "function") return console.warn("Found route " + file + ", but it does not appear to be a route.")
      route(app)
    })
  })
}