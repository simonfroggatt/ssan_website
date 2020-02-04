var numTextPanel = 0;
var numTextBlocks = 0;
var textBlockID = 0;
var lockSymbol = 1;
var lockText = 1;

$(function() {
  $('#toggle-border').change(function() {
    var hasBorder = $(this).prop('checked');
    var hasRadius = $('#toggle-radiusBorder').prop('checked');
    newSign.clearSign();
    newSign.setBorderStatus(hasBorder, hasRadius);
    newSign.drawSign();
    if (hasBorder) {
      $('#toggle-radiusBorder').bootstrapToggle('enable');
    } else {
      $('#toggle-radiusBorder').bootstrapToggle('disable');
    }
  });

  $('#toggle-radiusBorder').change(function() {
    var hasRadius = $(this).prop('checked');
    var hasBorder = $('#toggle-border').prop('checked');
    newSign.clearSign();
    newSign.setBorderStatus(hasBorder, hasRadius);
    newSign.drawSign({
      borderRadius: true
    });
  });

  $('#removeSymbol_1').click(function() {
    newSign.removeSymbol(1);
    newSign.clearSign();
    newSign.drawSign();
  });



});


$(document).ready(function() {


  //symbols setup
  if ($('.bespokeSymbol').length) {

    var $rangeslider = $('#symbolSlider');
    var output = document.querySelectorAll('output')[0];

    $rangeslider
      .rangeslider({
        polyfill: false,

        onSlide: function(position, value) {
          var needbuild = newSign.setSymbolScale(Math.round(value));

          // if(needbuild)
          //  newSign.ScaleSymbol()
        },
      });


  //  newSign.setSymbol(imageArray[0], 0, false);


    /*var symbolDefs = newSign.getSymbolFrameDefs()

    var $rangeslider = $('#symbolSlider');
    var output = document.querySelectorAll('output')[0];

    $rangeslider
      .rangeslider({
        polyfill: false,

        onSlide: function(position, value) {
          var needbuild = newSign.setSymbolScale(Math.round(value))

          // if(needbuild)
          //  newSign.ScaleSymbol()
        },
      })*/

  }

  $('.bespokeSymbol').click(function() {
    //  $(this).preventDefault();
    //  alert('img clicked')
    var whichImage = $(this).attr('id');
    var id = whichImage.replace('symbol_', '');
    var multiSymbol = id.split('_');

    var symbolInfoArray = imageArray.filter(function(imageArray) {
      return imageArray.id == multiSymbol[1];
    });
    var symbolInfo = symbolInfoArray[0];

    newSign.setSymbol(symbolInfo, multiSymbol[0], true); //function(imageInfo, imagePosition = 0, redraw = true)
    //  newSign.buildSign(true)

  });



  //size & material setup
  if ($('#posize').length) {
    $('#posize').change(function() {
      var sizeIndex = $(this).val();
      reDrawForSizeChange(sizeIndex);


    });

    newSign.setSize(prod_variants[0].width, prod_variants[0].height, prod_variants[0].symbol_position);

  }

  if ($('#collapseText').length) {

    $('.align-middle-0').button("toggle");

    $("#collapseText").on("keyup", '.textAreaBespokeresize', function(event) {
      var textpanelRef = this.id.split('-');
      newSign.setText(this.value, textpanelRef[1], textpanelRef[2]);
    });

    $("#collapseText").on("click", '.textpanelbuttons button', function(event) {
      $(this).tooltip('hide');
      var btnInfo = this.id.split('-');
      var btnFunction = btnInfo[0];
      var btnFunctionValue = btnInfo[1];
      var textPanelRef = btnInfo[2];
      var textPanelLine = btnInfo[3];

      switch (btnFunction) {
        case 'size':
          changeTextSize(btnFunctionValue, textPanelRef, textPanelLine);
          break;
        case 'move':
          changeTextPosition(btnFunctionValue, textPanelRef, textPanelLine);
          break;
        case 'line':
          changeTextLine(btnFunctionValue, textPanelRef, textPanelLine);
          break;
        case 'delete':
          deleteTextPanel(textPanelRef, textPanelLine);
          break;
      }
    });


    $("#collapseText").on("change", '.textpanelbuttons input[type=radio]', function(event) {
      var btnInfo = this.id.split('-');
      var btnFunction = btnInfo[0];
      var btnFunctionValue = btnInfo[1];
      var textPanelRef = btnInfo[2];
      var textPanelLine = btnInfo[3];

      var needbuild = newSign.setTextAlignment(btnFunctionValue, textPanelRef, textPanelLine);
      // alert('fn:'+btnFunction + ' value:' + btnFunctionValue + ' textref:'+textPanelRef)
    });




    $('#newTextBlock').click(function(event) {
      $(this).tooltip('hide');
      numTextBlocks++;
      textBlockID++;

      var blRoom = newSign.isRoomForNewTextBlock(0);
      if (!blRoom) {
        alert("You don't have enough room at the bottom of this sign.\n Please make space by moving text blocks");
      } else {

        $.get('index.php?route=ssan/bespoke/text_areas_ajax&panel=0&box=' + textBlockID, setNewTextBox);
        newSign.addNewTextBlack(0, textBlockID);
      }
    });

    $('#symbol-chooser-header').on('click', '[data-toggle="collapse in"]', function () {
      alert('adasd');
    });

    $('#symbol-chooser-header').click(function(event) {

      var reCalc = $( "#collapseSymbols" ).is( ":hidden" );
      if(reCalc) {
        setSymbolSlider();
      }

    });


  }


  $('.color-thumb').click(function() {
    //  $(this).preventDefault();
    var whichImage = $(this).attr('id');
    var id = whichImage.replace('bg-color-', '');
    var blankColorInfo = blankSignColours[id];


    var needbuild = newSign.setSignColor(blankColorInfo['color']);
    newSign.setSignTextColor(blankColorInfo['textcolor'], 0);
    newSign.buildSign(true);

    //var multiSymbol = id.split('_')
  });

  $('.color-border').click(function() {
    var whichBorder = $(this).attr('id');
    var color = $(this).data('color');
    var hasBorder = $(this).data('hasborder');

    var needbuild = newSign.setSignBorder(hasBorder, color);
    newSign.buildSign(true);
  });

  $('#lockSymbolSize').change(function() {
    //    newSign.setSymbolLock(this.checked)
  });

  $('#lockTextCenter').change(function() {
    //  newSign.setTextVeticalLock(this.checked)
  });

  $('#test_export').click(function(event) {
  /*  var thumbtemp = new bespokeSign('thumbdrawing');
    var svgCode = thumbtemp.exportToSVG(newSign);
    $.post('exportSVG.php', {
      'svgExport': svgCode
    }, function(data, textStatus, xhr) {
      /*optional stuff to do after success */
  //  });


    console.log(svgCode);
  });

  $('#testbutton').click(function(event) {

    var textout = newSign.getImagesUsed();
    console.log(textout);
  });



  $('#testbutton-load').click(function(event) {

    var jsontmp = {
      "signWidth": "200",
      "signHeight": "300",
      "signColour": "yellow",
      "orientation": 0,
      "symbolPosition": 0,
      "autoSize": true,
      "signBorder": {
        "colour": "black",
        "borderSize": 8,
        "borderRadius": 6
      },
      "signPanel": {
        "colour": "white",
        "margin": {
          "top": 8,
          "right": 8,
          "bottom": 8,
          "left": 8
        }
      },
      "symbols": [],
      "symbolFrameWidth": 60,
      "symbolFrameHeight": 90,
      "symbolSpace": 8,
      "symbolTextFrameSpacer": 0,
      "textContainerMargin": {
        "top": 0,
        "right": 0,
        "bottom": 0,
        "left": 0
      },
      "textPanelSpacer": 8,
      "textPanels": [{
        "colour": "none",
        "baseTextColour": "black",
        "panelRadius": 5,
        "panelCorner": [0, 0, 0, 0],
        "height": 100,
        "margin": {
          "top": 5,
          "right": 5,
          "bottom": 5,
          "left": 5
        },
        "textLines": [{
          "text": "asdasda\nasdsaasd\nsdfd",
          "weight": "Bold",
          "size": 26.8,
          "anchor": "middle",
          "id": 0,
          "x": 100,
          "y": 88.109375,
          "xOffset": 0,
          "yOffset": 0,
          "leading": 1.5,
          "blockHeight": 110.390625,
          "colour": "black"
        }]
      }],
      "textFontHeight": 0,
      "hasSymbol": 0,
      "autoIgnore": {
        "borderSize": false,
        "symbolSizing": false
      },
      "hasBorder": ""
    };
    newSign.loadFromJSON(jsontmp);
    newSign.buildSign(true);

    //{"signWidth":"200","signHeight":"300","signColour":"yellow","orientation":0,"symbolPosition":0,"autoSize":true,"signBorder":{"colour":"black","borderSize":8,"borderRadius":6},"signPanel":{"colour":"white","margin":{"top":8,"right":8,"bottom":8,"left":8}},"symbols":[],"symbolFrameWidth":60,"symbolFrameHeight":90,"symbolSpace":8,"symbolTextFrameSpacer":0,"textContainerMargin":{"top":0,"right":0,"bottom":0,"left":0},"textPanelSpacer":8,"textPanels":[{"colour":"none","baseTextColour":"black","panelRadius":5,"panelCorner":[0,0,0,0],"height":100,"margin":{"top":5,"right":5,"bottom":5,"left":5},"textLines":[{"text":"asdasda\nasdsaasd\nsdfd","weight":"Bold","size":26.8,"anchor":"middle","id":0,"x":100,"y":88.109375,"xOffset":0,"yOffset":0,"leading":1.5,"blockHeight":110.390625,"colour":"black"}]}],"textFontHeight":0,"hasSymbol":0,"autoIgnore":{"borderSize":false,"symbolSizing":false},"hasBorder":""}

  });

});

