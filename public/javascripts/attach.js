$(function(){
  var step1 = $("#attach .step1")
  var step2 = $("#attach .step2")
  $("#attach")
    .on('click','.step1done',function(){
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
    })
})