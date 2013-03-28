var db = require('../../lib/mongoWrapper').db.add('bots')

var info = function(req,res,next){
  db.bots.findOne({slug : req.params.slug, owner : req.user._id.toString()},function(err,bot){
    if(err) return res.json({error : err.message})
    if(!bot) return next()
    res.json(bot)
  })
}

module.exports = function(app){
  app.get('/bots/info/:slug',info)
}