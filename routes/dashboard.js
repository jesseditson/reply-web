var db = require('../lib/mongoWrapper').db.add('bots')

var dashboard = function(req,res,next){
  db.bots.findArray({owner : req.user._id.toString()},function(err,bots){
    if(err) return res.render('error',{error : err.message})
    res.render('dashboard',{pageName : "dashboard",bots : bots})
  })
}

module.exports = function(app){
  app.get('/',dashboard)
}