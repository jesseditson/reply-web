var config = require('config-heroku')
var db = require('./mongoWrapper').db.add('users')
var mongoErrors = require('../lib/mongoWrapper').errorCodes
var ObjectId = require('mongodb').ObjectID
var passport = require('passport')
var passwordHash = require('password-hash')
var LocalStrategy = require('passport-local').Strategy
var _ = require('underscore')

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },function(email, password, done) {
    // get a lookup email that will match fake duplicate emails (ignore dots and trailing + in address)
    var lookupEmail = getEmailRegex(email)
    db.users.findOne({email:lookupEmail},function(err, user) {
      if (err) return done(err)
      if(!user) return done(null,false, {error : "Invalid email", email : email, errorField : 'email'})
      if(!passwordHash.verify(password, user.password)){
        return done(null, false, {error: 'Invalid password', email:email, errorField : 'password'})
      }
      done(null, user)
    })
  })
)

var getEmailRegex = function(email){
  var emailParts = email.split("@")
  // ignore dots and last + in emails
  var emailNameParts = emailParts.shift().replace('.','').split('+')
  var afteremail = false
  if(emailNameParts.length >  1) afteremail = emailNameParts.pop()
  var reString = "^" + ('\\.?' + emailNameParts.join('').split('').join('\\.?') + '\\.?') + '(\\+[^@]\+?)?@' + emailParts.join() + "$"
  return new RegExp(reString,'i')
}

passport.serializeUser(function(user, done) {
  done(null, user._id.toString())
})

passport.deserializeUser(function(user, done) {
  db.users.findOne({_id : ObjectId(user)},done)
})

var signInOrCreateUser = function(req,res,userInfo,callback){
  // default req.body to passed userInfo
  req.body = _.defaults(req.body,userInfo)
  passport.authenticate('local',function(err, user, info) {
    if(err) return res.send(500, err)
    if(!user && userInfo.username){
      // user is trying to sign up
      if(userInfo.username.length < 2){
        // invalid username attempted signup
        return callback(new Error("Invalid Username"))
      } else {
        // user doesn't exist and we were passed a username, so sign them up.
        // require the agree field for this action
        if(req.body.agree !== 'on') return callback(new Error('You must agree to the terms of service.'))
        db.users.insert(userInfo, function(err) {
          // handle insert errors
          if (err && err.code === mongoErrors.dupKey) {
            callback(new Error("User Already Exists"))
          } else if(err){
            callback(err)
          } else {
            callback(null,userInfo)
          }
        })
      }
    } else if(!user) {
      // tried to log in & failed
      delete userInfo.password
      callback(new Error("Wrong Password"))
    } else {
      callback(null,user)
    }
  })(req, res)
}

var validateBody = function(fields){
  var errors = []
  // TODO: better email validation (validate DNS and shit)
  var emailMatch = /[^\s@]+?@[^\s\@\.]+?\.[^\s\@]+/
  if(!emailMatch.test(fields.email)) errors.push('invalid email')
  if(fields.username && !/^[\w_]{3,}$/.test(fields.username)) errors.push('invalid username')
  if(fields.password.length < 5) errors.push('invalid password')
  if(errors.length) return errors.join("\n")
  return false
}

// Log in Method
var login = function(req,res,next){
  var body = req.body
  body.redirectUrl = req.session && req.session.returnTo || body.redirectUrl
  var redirectUrl = body.redirectUrl ? decodeURIComponent(body.redirectUrl) : '/profile'
  var login = function(user){
    // log in the user
    req.login(user, function(err) {
      if(err) console.error("Log in Error: ", err.stack)
      if(err) return res.send(500, err)
      res.json(user)
    })
  }
  var error = function(info){
    res.json(info)
  }
  var userInfo = {
    email : body.email,
    username: body.username ? body.username.toLowerCase() : false,
    displayName: body.username,
    password: passwordHash.generate(body.password)
  }
  var invalid = validateBody(body)
  if(invalid){
    return error({error : invalid, email : userInfo.email, username : userInfo.username, validate : true})
  }
  signInOrCreateUser(req,res,userInfo,function(err,info){
    if(err) return error({error:err.message, email : userInfo.email, username : userInfo.username, validate : true})
    login(info)
  })
}

var authentication = module.exports = {
  addRoutes : function(app){
    
  },
  passport : passport,
  login : login
}
