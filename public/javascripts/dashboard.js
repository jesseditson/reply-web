$(function(){
  $("#dashboard")
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
          el.closest('.bot').find('.status').html(r.status)
        }
        hideLoading(1000)
      })
    })
})