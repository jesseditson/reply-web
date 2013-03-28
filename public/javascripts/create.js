$(function(){
  
  $("#create,#configure")
    .on('click','.addReply',function(){
      // add reply
      var replyForm = $(this).closest("form").find(".replies .field").first().clone()
      replyForm.find('input').val('')
      $(this).closest("form").find(".replies").append(replyForm.hide())
      replyForm.slideDown(400)
    })
    .on('click','.removeReply',function(){
      if($('.replies .field').length == 1) return alert('You must have at least one reply.')
      var field = $(this).closest('.field')
      field.animate({left:"-=" + field.width()/2,opacity:0,height:0},300,function(){
        field.remove()
      })
    })
    .on('change','.maxRepliesField input',function(){
      $(this).closest('.field').find('.max_replies_num').html($(this).val())
    })
    .on('keyup','input',function(){
      $(this).removeClass('fail')
    })
    /*.on('keyup','.replies input',function(e){
     var code = (e.keyCode ? e.keyCode : e.which)
      if(code == 219){
        // TODO: autocomplete fields from tweet
      }
    })*/
    .on('click','.create.button',function(){
      $('#create form').submit()
    })
    .on('submit','form',function(){
      var failed = false
      $(this).find('[required]').each(function(){
        if(!$(this).val()){
          failed = true
          $(this).addClass('fail')
        }
      })
      if(!failed){
        var overlay = $("#loadingOverlay").fadeIn(200)
        $.ajax({
          url : $(this).attr('action'),
          type : 'POST',
          data : $(this).serialize(),
          success : function(r){
            var timeout = 1000
            if(r.error || r.errors){
              overlay.removeClass('loading').addClass('failed').find('span').html("Error : " + (r.error || "") + (r.errors || []).join(', '))
            } else {
              overlay.removeClass('loading').addClass('success')
              timeout = 500
            }
            setTimeout(function(){
              overlay.fadeOut(200,function(){
                overlay.removeClass('failed').removeClass('success').addClass('loading')
              })
              if(r.nextPage) window.location = r.nextPage
            },timeout)
          }
        })
      }
      return false
    })
})