$(function(){
  var checkStatus = function(){
      $('.bot .on').each(function(){
      var el = $(this)
      var slug = el.attr('data-bot')
      $.getJSON('/bots/status/' + slug,function(r){
        updateStatus(el.closest('.bot').find('.status'),r)
        if(r.code == 0){
          el.attr('checked','checked')
        } else {
          el.removeAttr('checked')
        }
      })
    })
  }
  var updateStatus = function(el,status){
    var icon = status.code == 0 ? 'ok' : status.code == 1 ? 'warning-sign' : 'remove'
    el.find('i').removeAttr('class').addClass('icon-'+icon)
    el.find('span').html(status.message)
  }
  
  var dashboard = $("#dashboard")
    .on('change','.on',function(){
      var el = $(this)
      var slug = el.attr('data-bot')
      var on = !el.is(':checked')
      var endpoint = "/bots/" + (on ? 'stop' : 'run') + '/' + slug
      showLoading((on ? "Stopping" : "Starting") + " Bot...")
      $.getJSON(endpoint,function(r){
        if(r.error){
          showError(r)
          el.removeAttr('checked')
        } else {
          showSuccess("Successfully " + (on ? "Stopped" : "Started") + " Bot!")
          updateStatus(el.closest('.bot').find('.status'),r.status)
        }
        hideLoading(1000)
      })
    })
  if(dashboard.length){
    var checkStatusInterval = setInterval(checkStatus,5000)
    checkStatus()
  }
})