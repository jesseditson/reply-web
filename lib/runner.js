var db = require('./mongoWrapper').db.add('bots').add('logs')
var reply = require('replybot')

var Logger = function(slug){
  var doLog = function(){
    var info = {
      slug : slug,
      timestamp : new Date(),
      level : this.level,
      messages : arguments
    }
    db.logs.insert(info,{safe : false})
  }
  return {
    log : function(){
      doLog.apply({level : 'log'},arguments)
    },
    error : function(){
      doLog.apply({level : 'error'},arguments)
    },
    warn : function(){
      doLog.apply({level : 'warn'},arguments)
    }
  }
}

// in-memory store. This instance can only destroy the streams it started.
// TODO: support multiple processes. Need to find a way to detect if a bot is already running.
// Possibly store the pid with each bot in the db, then check if the pid is running?
// Possibly store the port & hostname of the running process? (probably won't work on heroku)
var runningBots = {}

var runner = module.exports = {
  bootstrap : function(){
    db.bots.findArray({on : true, $or : [{running : false}, {running : { $exists : false } }]},{slug : 1},function(err,bots){
      if(err) throw err
      bots.forEach(function(slug){
        runner.run(slug,function(err,bot){
          if(err) throw err
        })
      })
    })
  },
  run : function(slug,callback){
    db.bots.findAndModify({slug : slug, $or : [{running : false}, {running : { $exists : false } }]},[],{$set : {running : true}},{new : true},function(err,bot){
      if(err) return callback(err)
      if(!bot) return callback(null,{error : "Could not find non-running bot."})
      try {
        reply({
          twitter : {
            consumer_key : config.services.twitter.consumer_key,
            consumer_secret : config.services.twitter.consumer_secret,
            access_token : bot.currentCredentials.access_token,
            access_token_secret : bot.currentCredentials.access_token_secret
          },
          keywords : bot.keywords,
          match : bot.match,
          replies : bot.replies,
          max_replies_per_minute : bot.max_replies_per_minute,
          in_reply_to : bot.in_reply_to
        },function(stream){
          runningBots[slug] = stream
          return callback(null,stream)
        })
      } catch(e){
        return callback(e)
      }
    })
  }
}