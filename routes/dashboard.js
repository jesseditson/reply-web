var db = require('../lib/mongoWrapper').db.add('bots')

var dashboard = function(req,res,next){
  db.bots.findArray({owner : req.user._id.toString()},function(err,bots){
    if(err) return res.render('error',{error : err.message})
    bots = bots.map(addStatus)
    res.render('dashboard',{pageName : "dashboard",bots : bots})
  })
}

var addStatus = function(bot){
  if(!bot.currentAccount){
    bot.status = "not connected to an account"
  } else if(bot.on && bot.running){
    bot.status = "running as " + bot.currentAccount.screen_name
  } else if(bot.on && !bot.running) {
    bot.status = "crashed as " + bot.currentAccount.screen_name
  } else if(!bot.on){
    bot.status = "ready to run as " + bot.currentAccount.screen_name
  }
  return bot
}

module.exports = function(app){
  app.get('/',dashboard)
}