function reDrawForSizeChange(sizeIndex) {
  var dims = prod_variants.filter(function(prod_variants) {
    return prod_variants.id == sizeIndex;
  });
  var panelID,
    blockID,
    blockText,
    textpanelRef,
    textBlockArr,
    userCustomText,
    i;

  panelID = 0;

  textpanelRef = 'textarea-' + panelID + '-';
  var userCustomText = $('[id*="' + textpanelRef + '"]');

  textBlockArr = [];

  if (userCustomText.length > 0) {
    i = 0;
    while (i < userCustomText.length) {
      textBlockArr.push(userCustomText[i].value);
      i++;
    }
    newSign.changeSignSize(dims[0].width, dims[0].height, dims[0].symbol_position, panelID, textBlockArr);  //function(width, height, orientation = -1, panelID, textBlocks)
  }
}


function setNewTextBox(data) {
  var $panels = $('#textpanel-0');
  $panels.append(data);

}

function setSliderFromSymbol(minVal, maxVal, currentVal, slider) {
  var sliderSteps = eval(maxVal - minVal) / 10;
  var attributes = {
    min: minVal,
    max: maxVal,
    value: currentVal,
    step: sliderSteps
  };
  slider.attr(attributes);
  slider.rangeslider('update', false);


};

function changeTextSize(functionType, textPanelID, textPanelBlockID) {
  var textpanelRef = '#textarea-' + textPanelID + '-' + textPanelBlockID;
  var userCustomText = $(textpanelRef).val();
  if (functionType == 'up') {
    newSign.changeTextSize(2, textPanelID, textPanelBlockID, userCustomText);
  } else {
    newSign.changeTextSize(-2, textPanelID, textPanelBlockID, userCustomText);
  }
}

