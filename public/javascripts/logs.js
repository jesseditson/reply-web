$(function(){
  var dedupe = function(logs){
    var stamps = {}
    $(logs).each(function(){
      stamps[$(this).attr('data-ts')] = this
    })
    $('.logMessage').each(function(){
      var ts = $(this).attr('data-ts')
      console.log(ts, Object.keys(stamps))
      delete stamps[ts]
    })
    var uniqueLogs = []
    for(var l in stamps){
      uniqueLogs.push(stamps[l])
    }
    console.log(uniqueLogs)
    return uniqueLogs
  }
  
  var checkLogs = function(){
    var bot = $('.more').attr('data-bot')
    $.ajax('/logs/' + bot,function(r){
      var els = dedupe($(r.html))
      $("#logs .header").after(html)
    })
  }
  
  var logs = $("#logs")
    .on('click','.more',function(){
      var el = $(this)
      var page = el.attr('data-next')
      var bot = el.attr('data-bot')
      showLoading()
      $.getJSON('/logs/' + bot + '/' + page,function(r){
        if(r.error){
          showError(r.error)
          hideLoading(2000)
        } else {
          hideLoading(0)
        }
        var logs = dedupe($(r.html))
        el.closest('a').before(logs)
        if(r.nextPage){
          el.attr("data-next", r.nextPage)
        } else {
          el.slideUp()
        }
      })
    })
  if(logs.length){
    var checkLogsInterval = setInterval(checkLogs,5000)
    checkLogs()
  }
})