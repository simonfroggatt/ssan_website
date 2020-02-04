
$( "#selectsize" ).on('change', function() {

  newSign.clearSign()
  var sizeIndex = $(this).val() - 1

  var newWidth = sizePredefArray[sizeIndex][0]
  var newHeight = sizePredefArray[sizeIndex][1]

  newSign.setSize(newWidth,newHeight)

  newSign.drawSign()
});

$(function() {
    $('#toggle-border').change(function() {
      var hasBorder = $(this).prop('checked')
      var hasRadius = $('#toggle-radiusBorder').prop('checked')
        newSign.clearSign()
        newSign.setBorderStatus(hasBorder, hasRadius)
        newSign.drawSign()
      if(hasBorder){
        $('#toggle-radiusBorder').bootstrapToggle('enable')
      }
      else{
        $('#toggle-radiusBorder').bootstrapToggle('disable')
      }
    })

    $('#toggle-radiusBorder').change(function() {
      var hasRadius = $(this).prop('checked')
      var hasBorder = $('#toggle-border').prop('checked')
      newSign.clearSign()
      newSign.setBorderStatus(hasBorder, hasRadius)
      newSign.drawSign({borderRadius: true})
    })

    $('#removeSymbol_1').click(function() {
      newSign.removeSymbol(1)
      newSign.clearSign()
      newSign.drawSign()
    })
  })


  $(window).load(function() {
      $("img").click(function(){
          var whichImage = $(this).attr('id')
          var id = whichImage.replace('symbol_','')
          var multiSymbol = id.split('_')

          var symbolInfoArray = imageArray.filter(function (imageArray) { return imageArray.id == multiSymbol[1] });
          var symbolInfo = symbolInfoArray[0];
        //  var symbolInfo = imageArray[multiSymbol[1]]


          newSign.clearSign()
          newSign.setSymbol(symbolInfo, multiSymbol[0],  false)
          newSign.drawSign()
       });
  });
