var config = require('config-heroku')
var db = require('./mongoWrapper').db.add('users')
var mongoErrors = require('../lib/mongoWrapper').errorCodes
var ObjectId = require('mongodb').ObjectID
var passport = require('passport')
var passwordHash = require('password-hash')
var TwitterStrategy = require('passport-twitter').Strategy
var _ = require('underscore')

passport.use(new TwitterStrategy({
    consumerKey: config.services.twitter.consumer_key,
    consumerSecret: config.services.twitter.consumer_secret,
    callbackURL: config.services.callbackHost + "/auth/twitter/callback",
    forceLogin : true
  },
  function(token, tokenSecret, profile, done) {
    var user = {
      profile : profile,
      auth : {
        token : token,
        tokenSecret : tokenSecret
      },
      twitterId : profile.id
    }
    db.users.update({twitterId : user.twitterId},{ $set : user }, {upsert : true}, function(err){
      if(err) console.error("Error updating user: ",err.stack)
      // updated user info.
      db.users.findOne({twitterId : user.twitterId},done)
    })
  }
))

passport.serializeUser(function(user, done) {
  done(null, user._id.toString())
})

passport.deserializeUser(function(user, done) {
  db.users.findOne({_id : ObjectId(user)},done)
})

var authentication = module.exports = {
  addRoutes : function(app){
    // Twitter
    app.get('/auth/twitter',passport.authenticate('twitter'))
    app.get('/auth/twitter/callback',passport.authenticate('twitter', { failureRedirect: '/' }),function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/')
    })
    // log out
    app.get('/logout', function(req, res){
      req.logout()
      res.redirect('/')
    })
  },
  middleware : function(req,res,next){
    var file = /\.\w+$/.test(req.url)
    var auth = /^\/auth/.test(req.url)
    if(!auth && !file && !req.user) return res.render('login')
    next()
  },
  passport : passport
}
