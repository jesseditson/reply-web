var db = require('../lib/mongoWrapper').db.add('bots')
var runner = require('../lib/runner')
var async = require('async')

var dashboard = function(req,res,next){
  db.bots.findArray({owner : req.user._id.toString()},function(err,bots){
    if(err) return res.render('error',{error : err.message})
    async.map(bots,addStatus,function(err,bots){
      res.render('dashboard',{pageName : "dashboard",bots : bots})
    })
  })
}

var addStatus = function(bot,done){
  runner.status(bot,function(err,info){
    bot.status = info.message
    done(null,bot)
  })
}

module.exports = function(app){
  app.get('/',dashboard)
}