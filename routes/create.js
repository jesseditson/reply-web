var db = require('../lib/mongoWrapper').db.add('bots')
var validateBot = require('../lib/validateBot')
var WordGenerator = require('wordgenerator')
var wordGenerator = new WordGenerator()

var renderCreate = function(req,res,next){
  wordGenerator.generate({num : 2, separator : ' '},function(err,name){
    res.render('create',{pageName : "create",randomName : name})
  })
}
var create = function(req,res,next){
  if(!req.user) return next()
  if(!req.body) return next()
  var data = req.body
  var errors = validateBot(data)
  if(errors.length) return res.json({errors : errors})
  getBotSlug(data.name,function(err,slug){
    if(err) return res.json({error : err})
    db.bots.insert({
      slug : slug,
      name : data.name,
      keywords : data.keywords,
      match : new RegExp(data.match,'i'),
      replies : data.replies,
      max_replies_per_minute : data.max_replies_per_hour / 60,
      in_reply_to : data.in_reply_to === 'on',
      owner : req.user._id.toString()
    },{safe:true},function(err,docs){
      if(err) return res.json({error : err.message})
      return res.json({ nextPage : "/attach/" + slug})
    })
  })
}

var getBotSlug = function(slug,callback,n){
  slug = slug.replace(/[^\w\d\-_\+]/g,'').toLowerCase()
  var nextSlug = n ? slug + '-' + n : slug
  db.bots.findOne({slug : nextSlug},function(err,bot){
    n = (n || 0) + 1
    if(err) return callback(err)
    if(bot) return getBotSlug(slug,callback,n)
    callback(null,nextSlug)
  })
}

module.exports = function(app){
  app.get('/create',renderCreate)
  app.post('/create',create)
}