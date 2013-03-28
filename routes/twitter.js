var request = require('request')
var OAuth= require('oauth').OAuth
var config = require('config-heroku')
var db = require('../lib/mongoWrapper').db.add('bots')

var oa = new OAuth(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  config.services.twitter.consumer_key,
  config.services.twitter.consumer_secret,
  "1.0",
  config.services.callbackHost+"/auth/attach/twitter/callback",
  "HMAC-SHA1"
)

var authenticateBot = function(req,res,next){
  var callbackUrl = 'http://' + req.host + '/auth/attach/twitter/callback/' + req.params.bot
  oa.getOAuthRequestToken(function(err, oauth_token, oauth_token_secret, results){
    if (err) {
      console.log(err);
      res.send("yeah no. didn't work.")
    } else {
      req.session.attaching_bot = req.params.bot
      req.session.oauth = {}
      req.session.oauth.token = oauth_token
      //console.log('oauth.token: ' + req.session.oauth.token)
      req.session.oauth.token_secret = oauth_token_secret
      //console.log('oauth.token_secret: ' + req.session.oauth.token_secret)
      // specifying callback url here doesn't work.
      var redirectUrl = 'http://twitter.com/oauth/authenticate?oauth_token='+oauth_token+'&force_login=true&oauth_callback='+callbackUrl
      //console.log("redirecting to : ", redirectUrl)
      req.session.save(function(){
        res.redirect(redirectUrl)
      })
    }
  })
}
var botCallback = function(req,res,next){
  console.log(req.session)
  if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier
    var oauth = req.session.oauth
    var bot = req.session.attaching_bot
    oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, function(error, oauth_access_token, oauth_access_token_secret, user){
      if (error){
        console.log(error)
        res.render('error',{ error : JSON.stringify(error)})
      } else {
        req.session.oauth.access_token = oauth_access_token
        req.session.oauth.access_token_secret = oauth_access_token_secret
        var oauth = {
          token : req.session.oauth.token,
          token_secret : req.session.oauth.token_secret,
          access_token : oauth_access_token,
          access_token_secret : oauth_access_token_secret
        }
        var toSet = {
          currentAccount : user,
          currentCredentials : oauth,
          last_updated : new Date().getTime()
        }
        console.log("updating bot : ", bot, toSet)
        db.bots.update({slug : bot, owner : req.user._id.toString()},{ $set : toSet },function(err){
          if(err) console.error("Failed to update bot : ", err)
          // close this window
          res.send("<script>window.close()</script>")
        })
      }
    })
  } else {
    next(new Error("you're not supposed to be here."))
  }
}

module.exports = function(app){
  app.get('/auth/attach/twitter/callback/:bot?',botCallback)
  app.get('/auth/attach/twitter/:bot',authenticateBot)
}