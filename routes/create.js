var db = require('../lib/mongoWrapper').db.add('bots')
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
  var errors = Object.keys(data).map(function(f){
    switch(f){
      case 'match' :
        if(!data[f].length) return f + ' cannot be empty.'
        try {
          new RegExp(data[f])
        } catch(e){
          return f + ' is not a valid regular expression. ('+e.message+')'
        }
        break;
      case 'in_reply_to' :
        return false
        break;
      case 'replies' :
        return data[f].
        break;
      default :
        if(!data[f].length) return f + ' cannot be empty.'
        break;
    }
    return false
  }).filter(function(f){ return f })
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
  db.bots.findOne({slug : slug},function(err,bot){
    n = (n || 0) + 1
    if(err) return callback(err)
    if(bot) return getBotSlug(slug + '-' + n,callback,n)
    callback(null,slug)
  })
}

module.exports = function(app){
  app.get('/create',renderCreate)
  app.post('/create',create)
}