function changeTextPosition(functionType, textPanelID, textPanelBlockID) {
  if (functionType == 'up') {
    newSign.changeTextPosition(-5, textPanelID, textPanelBlockID);
  } else {
    newSign.changeTextPosition(5, textPanelID, textPanelBlockID);
  }
}


function changeTextLine(functionType, textPanelID, textPanelBlockID) {
  if (functionType == 'up') {
    newSign.changeTextLine(0.1, textPanelID, textPanelBlockID);
  } else {
    newSign.changeTextLine(-0.1, textPanelID, textPanelBlockID);
  }
}


function getSizeWidthHeightByID(sizeID) {
  var width = 0;
  var height = 1;
  $.each(prod_variants, function(index, value) {
    if (value.id === sizeID) {
      width = value.width;
      height = value.height;
      return false;
    }

  });
  return [width, height];
}

function InitialiseBespoke() {
  /*  $('.align-middle-0').button("toggle");
    newSign.setSize(prod_variants[0].width,prod_variants[0].height, prod_variants[0].symbol_position)
    newSign.setSymbol(imageArray[0], 0,  true)*/
    if (typeof imageArray !== 'undefined') {
        newSign.setSymbol(imageArray[0], 0, false);  //function(imageInfo, imagePosition = 0, redraw = true)
    }

  newSign.buildSign(true, '');//, setSymbolSlider)
//  newSign.setText('', 0, 0);

}

