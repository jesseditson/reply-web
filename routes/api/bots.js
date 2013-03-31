var db = require('../../lib/mongoWrapper').db.add('bots')
var runner = require('../../lib/runner')

var info = function(req,res,next){
  db.bots.findOne({slug : req.params.slug, owner : req.user._id.toString()},function(err,bot){
    if(err) return res.json({error : err.message})
    if(!bot) return next()
    res.json(bot)
  })
}

var run = function(req,res,next){
  performBotMethod('run',req,res,next)
}
var stop = function(req,res,next){
  performBotMethod('stop',req,res,next)
}
var status = function(req,res,next){
  db.bots.findOne({slug : req.params.slug},function(err,bot){
    if(err || !bot) return res.json({error : err ? err.message : "bot not found.", fatal : true})
    runner.status(bot,function(err,status){
      res.json(status)
    })
  })
}

var performBotMethod = function(method,req,res,next){
  runner[method](req.params.slug,function(err,info){
    if(err) return res.json({error : err.message, fatal : true})
    db.bots.findOne({slug : req.params.slug},function(err,bot){
      if(err || !bot) return res.json({error : err ? err.message : "bot not found.", fatal : true})
      runner.status(bot,function(err,status){
        info.status = status
        res.json(info)
      })
    })
  })
}

module.exports = function(app){
  app.get('/bots/info/:slug',info)
  app.get('/bots/run/:slug',run)
  app.get('/bots/stop/:slug',stop)
  app.get('/bots/status/:slug',status)
}