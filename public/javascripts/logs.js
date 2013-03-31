$(function(){
  $("#logs")
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
        el.closest('a').before(r.html)
        if(r.nextPage){
          el.attr("data-next", r.nextPage)
        } else {
          el.slideUp()
        }
      })
    })
})