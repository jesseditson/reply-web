var db = require('../lib/mongoWrapper').db.add('bots').add('logs')
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
  runner.status(bot,function(err,status){
    bot.status = status
    getStats(bot,done)
  })
}

var getStats = function(bot,done){
  var sampleDate = new Date()
  sampleDate.setHours(sampleDate.getHours() - 1)
  var query = {slug : bot.slug, level : "log", messages : "Posted tweet : ", timestamp : { $gte : sampleDate }}
  db.logs.findArray(query,{messages : 1,timestamp : 1},function(err,logs){
    bot.stats = {
      current_replies_per_hour : logs.length
    }
    return done(null,bot)
  })
}

module.exports = function(app){
  app.get('/',dashboard)
}