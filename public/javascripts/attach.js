$(function(){
  //var step1 = $("#attach .step1")
  //var step2 = $("#attach .step2")
  
  var botSlug = $("#attach").attr('data-bot')
  if(botSlug){
    alert(botSlug)
    var lastUpdate
    // we're on a bot page, poll until the bot is updated.
    // commence super hacky polling
    $.getJSON('/bots/info/' + botSlug,function(r){
      lastUpdate = r.last_updated
      var updateInterval = setInterval(function(){
        $.getJSON('/bots/info/' + botSlug,function(r){
          if(r.last_updated != lastUpdate){
            // go to the next page
            $(".finished.button").click()
          }
        })
      },500)
    })
  }
  
  var currentPopup
  var popupFeatures = "menubar=no,location=no,toolbar=no,status=no,resizable=no,dialog=yes,height=640,width=600"
  $("#attach")
    /*.on('click','.step1done',function(){
      step1.animate({
        left : "-=" + step1.width(),
        opacity : 0
      },400,function(){
        step1.hide()
      })
      step2.show().css('opacity',0)
      step2.animate({
        left : "0px",
        opacity:1
      },400,function(){
        
      })
    })
    .on('click','.createAccount',function(){
      step2.animate({
        left : "+=" + step1.width(),
        opacity : 0
      },400,function(){
        step2.hide()
      })
      step1.show().css('opacity',0)
      step1.animate({
        left : "0px",
        opacity:1
      },400,function(){
        
      })
    })*/
    .on('click','.bot_login',function(){
      // open a popup headed to auth for this bot
      currrentPopup = window.open('/auth/attach/twitter/' + botSlug,'_blank',popupFeatures)
    })
})