function setPreloadedBespoke(bespokeJSON) {
  newSign.loadFromJSON(bespokeJSON);
  newSign.buildSign(true);

  // now setup the text lines.
  var textPanels = newSign.getTextBlocks();
  var textPanelIndex = 0;
  var textBlockIndex = 0;
  textPanels.forEach(function(textPanelInfo, textPanelIndex) {
    //this is the panel level
    var textPanelLines = textPanelInfo.textLines;
    textPanelLines.forEach(function(textBlackInfo, textBlockIndex) {
      //this is the text Blocl level
      //textarea-0-0
      var textblockID = '#textarea-' + textPanelIndex + '-' + textBlockIndex;
      var textareaID = '#textblock-' + textPanelIndex + '-' + textBlockIndex;
      //now check if this text line exists
      if ($(textblockID).length == 0) {
        //need to add this to the DOM
        //  $.get('index.php?route=ssan/bespoke/text_areas_ajax&panel=0&box='+textBlockIndex, setNewTextBox)

        $.get('index.php?route=ssan/bespoke/text_areas_ajax&panel=0&box=' + textBlockIndex)
          .done(function(data) {
            setNewTextBox(data);
            $(textblockID).val(textBlackInfo['text']);
            setAlignButton(textPanelIndex + '-' + textBlockIndex, textBlackInfo['anchor']);

          });
      } else {
        $(textblockID).val(textBlackInfo['text']);
        setAlignButton(textPanelIndex + '-' + textBlockIndex, textBlackInfo['anchor']);
      }
    });
  });
  //setSymbolSlider();

}

function setAlignButton(buttonBlockID, alignType) {
  // /align-start-0-1
  //align-middle-0-1
  // align-end-0-1  textblock-0-1
  var block = '#textblock-' + buttonBlockID;
  $(block + " .textalignment").each(function() {
    $(this).parent('label').removeClass('active');
    $(this).button('toggle');
  });

  var buttonSelect = '#align-' + alignType + '-' + buttonBlockID;
  console.log(buttonSelect);
  var alignButton = $(buttonSelect).parent();
  alignButton.addClass('active');
  $(buttonSelect).button('toggle'); //align-end-0-1

}

function setSymbolSlider() {

  if ($('#symbolSlider').length === 0)
    return;

  var $rangeslider = $('#symbolSlider');

  var symbolDefs = newSign.getSymbolFrameDefs();
  var steps = Math.round(eval(symbolDefs.maxValue - symbolDefs.minValue) / 100);
  if (steps < 1)
    steps = 1;
  var attributes = {
    min: symbolDefs.minValue,
    max: symbolDefs.maxValue,
    value: symbolDefs.currentValue,
    step: steps
  };
  $rangeslider.attr(attributes);
  $rangeslider.val(symbolDefs.currentValue);
  $rangeslider.rangeslider('update', true);

}

function deleteTextPanel(textPanelRef, textPanelLine) {
  if (numTextBlocks > 0) {
    newSign.deleteTextPanel(textPanelRef, textPanelLine);
    newSign.buildSign(true);
    var rowID = "#textblock-" + textPanelRef + "-" + textPanelLine;
    $(rowID).remove();
    numTextBlocks--;

  } else {
    alert('You must have atleast 1 text block');
  }
}
