var bespokeSign = function(drawObject, options) {
  /*
   * Variables accessible
   * in the class
   */

  SCALE_MAX_PANEL = .9
  BORDER_RATIO = 0.04
  MARGIN_RATIO = 0.02
  SYMBOL_TEXT_RATIO = 0.5
  RADIUS_RATIO = 0.75
  BORDER_RADIUS = 0.00
  DRAWING_WIDTH = 500
  DRAWING_HEIGHT = 500


  IMAGEDIRPATH = './image/'

  var autoIgnore = {
    borderSize: false,
    borderRadius: false,
    symbolSizing: false
  }

  var vars = {

    /*  drawingWidth: 500,
      drawingHeight:500,
      signWidth: 200,
      signHeight: 300,

      autoSize: true,

      orientation: 0, // 0 - Portrait 1 - Landscape

      hasBorder: true,
      signPanel: {colour: 'white', borderSize: 0, borderRadius: 0, borderColour: 'black'},

      textContainerMargin:  {left: 0, right: 0, top: 0, bottom: 0},
      textPanelSpacer: 10,
      textPanels: [ ],

      hasSymbol:0,
      symbols: [],
      symbolPosition: 0,  //0 before text, 1 after text

      symbolContainerWidth: 0,
      symbolContainerHeight: 100,
      symbolSpace: 10,  //set to 0 for auto spacing
      symbolContainerMargin: {left: 0, right: 0, top: 0, bottom: 0},*/

  }

  var bespokeConstructor
  var svgDrawObj

  var root = this

  /*
   * Constructor
   */
  this.construct = function(drawObject, options) {
    // alert('here')
    //   this.svgContainer = drawObject
    $.extend(vars, options)
    //  console.log('bespoke.js');
    //  console.log(vars);

    bespokeConstructor = new bespokeConstruct(vars)
    svgDrawObj = new bespokeDrawer(drawObject, {
      drawingWidth: DRAWING_WIDTH,
      drawingHeight: DRAWING_HEIGHT,
    })
  }
  /*     bespokeConstructor.createSign()

       var signSizing = bespokeConstructor.getSignDimensions()
      // var signFrame = this.bespokeConstructor.getSignFrame()
       var signBorderConstruct = bespokeConstructor.getSignBorder()
       var signPanelConstruct = bespokeConstructor.getSignPanel()
       signPanelConstruct.colour = vars.signPanel.colour
       var signSymbolsConstruct = bespokeConstructor.getSignSymbols()

       var signSymbolFrameContruct = bespokeConstructor.getSymbolFrame()

       var signTextFrameConstruction = bespokeConstructor.getTextFrame()
       var signTextPanelsCosntruction = bespokeConstructor.getTextPanels()

       svgDrawObj = new bespokeDrawer(drawObject, {
         drawingWidth: DRAWING_WIDTH,
         drawingHeight: DRAWING_HEIGHT,
         signWidth: signSizing.width,
         signHeight: signSizing.height,
         signBorder: signBorderConstruct,
         signPanel: signPanelConstruct,
         signBackground: vars.signBackgroundColour,
         signSymbols: signSymbolsConstruct,
         signSymbolFrame: signSymbolFrameContruct,

         signTextFrame: signTextFrameConstruction,
         signTextPanels: signTextPanelsCosntruction,

       })*/


  this.setDrawObj = function(drawObject, newWidth, newHeight) {
    svgDrawObj = new bespokeDrawer(drawObject, {
      drawingWidth: newWidth,
      drawingHeight: newHeight,
    })
  }

  this.buildSign = function(clearSign = false, whatChanged = '', f = false) {

    // bespokeConstructor.attrib(vars)
    bespokeConstructor.createSign()

    var signSizing = bespokeConstructor.getSignDimensions()
    // var signFrame = this.bespokeConstructor.getSignFrame()
    var signBorderConstruct = bespokeConstructor.getSignBorder()
    var signPanelConstruct = bespokeConstructor.getSignPanel()
    //   signPanelConstruct.colour = vars.signPanel.colour
    var signColor = bespokeConstructor.getSignColor()
    var signSymbolsConstruct = bespokeConstructor.getSignSymbols()

    var signSymbolFrameContruct = bespokeConstructor.getSymbolFrame()

    var signTextFrameConstruction = bespokeConstructor.getTextFrame()
    var signTextPanelsCosntruction = bespokeConstructor.getTextPanels()

    var drawVars = {
      signWidth: signSizing.width,
      signHeight: signSizing.height,
      signBorder: signBorderConstruct,
      signPanel: signPanelConstruct,
      signBackground: signColor,
      signSymbols: signSymbolsConstruct,
      signSymbolFrame: signSymbolFrameContruct,

      signTextFrame: signTextFrameConstruction,
      signTextPanels: signTextPanelsCosntruction,
    }

    svgDrawObj.drawSign(drawVars, clearSign, whatChanged)

    if (typeof f == "function") f();
  }

  this.ScaleSymbol = function() {
    bespokeConstructor.createSign()

  //  var signSizing = bespokeConstructor.getSignDimensions()
    // var signFrame = this.bespokeConstructor.getSignFrame()
  //  var signBorderConstruct = bespokeConstructor.getSignBorder()
  //  var signColor = bespokeConstructor.getSignColor()
    var signPanelConstruct = bespokeConstructor.getSignPanel()
    // signPanelConstruct.colour = vars.signPanel.colour
    var signSymbolsConstruct = bespokeConstructor.getSignSymbols()

    var signSymbolFrameContruct = bespokeConstructor.getSymbolFrame()

    var signTextFrameConstruction = bespokeConstructor.getTextFrame()
    var signTextPanelsCosntruction = bespokeConstructor.getTextPanels()

    /*var drawVars = {
      signWidth: signSizing.width,
      signHeight: signSizing.height,
      signBorder: signBorderConstruct,
      signPanel: signPanelConstruct,
      signBackground: signColor,
      signSymbols: signSymbolsConstruct,
      signSymbolFrame: signSymbolFrameContruct,

      signTextFrame: signTextFrameConstruction,
      signTextPanels: signTextPanelsCosntruction,
    }*/

    var drawVars = {
      signPanel: signPanelConstruct,
      signSymbols: signSymbolsConstruct,
      signSymbolFrame: signSymbolFrameContruct,
      signTextFrame: signTextFrameConstruction,
      signTextPanels: signTextPanelsCosntruction,
    }


    svgDrawObj.scaleSymbol(drawVars)
  }

  this.setSize = function(width, height, orientation = -1) {
    var newOrientation;
    if (orientation === -1) {
      if (width > height) {
        newOrientation = 1
      } else {
        newOrientation = 0
      }

    } else {
      newOrientation = orientation
    }
    return bespokeConstructor.setSize(width, height, newOrientation)
  }

  this.setSymbol = function(imageInfo, imagePosition = 0, redraw = true) {
    bespokeConstructor.setSymbol(imagePosition, IMAGEDIRPATH + imageInfo['svg_path'], imageInfo);
    if (redraw) {
      this.buildSign(true)
    }
  }

  this.setSymbolScale = function(scaling) {
    var scaleChanged = bespokeConstructor.setSymbolScale(scaling);
    if (scaleChanged)
      this.ScaleSymbol()
  }

  this.setText = function(textIn, textPanelID, textBlockID) {
    var newTextBlockInfo = svgDrawObj.changeTextBlockContent(textIn, textPanelID, textBlockID);
    bespokeConstructor.setTextBlockInfo(textPanelID, textBlockID, newTextBlockInfo);
  }

  this.setTextAlignment = function(newAligment, textPanelID, textBlockID) {
    bespokeConstructor.setTextAlignment(newAligment, textPanelID, textBlockID)
    svgDrawObj.setTextAlignment(textPanelID, textBlockID)
    // reDrawText(textPanelID, textPanelLineID)
    //  svgDrawObj.drawSign(drawVars)

  }

  this.addNewTextBlack = function(textPanelID, textBlocklID) {
    bespokeConstructor.newTextBlock(textPanelID, textBlocklID)
  }

  this.deleteTextPanel = function(textPanelID, textBlocklID) {
    bespokeConstructor.deleteTextBlock(textPanelID, textBlocklID)
  }

  this.getSymbolFrameDefs = function() {
    var symbolSliderDims,
        textSliderDims,
        maxSymbolSize,
        sliderDims;

    sliderDims = [];
    maxSymbolSize = 0;

/*rtnVal['currentValue'] = vars.symbolFrameWidth;
rtnVal['minValue'] = minSymbolWidth;
rtnVal['maxValue'] = maxSymbolWidth;
*/
    symbolSliderDims =  bespokeConstructor.getSymbolFrameDefs();
    textSliderDims =  svgDrawObj.getSymbolFrameDefs();
    maxSymbolSize = Math.min(symbolSliderDims['maxValue'],symbolSliderDims['currentValue'] + textSliderDims);

    sliderDims['currentValue'] = symbolSliderDims['currentValue'];
    sliderDims['minValue'] = symbolSliderDims['minValue'];
    sliderDims['maxValue'] = maxSymbolSize;

    return sliderDims;

  }

  this.changeTextSize = function(changeBy, textPanelID, textPanelBlockID, userTextIn) {
    //get the origonal text the use put in to make sure we get the line breaks.
    var newTextBlockInfo = svgDrawObj.ChangeTextSize(textPanelID, textPanelBlockID, changeBy, userTextIn);
    bespokeConstructor.setTextBlockInfo(textPanelID, textBlockID, newTextBlockInfo);

  }

  this.changeTextLine = function(changeBy, textPanelID, textPanelLineID) {

    bespokeConstructor.changeTextLine(changeBy, textPanelID, textPanelLineID)
    var newTextPanelInfo = svgDrawObj.changeTextLineSpace(textPanelID, textPanelLineID);
    //  var newTextLines = newTextPanelInfo[textPanelID].textLines;
    /*  newTextLines.forEach(function(newTextInfo, newTextInfoIndex){
      bespokeConstructor.setTextSize(newTextInfo.size, textPanelID, newTextInfoIndex)
    })
*/
  }

  this.changeTextPosition = function(changeBy, textPanelID, textPanelLineID) {
    var newTextPanelInfo = svgDrawObj.moveTextVertically(textPanelID, textPanelLineID, changeBy);
    /*bespokeConstructor.changeTextPosition(changeBy, textPanelID, textPanelLineID)
    var newTextPanelInfo = reDrawText(textPanelID, textPanelLineID);
    var newTextLines = newTextPanelInfo[textPanelID].textLines;
    newTextLines.forEach(function(newTextInfo, newTextInfoIndex){
      bespokeConstructor.setTextOrigin([newTextInfo.x, newTextInfo.y], [newTextInfo.xOffset, newTextInfo.yOffset], textPanelID, newTextInfoIndex)
    })*/
  }

  this.changeSignSize = function(width, height, orientation = -1, panelID, textBlocks) {
    var newOrientation,
        blSizeChanged,
        oldDims,
        drawVars;

    blSizeChanged = false;

    if (orientation === -1) {
      if (width > height) {
        newOrientation = 1
      } else {
        newOrientation = 0
      }

    } else {
      newOrientation = orientation
    }

    blSizeChanged = bespokeConstructor.sizeChangeNeeded(width, height, newOrientation);
    if(blSizeChanged){

        bespokeConstructor.changeSize(width, height, newOrientation, panelID, textBlocks);
        var signSizing = bespokeConstructor.getSignDimensions()
        // var signFrame = this.bespokeConstructor.getSignFrame()
        var signBorderConstruct = bespokeConstructor.getSignBorder()
        var signPanelConstruct = bespokeConstructor.getSignPanel()
        //   signPanelConstruct.colour = vars.signPanel.colour
        var signColor = bespokeConstructor.getSignColor()
        var signSymbolsConstruct = bespokeConstructor.getSignSymbols()

        var signSymbolFrameContruct = bespokeConstructor.getSymbolFrame()

        var signTextFrameConstruction = bespokeConstructor.getTextFrame()
        var signTextPanelsCosntruction = bespokeConstructor.getTextPanels()

        drawVars = {
          signWidth: signSizing.width,
          signHeight: signSizing.height,
          signBorder: signBorderConstruct,
          signPanel: signPanelConstruct,
          signBackground: signColor,
          signSymbols: signSymbolsConstruct,
          signSymbolFrame: signSymbolFrameContruct,

          signTextFrame: signTextFrameConstruction,
          signTextPanels: signTextPanelsCosntruction,
        }

        svgDrawObj.drawSign(drawVars, true)
    }
    //return bespokeConstructor.changeSize(width, height, newOrientation)
  }

  this.setSignColourScheme = function(backgroundColor, hasBorder, borderColor) {
    bespokeConstructor.recolorSigns(backgroundColor, hasBorder, borderColor);
    svgDrawObj.reColorSign(backgroundColor, hasBorder, borderColor);
  }

  this.setSignColor = function(backgroundColor) {
    bespokeConstructor.setSignColor(backgroundColor);

  }

  this.setSignTextColor = function(textColor, textPanelID) {
    bespokeConstructor.setSignTextColor(textColor, textPanelID);
  }

  this.setSignBorder = function(hasBorder, color) {
    bespokeConstructor.setSignBorder(hasBorder, color);
  }

  this.attrib = function(options) {
    $.extend(vars, options)
  }

  this.exportToJSON = function() {
    return bespokeConstructor.exportToJSON();
    //  return bespokeConstructor.getVars();
  }

  this.exportToSVGThumb = function(currentSVGObj) {
    var SVGcode = currentSVGObj.exportToJSON();

    bespokeConstructor.loadFromJSON($.parseJSON(SVGcode));
    this.buildSignForExport(true, true, [100, 100], 'px');
    var SVGCode = svgDrawObj.exportToSVGThumb();
    //  console.log(SVGCode)
    return SVGCode;
    //  this.buildSignForExport(false);
    //console.log(svgDrawObj.exportToSVGThumb());
  }

  this.exportToSVG = function(currentSVGObj) {
    var SVGcode = currentSVGObj.exportToJSON();

    bespokeConstructor.loadFromJSON($.parseJSON(SVGcode));
    this.buildSignForExport(false, false, [], 'mm');
    var SVGCode = svgDrawObj.exportToSVGThumb();
    //  console.log(SVGCode)
    return SVGCode;
    //  this.buildSignForExport(false);
    //console.log(svgDrawObj.exportToSVGThumb());
  }

  this.getTexts = function()
  {
    return svgDrawObj.getTexts();
  }

  this.getImagesUsed = function()
  {
    return  bespokeConstructor.getImagesUsed();
  }


  this.loadFromJSON = function(JSONIn) {
    bespokeConstructor.loadFromJSON(JSONIn);
  }
  this.getTextBlocks = function() {
    return bespokeConstructor.getTextPanels();
  }

  this.setSymbolLock = function(symbolLockStatus) {
    svgDrawObj.setSymbolLock(symbolLockStatus);

  }

  this.setTextVeticalLock = function(textLockStatus) {
    svgDrawObj.setTextVeticalLock(textLockStatus)
  }

  this.isRoomForNewTextBlock = function(panelID) {
    return svgDrawObj.isRoomForNewTextBlock(panelID);
  }

  this.buildSignForExport = function(addBorder = false, addFrame = false, drawingFrame = [200, 200], measurementUnits = 'px', drawObjectHolder = null, f = false) {

    // bespokeConstructor.attrib(vars)
    bespokeConstructor.createSign()

    var signSizing = bespokeConstructor.getSignDimensions()
    // var signFrame = this.bespokeConstructor.getSignFrame()
    var signBorderConstruct = bespokeConstructor.getSignBorder()
    var signPanelConstruct = bespokeConstructor.getSignPanel()
    //  signPanelConstruct.colour = vars.signPanel.colour
    var signColor = bespokeConstructor.getSignColor()
    var signSymbolsConstruct = bespokeConstructor.getSignSymbols()

    var signSymbolFrameContruct = bespokeConstructor.getSymbolFrame()

    var signTextFrameConstruction = bespokeConstructor.getTextFrame()
    var signTextPanelsCosntruction = bespokeConstructor.getTextPanels()

    if (addFrame) {
      var frameWidth = drawingFrame[0]
      var frameHeight = drawingFrame[1]
    } else {
      var frameWidth = signSizing.width
      var frameHeight = signSizing.height
    }

    var drawVars = {
      signWidth: signSizing.width,
      signHeight: signSizing.height,
      signBorder: signBorderConstruct,
      signPanel: signPanelConstruct,
      signBackground: signColor,
      signSymbols: signSymbolsConstruct,
      signSymbolFrame: signSymbolFrameContruct,
      drawingWidth: frameWidth,
      drawingHeight: frameHeight,
      signTextFrame: signTextFrameConstruction,
      signTextPanels: signTextPanelsCosntruction,
      units: measurementUnits
    }

    if (drawObjectHolder != null) {
      svgDrawObj = new bespokeDrawer(drawObjectHolder, {
        drawingWidth: signSizing.width,
        drawingHeight: signSizing.height,
      })
    }



    svgDrawObj.drawSignForExport(drawVars, addBorder, addFrame)

    if (typeof f == "function") f();
  }

  var testsize = function(changeBy, textPanelID, textPanelLineID) {

    //bespokeConstructor.changeTextSize(changeBy, textPanelID, textPanelLineID)
    //  var newTextPanelInfo = reDrawText();
    var newSize = svgDrawObj.ChangeTextSize(textPanelID, textPanelLineID, changeBy);
    bespokeConstructor.changeTextSize(newSize, textPanelID, textPanelLineID)
  }



  //    };


  var reDrawText = function(textPanelID = -1, textPanelLineID = -1) {
    //  bespokeConstructor.createSign()

    var signTextPanelsConstruction = bespokeConstructor.getTextPanels()

    var drawVars = {
      signTextPanels: signTextPanelsConstruction,
    }

    return svgDrawObj.reDrawText(drawVars, textPanelID, textPanelLineID)
  }



  this.construct(drawObject, options);
}
