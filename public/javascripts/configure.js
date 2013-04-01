$(function(){
  var botSlug = $("#configure").attr('data-bot')
  if(botSlug){
    var lastUpdate
    // we're on a bot page, poll until the bot is updated.
    // commence super hacky polling
    $.getJSON('/bots/info/' + botSlug,function(r){
      lastUpdate = r.last_updated
      var updateInterval = setInterval(function(){
        $.getJSON('/bots/info/' + botSlug,function(r){
          if(r.last_updated != lastUpdate){
            // go to the next page
            window.location = window.location
          }
        })
      },2000)
    })
  }
  
  var currentPopup
  var popupFeatures = "menubar=no,location=no,toolbar=no,status=no,resizable=no,dialog=yes,height=640,width=600"
  $("#configure")
    .on('click','.bot_login',function(){
      // open a popup headed to auth for this bot
      currrentPopup = window.open('/auth/attach/twitter/' + botSlug,'_blank',popupFeatures)
    })
    .on('click','.save.button',function(){
      $('#configure form').submit()
    })
    .on('click','#delete',function(){
      var del = confirm("Are you sure you want to delete this bot?")
      if(del){
        $.getJSON('/bots/delete/' + botSlug,function(r){
          // go home when done
          window.location = '/'
        })
      }
    })
})