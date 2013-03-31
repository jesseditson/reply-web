var db = require('./mongoWrapper').db.add('bots').add('logs')
var reply = require('replybot')
var config = require('config-heroku')

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

var setRunning = function(slug,running,callback){
  db.bots.findAndModify({slug : slug},[],{$set : {running : running, on : !running}},{new : true},function(err,bot){
    if(err) return callback(err)
    if(!bot) return callback(null,{error : "Could not find bot"})
    return callback(null,bot)
  })
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
    db.bots.findAndModify({slug : slug, $or : [{running : false}, {running : { $exists : false } }]},[],{$set : {running : true, on : true}},{new : true},function(err,bot){
      if(err) return callback(err)
      if(!bot) return callback(null,{error : "Could not find non-running bot.",status : 1})
      var logger = new Logger(bot.slug)
      logger.log("Started " + bot.name + ", running as " + bot.currentAccount.screen_name)
      try {
        reply({
          twitter : {
            consumer_key : config.services.twitter.consumer_key,
            consumer_secret : config.services.twitter.consumer_secret,
            access_token_key : bot.currentCredentials.access_token,
            access_token_secret : bot.currentCredentials.access_token_secret
          },
          keywords : bot.keywords,
          match : bot.match,
          replies : bot.replies,
          max_replies_per_minute : bot.max_replies_per_minute,
          in_reply_to : bot.in_reply_to,
          logger : logger
        },function(stream){
          runningBots[slug] = stream
          return callback(null,{success : true})
        })
      } catch(e){
        console.log("ERROR RUNNING : ",e.stack)
        setRunning(slug,false,function(){
          return callback(e)
        })
      }
    })
  },
  stop : function(slug,callback){
    var bot = runningBots[slug]
    var err
    if(!bot) err = {error : "Could not find bot stream", status : 2}
    if(bot && !bot.readable) err = {error : "Bot is not running", status : 1}
    setRunning(slug,false,function(runerr,response){
      if(runerr) return callback(runerr)
      if(bot){
        bot.destroy()
        delete runningBots[slug]
      }
      callback(null,err || {success : true})
    })
    
  },
  status : function(botInfo,callback){
    var bot = runningBots[botInfo.slug || botInfo]
    var info = {}
    if(!bot){
      info = {status : "stopped", code : 2}
    } else {
      info.code = bot.readable ? 0 : 1
      info.status = bot.readable ? "running" : "crashed"
    }
    // decorate if given bot info
    if(botInfo.slug){
      info.message = getStatusMessage(null,botInfo,info)
    }
    return callback(null,info)
  }
}

var getStatusMessage = function(err,bot,info){
  var status
  if(err){
    status = "error getting status : " + err.message
  } else if(!bot.currentAccount){
    status = "not connected to an account"
  } else if(info.code == 0){
    status = "running as " + bot.currentAccount.screen_name
  } else if(info.code == 1) {
    status = "crashed as " + bot.currentAccount.screen_name
  } else if(info.code == 2){
    status = "ready to run as " + bot.currentAccount.screen_name
  } else {
    status = "unknown status : " + info.status
  }
  return status
}