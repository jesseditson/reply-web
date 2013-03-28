var db = require('../lib/mongoWrapper').db.add('bots')

var attach = function(req,res,next){
  db.bots.findOne({slug : req.params.slug, owner : req.user._id.toString()},function(err,bot){
    if(err) return res.render('error',{error : err.message})
    // not their bot or invalid slug
    if(!bot) return next()
    res.render('attach',{pageName : "attach", bot : bot})
  })
}

module.exports = function(app){
  app.get('/attach/:slug',attach)
}