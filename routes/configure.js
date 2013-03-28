var db = require('../lib/mongoWrapper').db.add('bots')
var validateBot = require('../lib/validateBot')
var WordGenerator = require('wordgenerator')
var wordGenerator = new WordGenerator()

var configure = function(req,res,next){
  db.bots.findOne({owner : req.user._id.toString(), slug : req.params.slug},function(err,bot){
    if(err) return res.render('error',{error : err.message})
    wordGenerator.generate({num : 2, separator : ' '},function(err,name){
      bot.stringMatch = bot.match.toString().replace(/^\//,'').replace(/\/\w*$/,'')
      res.render('configure', {bot : bot, randomName : name, pageName : "configure" })
    })
  })
}

var validateBot = require('../lib/validateBot')

var save = function(req,res,next){
  if(!req.user) return next()
  if(!req.body) return next()
  var data = req.body
  var errors = validateBot(data)
  if(errors.length) return res.json({errors : errors})
  db.bots.update({slug : data.slug, owner : req.user._id.toString()},{ $set : {
    name : data.name,
    keywords : data.keywords,
    match : new RegExp(data.match,'i'),
    replies : data.replies,
    max_replies_per_minute : data.max_replies_per_hour / 60,
    in_reply_to : data.in_reply_to === 'on'
  } },{safe:true},function(err,docs){
    if(err) return res.json({error : err.message})
    return res.json({ nextPage : "/configure/" + data.slug})
  })
}

module.exports = function(app){
  app.get('/configure/:slug',configure)
  app.post('/save',save)
}