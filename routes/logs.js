var db = require('../lib/mongoWrapper').db.add('logs').add('bots')
var moment = require('moment')

var pageSize = 20

var render = function(req,res,err,data){
  if(req.headers['x-requested-with']){
    // return json for api-like calls
    if(err) return res.json({error : err.message})
    res.render('logItems',data,function(err,html){
      if(err) return res.json({error : err.message})
      data.html = html.trim()
      res.json(data)
    })
  } else {
    // return html for other clients
    if(err) return res.render('error',{error : err.message})
    res.render('logs',data)
  }
}

var humanizeLog = function(log){
  var message = ""
  var link = false
  Object.keys(log.messages).forEach(function(k){
    var m = log.messages[k]
    try {
      m = JSON.parse(m)
    } catch(e){}
    if(m && m.id_str){
      // this is a tweet response, parse it into something readable & link it.
      link = "http://twitter.com/" + m.user.screen_name + "/status/" + m.id_str
      message += '"' + m.text + '" '
      if(m.in_reply_to_status_id_str){
        message += 'in reply to tweet : http://twitter.com/'+m.in_reply_to_user_id_str+'/status/'+m.in_reply_to_status_id_str+' '
      }
    } else {
      message += '"' + m + '"  '
    }
  })
  return {
    level : log.level,
    message : message,
    time : moment(log.timestamp).fromNow(),
    timestamp : log.timestamp.getTime(),
    link : link
  }
}

var logs = function(req,res,next){
  var start = req.params.page ? parseInt(req.params.page,10) * pageSize : 0
  db.logs.findArray({slug : req.params.slug},{sort : [["_id",-1]], skip : start, limit : pageSize},function(err,logs){
    logs = logs.map(humanizeLog)
    if(err) return render(req,res,err)
    db.bots.findOne({slug : req.params.slug},function(err,bot){
      if(err) return render(req,res,err)
      if(!bot) return render(req,res,new Error("Invalid Bot"))
      var nextPage = false
      if(logs.length == pageSize) nextPage = req.params.page ? parseInt(req.params.page,10)+1 : 1
      return render(req,res,null,{logs : logs, bot : bot, pageName : "logs", nextPage : nextPage, pageSize : pageSize})
    })
  })
}


module.exports = function(app){
  app.get('/logs/:slug/:page?',logs)
}