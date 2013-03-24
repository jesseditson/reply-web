
var dashboard = function(req,res,next){
  res.render('dashboard',{pageName : "dashboard"})
}

module.exports = function(app){
  app.get('/',dashboard)
}