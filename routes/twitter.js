var request = require('request')
var OAuth= require('oauth').OAuth
var config = require('config-heroku')

var oa = new OAuth(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  config.services.twitter.consumer_key,
  config.services.twitter.consumer_secret,
  "1.0",
  config.services.callbackHost+"/auth/attach/twitter/callback",
  "HMAC-SHA1"
)

var create = function(req,res,next){
  request('https://twitter.com/').pipe(res)
}
var proxy = function(req,res,next){
  req.url = 'https://twitter.com' + req.url.replace(/^\/twitter\/proxy/,'')
  req.pipe(request(req.url)).pipe(res)
}

var authenticateBot = function(req,res,url){
  oa.getOAuthRequestToken(function(err, oauth_token, oauth_token_secret, results){
    if (err) {
      console.log(err);
      res.send("yeah no. didn't work.")
    } else {
      req.session.oauth = {}
      req.session.oauth.token = oauth_token
      console.log('oauth.token: ' + req.session.oauth.token)
      req.session.oauth.token_secret = oauth_token_secret
      console.log('oauth.token_secret: ' + req.session.oauth.token_secret)
      var redirectUrl = config.services.callbackHost+'/twitter/proxy/oauth/authenticate?oauth_token='+oauth_token+'&force_login=true'
      console.log("redirecting to : ", redirectUrl)
      res.redirect(redirectUrl)
    }
  })
}
var botCallback = function(req,res,url){
  if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier
    var oauth = req.session.oauth
    oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, function(error, oauth_access_token, oauth_access_token_secret, results){
      if (error){
        console.log(error)
        res.send("yeah something broke.")
      } else {
        req.session.oauth.access_token = oauth_access_token
        req.session.oauth,access_token_secret = oauth_access_token_secret
        console.log(results)
        res.send("worked. nice one.")
      }
    })
  } else {
    next(new Error("you're not supposed to be here."))
  }
}

module.exports = function(app){
  app.get('/twitter/create',create)
  app.get('/twitter/proxy/*',proxy)
  app.get('/auth/attach/twitter',authenticateBot)
  app.get('/auth/attach/twitter/callback',botCallback)
}