var showLoading = function(message){
  var overlay = $("#loadingOverlay").fadeIn(200)
  overlay.removeClass('failed').removeClass('success').addClass('loading')
  if(message) overlay.find('.loading span').html(message)
}
var hideLoading = function(timeout,done){
  var overlay = $("#loadingOverlay")
  setTimeout(function(){
    overlay.fadeOut(200,function(){
      overlay.removeClass('failed').removeClass('success').addClass('loading')
      overlay.find('.failed span').html('Failed.')
      overlay.find('.success span').html('Success!')
      overlay.find('.loading span').html('Loading...')
      if(done) done()
    })
  },timeout)
}
var showSuccess = function(message){
  var overlay = $("#loadingOverlay")
  overlay.removeClass('loading').removeClass('failed').addClass('success')
  if(message) overlay.find('.success span').html(message)
}
var showError = function(r){
  var overlay = $("#loadingOverlay")
  overlay.removeClass('loading').addClass('failed')
  if(r && (r.error || r.errors)) overlay.find('.failed span').html("Error : " + (r.error || "") + (r.errors || []).join(', '))
}