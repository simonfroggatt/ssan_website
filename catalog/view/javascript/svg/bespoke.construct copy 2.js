//class used to internally construction the bespoke sign
var bespokeConstruct = function(options) {

  BORDER_RATIO = 0.04;
  MARGIN_RATIO = 0.04;
  PANEL_RATIO = 0.04;
  SYMBOL_TEXT_RATIO = 0.3;
  TEXT_BLOCK_MARGIN = 0.02;
  RADIUS_RATIO = 0.75;
  BORDER_RADIUS = 0.00;

  MIN_SYMBOL_HEIGHT = 0.25;
  MIN_SYMBOL_WIDTH = 0.25;

  MIN_TEXTPANEL_HEIGHT = 0.25;
  MIN_TEXTPANEL_WIDTH = 0.25;

  DEFAULT_FONT_HEIGHT_RATIO = 0.1;

  MIN_FONT_SIZE = 10;

  var autoIgnore = {
    borderSize: false,
    borderRadius: false,
    symbolSizing: false,
    marginSize: false,
    textPanelMargin: true,
    textBlockMargin: false
  };

  var vars = {

  signWidth: 0,
  signHeight: 0,
  signColour: 'white',
  orientation: 0, // 0 - Portrait 1 - Landscape
  hasSymbol: 0,
  symbolPosition: 0, // 0 - before text, 1 - after text  (if orientation is portait then 0 - top, 1 - bottom, Landscape - 0 - left, 1 - right)
  autoSize: false,

  signBorder: {colour: 'black', borderSize: 0, borderRadius: 0},
  signPanel: {colour: 'white', margin: {top: 0, right: 0, bottom: 0, left: 0} },

  symbols: [],
  symbolFrameWidth: 0,
  symbolFrameHeight: 0,
  symbolSpace: 10,

  symbolTextFrameSpacer: 10,   //gap between symbol and frame and text frame

  textContainerMargin:  {left: 0, right: 0, top: 0, bottom: 0},
  textPanelSpacer: 10,  //gap between each textpanel
  textPanels: [],    //  {colour: 'red', panelRadius: 10, panelCorner: [1,1,1,1], height: 100, panelMargin: {top: 5, right: 5, bottom: 5, left: 5} },
  textFontHeight: 0,
  /*

  symbolPosition: 0,  //0 before text, 1 after text

  symbolContainerWidth: 0,
  symbolContainerHeight: 100,
  symbolSpace: 10,  //set to 0 for auto spacing
  symbolContainerMargin: {left: 0, right: 0, top: 0, bottom: 0},
*/
};

  var minSymbolHeight = 0;
  var maxSymbolHeight = 0;
  var minSymbolWidth = 0;
  var maxSymbolHWidth = 0;

  var minTextPanelHeight = 0;
  var maxTextPanelHeight = 0;
  var minTextPanelWidth = 0;
  var maxTextPanelWidth = 0;

  var signFrame = [];  //outer frame
  var signPanel = [];  //the panel that includes symbols and textboxes
  var signSymbols = [];  //the symbols
  var signSymbolFrame = [];  //frame that the symbols sit withing

  var signTextFrame = [];  //frame that all text panels sit within
  var signTextPanels = [];  //the text panels

  //this.signFrame = {}
  /*this.signBox
  this.signPanel
  this.symbolContainer
  this.symbolgroup
  this.textContainter
  this.textGroup
*/

  var root = this;

 /*
 * Constructor
 */
 this.construct = function(options){
    //this.drawSVG = SVG(drawObject).size(vars.drawingWidth, vars.drawingHeight)
    //this.drawFrame = root.drawSVG.rect(drawwidth,drawheight).fill('none').stroke({ width: 1 })
    $.extend(vars , options);
    initDimensions();

 };


/* public  */

 this.addSymbols = function(symbolsArr)
 {
   $.extend(vars.symbols , symbolsArr);
   loadSymbols();
   console.log(vars.symbols);
 };

 this.createSign = function()
 {
   initDimensions();
   createSignFrame();
   createSignPanel();

   createSignSymbols();


   createTextFrame();

 };

 this.getSignDimensions = function()
 {
   return {width: vars.signWidth, height: vars.signHeight};
 };

 this.getSignBorder = function()
 {
   return vars.signBorder;
 };

 this.getSignPanel = function()
 {
   return signPanel;
 };

 this.getSignSymbols = function()
 {
   return signSymbols;
 };

 this.getSymbolFrame = function()
 {
   return signSymbolFrame;
 };

 this.getTextFrame = function()
 {
   return signTextFrame;
 };

 this.getTextPanels = function()
 {
   return signTextPanels;
 };

 this.getTextFromPanelBlockID = function(panelID, blockID) {

   return vars.textPanels[panelID].textLines[blockID].text;
 };


 /* - SETTERS */
 this.setSize = function(newWidth, newHeight, newOrientation)
 {
   var sizeChanged = false;

   if(vars.signWidth != newWidth){
     sizeChanged = true;
     vars.signWidth = newWidth;
   }

   if(vars.signHeight != newHeight){
     sizeChanged = true;
     vars.signHeight = newHeight;
   }

   if(vars.orientation != newOrientation){
     sizeChanged = true;
     vars.orientation = newOrientation;
   }
   if(sizeChanged)
   {
      vars.autoIgnore.symbolSizing = false;
      initDimensions();
    }

  return sizeChanged;
};

 this.changeSize = function(newWidth, newHeight, newOrientation, panelID, textBlocksIn){  //hangeSize(width, height, newOrientation, panelID, textBlocks);

   var widthRatio,
       heightRatio,
       textPanel,
       oldWidth,
       oldHeight,
       sizeChanged,
       orientationChanged;

     oldWidth = vars.signWidth;
     oldHeight = vars.signHeight;

     widthRatio = newWidth / oldWidth;
     heightRatio = newHeight / oldHeight;

     if(vars.signWidth != newWidth){
       sizeChanged = true;
       vars.signWidth = newWidth;

     }

     if(vars.signHeight != newHeight){
       sizeChanged = true;
       vars.signHeight = newHeight;
     }

     if(vars.orientation != newOrientation){
       sizeChanged = true;
       orientationChanged = true;
       vars.orientation = newOrientation;
     }

   if(/*(heightRatio > 1) && */(sizeChanged)) {
     vars.symbolFrameWidth *= heightRatio;
     vars.symbolFrameHeight *= widthRatio;
     initDimensions();
     createSignFrame();
     createSignPanel();
     createSignSymbols();
     changeSignSize(heightRatio, widthRatio ,panelID,textBlocksIn, orientationChanged);
   }

   return vars;

 };

 this.sizeChangeNeeded = function(newWidth, newHeight, newOrientation) {
   var sizeChanged;

    sizeChanged = false;


   if(vars.signWidth != newWidth){
     sizeChanged = true;
   }

   if(vars.signHeight != newHeight){
     sizeChanged = true;
   }

   if(vars.orientation != newOrientation){
     sizeChanged = true;
   }

   return sizeChanged;
 };



 this.setSymbol = function(symbolNumber, symbolPath, symbolInfo)
 {
/*    $.ajax({
      async: false,
      type: 'GET',
      url: symbolPath,
      success: function(data) {
        var svgData = data.querySelector('svg');
        var svgViewBox = svgData.getAttribute('viewBox').split(/\s+|,/);
        var svgCode = svgData.innerHTML;
        console.log(data);
        vars.symbols[symbolNumber].symbolWidth = parseFloat(svgData.getAttribute('width'));
        vars.symbols[symbolNumber].symbolHeight = parseFloat(svgData.getAttribute('height'));
        vars.symbols[symbolNumber].svgCode = svgCode;
        vars.symbols[symbolNumber].viewBox = svgViewBox;
        vars.symbols[symbolNumber].symbolPath = symbolPath;
        vars.symbols[symbolNumber].fullInfo = symbolInfo;

      }
    });
*/
    $.ajax({
      async: false,
      type: 'GET',
      url: symbolPath,
      dataType: 'html',
      success: function(data) {
        var svgData = data;
        var xmlDoc = $.parseXML( svgData );

        $xml = $( xmlDoc );
        var $tmpsvg = $xml.find( "svg" );
        var svgData = $tmpsvg[0];

        var svgViewBox = svgData.getAttribute('viewBox').split(/\s+|,/);
        var blisIE = isIE();
        var svgCode = '';

        if(blisIE) {

            var childSVGNodes = xmlDoc.firstChild;
            var svggrpcodeArr = [];
            var svggrpcode = '';
            var childSVGNode = childSVGNodes.firstChild;
            while (childSVGNode) {
                if (childSVGNode.id === 'symbolgrp') {
                    serializeXML(childSVGNode, svggrpcodeArr);
                    svggrpcode =  svggrpcodeArr.join('');
                }
                childSVGNode = childSVGNode.nextSibling;
            }

            svgCode =  svggrpcode;
        }
        else{
          svgCode = svgData.innerHTML;
        }

        //var svgCode = data;
        vars.symbols[symbolNumber].symbolWidth = parseFloat(svgData.getAttribute('width'));
        vars.symbols[symbolNumber].symbolHeight = parseFloat(svgData.getAttribute('height'));
        vars.symbols[symbolNumber].svgCode = svgCode;
        vars.symbols[symbolNumber].viewBox = svgViewBox;
        vars.symbols[symbolNumber].symbolPath = symbolPath;
        vars.symbols[symbolNumber].fullInfo = symbolInfo;

      }
    });

 };



this.setSymbolScale = function(newSize)
{
  //then overide the autosizing for symbol sizes
  var scaleChanged = false;
  vars.autoIgnore.symbolSizing = true;


  if(vars.orientation == 0)
  {
    if(vars.symbolFrameHeight != newSize)
    {
        vars.symbolFrameHeight = newSize;
        scaleChanged = true;
    }

  }
  else {
    if(vars.symbolFrameWidth != newSize)
    {
        vars.symbolFrameWidth = newSize;
        scaleChanged = true;
    }
  }

  return scaleChanged;
};

this.getSymbolFrameDefs = function()
{
  var rtnVal = {};
  if(vars.orientation  == 0){
    rtnVal.currentValue = vars.symbolFrameHeight;
    rtnVal.minValue = minSymbolHeight;
    rtnVal.maxValue = maxSymbolHeight;
  }
  else {
    rtnVal.currentValue = vars.symbolFrameWidth;
    rtnVal.minValue = minSymbolWidth;
    rtnVal.maxValue = maxSymbolWidth;
  }

  return rtnVal;
};


this.attrib = function(options)
{
  $.extend(vars , options);
};


this.setText = function(newText, textPanelID, textPanelLineID)
{
  var textIndex = getTextBlockByID(textPanelID, textPanelLineID);
  vars.textPanels[textPanelID].textLines[textIndex].text = newText;
//  alert(vars.textPanels[textPanel].textLines[textLine].text)
};


this.setTextAlignment = function(newAligment, textPanelID, textPanelLineID)
{
  var textIndex = getTextBlockByID(textPanelID, textPanelLineID);
  vars.textPanels[textPanelID].textLines[textIndex].anchor = newAligment;
};


this.changeTextSize = function(newSize, textPanelID, textPanelLineID)
{
  var textIndex = getTextBlockByID(textPanelID, textPanelLineID);
  vars.textPanels[textPanelID].textLines[textIndex].size = newSize;

};

this.changeTextLine = function(changeBy, textPanelID, textPanelLineID)
{
  var textIndex = getTextBlockByID(textPanelID, textPanelLineID);
  var newSize = vars.textPanels[textPanelID].textLines[textIndex].leading + changeBy;
  vars.textPanels[textPanelID].textLines[textIndex].leading = Math.max(newSize, 1);
};

this.changeTextPosition = function(changeBy, textPanelID, textPanelLineID)
{
  var textIndex = getTextBlockByID(textPanelID, textPanelLineID);
  if(changeBy > 0){
    vars.textPanels[textPanelID].textLines[textIndex].yOffset -= 5;
  }
  else {
    vars.textPanels[textPanelID].textLines[textIndex].yOffset += 5;
  }
  //vars.textPanels[textPanelID].textLines[textIndex].size += changeBy
};

this.setTextOrigin = function(newOrigin, newOffset, textPanelID, textPanelLineID)
{
  var textIndex = getTextBlockByID(textPanelID, textPanelLineID);
  vars.textPanels[textPanelID].textLines[textIndex].x = newOrigin[0];
  vars.textPanels[textPanelID].textLines[textIndex].y = newOrigin[1];
  vars.textPanels[textPanelID].textLines[textIndex].xOffset = 0;//newOffset[0]
  vars.textPanels[textPanelID].textLines[textIndex].yOffset = 0;//newOffset[1]

  //vars.textPanels[textPanelID].textLines[textIndex].size += changeBy
};

this.setTextOffset = function(newOffset, textPanelID, textPanelLineID)
{
  var textIndex = getTextBlockByID(textPanelID, textPanelLineID);
  vars.textPanels[textPanelID].textLines[textIndex].xOffset = newOffset[0];
  vars.textPanels[textPanelID].textLines[textIndex].yOffset = newOffset[1];
  //vars.textPanels[textPanelID].textLines[textIndex].size += changeBy
};

this.setTopOffset = function(offsetValue, textPanelID, textPanelLineID)
{
  var textIndex = getTextBlockByID(textPanelID, textPanelLineID);
  vars.textPanels[textPanelID].textLines[textIndex].yOffset = offsetValue;
};


this.setTextSize = function(newSize, textPanelID, textPanelLineID)
{
  var textIndex = getTextBlockByID(textPanelID, textPanelLineID);
  vars.textPanels[textPanelID].textLines[textIndex].size = newSize;
};

this.setTextBlockInfo = function(textPanelID, textPanelLineID, textBlockInfo)
{
  var textIndex = getTextBlockByID(textPanelID, textPanelLineID);
  /*vars.textPanels[textPanelID].textLines[textIndex].size = textBlockInfo['size'];
  vars.textPanels[textPanelID].textLines[textIndex].linesHeight = textBlockInfo['blockHeight'];
  vars.textPanels[textPanelID].textLines[textIndex].linesHeight = textBlockInfo['blockWidth'];
  vars.textPanels[textPanelID].textLines[textIndex].x = textBlockInfo['x'];
  vars.textPanels[textPanelID].textLines[textIndex].y = textBlockInfo['y'];
  vars.textPanels[textPanelID].textLines[textIndex].xOffset = textBlockInfo['xOffset'];
  vars.textPanels[textPanelID].textLines[textIndex].yOffset = textBlockInfo['yOffset'];
  vars.textPanels[textPanelID].textLines[textIndex].yOffset = textBlockInfo['yOffset'];*/
//  $.extend(vars.textPanels[textPanelID].textLines[textIndex] , textBlockInfo);
};

this.newTextBlock = function(textPanelID, textBlockID)
{
  //need to make check for where is text block is going to be added
//  DEFAULT_FONT_HEIGHT_RATIO * textFrameHeight
  var defaultFontSize = Math.max(Math.round(signTextPanels[textPanelID].height * DEFAULT_FONT_HEIGHT_RATIO), MIN_FONT_SIZE);

  var lastblock = signTextPanels[textPanelID].textLines.length;
  var xPos = 0;
  var yPos = 0;
  if(lastblock > 0) {
      xPos = signTextPanels[textPanelID].textLines[lastblock-1].x;
      yPos = (signTextPanels[textPanelID].textLines[lastblock-1].y) + (signTextPanels[textPanelID].textLines[lastblock-1].linesHeight);
  }


  var newTextLine = {text: '', colour: vars.textPanels[textPanelID].baseTextColour,
  weight: 'bold',
  size: defaultFontSize,
  anchor: 'middle',
  id: textBlockID,
  x: xPos,
  y:yPos, xOffset:0,
  yOffset:0,
  leading: 1.5  };

  vars.textPanels[textPanelID].textLines.push(newTextLine);
};

this.deleteTextBlock = function(textPanelID, textPanelLineID)
{
  var textIndex = getTextBlockByID(textPanelID, textPanelLineID);
  var newLines = vars.textPanels[textPanelID].textLines.splice(textIndex,1);
};

this.setSignColor = function(backgroundColor)
{
    vars.signColour = backgroundColor;
};

this.setSignBorder = function(hasBorder, color) {
    vars.signBorder.colour = color;
    if(hasBorder === false){
      vars.autoIgnore.borderSize=true;
      vars.signBorder.borderSize = 0;
    }
    else {
      vars.autoIgnore.borderSize=false;
    }
};

this.setSignTextColor = function(textColor, textPanelID) {
  vars.textPanels.forEach(function(item, index) {
    item.baseTextColour = textColor;
    vars.textPanels[textPanelID].textLines.forEach(function(item, index) {
        item.colour = textColor;
  });
});
/*  var textBlock = vars.textPanels[textPanelID];
  textBlock.baseTextColour = textColor;
  vars.textPanels[textPanelID].textLines.forEach(function(item, index) {
//    item.colour = textColor;
});*/
};

this.getSignColor = function()
{
  return vars.signColour;
};


 this.exportToJSON = function()
 {
   var jSONOut = JSON.stringify(vars);
   return jSONOut;
 };

 this.loadFromJSON = function(strJSON)
 {

   vars = strJSON;
   console.log(vars);
 };

 this.getVars = function()
 {
   return $.makeArray(vars);
 };

 this.getImagesUsed = function() {
     var symbolsAll = vars.symbols;
     var symbolIDArr = [];
     symbolsAll.forEach(function(symbolData){
        symbolIDArr.push(symbolData.fullInfo.id);
     });
     return symbolIDArr.toString();
 };

 /*  private **/

 //var initDimensions = function ()
 var initDimensions = function ()
 {
   if(vars.autoSize)
   {

     var minborder = Math.ceil(Math.max(vars.signWidth, vars.signWidth) * BORDER_RATIO);
     var marginCalc = Math.ceil(Math.max(vars.signWidth, vars.signWidth) * MARGIN_RATIO);
     BORDER_RADIUS = minborder*RADIUS_RATIO;

     if(vars.autoIgnore.borderSize == false) {
       vars.signBorder.borderSize = minborder;
     }

     if(vars.autoIgnore.marginSize == false) {
       vars.signPanel.margin.top = vars.signPanel.margin.right = vars.signPanel.margin.bottom = vars.signPanel.margin.left = marginCalc;

     }
     if(vars.autoIgnore.textPanelMargin == false){
       vars.textContainerMargin.left = vars.textContainerMargin.right = vars.textContainerMargin.top = vars.textContainerMargin.bottom = PANEL_RATIO * Math.ceil(Math.max(vars.signWidth, vars.signWidth));
     }



    if(!vars.autoIgnore.borderRadius){
        vars.signBorder.borderRadius = BORDER_RADIUS;
      }

    if(vars.autoIgnore.symbolSizing == false){
      vars.symbolFrameHeight = vars.signHeight * SYMBOL_TEXT_RATIO;
      vars.symbolFrameWidth = vars.signWidth * SYMBOL_TEXT_RATIO;
    }

    if(vars.autoIgnore.textBlockMargin == false) {
      vars.textPanels.forEach(function(item,index){
        item.margin.top = item.margin.bottom = item.margin.left = item.margin.right = TEXT_BLOCK_MARGIN * Math.ceil(Math.max(vars.signWidth, vars.signWidth));
      });
    }

      vars.symbolSpace = minborder;

      /*var MIN_SYMBOL_HEIGHT = 0.25
      var MIN_SYMBOL_WIDTH = 0.25
      var minSymbolHeight = 0
      var maxSymbolHeight = 0
      var minSymbolWidth = 0
      var maxSymbolHWidth = 0
*/

      vars.symbolTextFrameSpacer = vars.signPanel.margin.top;//minborder

      vars.textPanelSpacer = vars.signPanel.margin.top;//minborder

  /*   vars.textPanelSpacer = minborder
     vars.textContainerMargin.left = marginCalc
     vars.textContainerMargin.right = marginCalc
     vars.textContainerMargin.top = 0//marginCalc  - need to change this to look at the symbol position
     vars.textContainerMargin.bottom = marginCalc

     vars.symbolSpace = minborder
     vars.symbolContainerMargin.left = marginCalc
     vars.symbolContainerMargin.right = marginCalc
     vars.symbolContainerMargin.top = marginCalc
     vars.symbolContainerMargin.bottom = marginCalc

*/


   }
   else{
     vars.symbolTextFrameSpacer = vars.signPanel.margin.top;
   }
   minSymbolHeight = vars.signHeight * MIN_SYMBOL_HEIGHT;
   minSymbolWidth = vars.signWidth * MIN_SYMBOL_WIDTH;

   minTextPanelHeight = vars.signHeight * MIN_TEXTPANEL_HEIGHT;
  // maxTextPanelHeight = 0
   minTextPanelWidth = vars.signWidth * MIN_TEXTPANEL_WIDTH;


  // maxTextPanelHeight = 0
};

 var createSignFrame = function(){
   var frameWidth = 0;
   var frameHeight = 0;
   var frameX = 0;
   var frameY = 0;

   //signBorder: {colour: 'black', borderSize: 0, borderRadius: 0},
  // signframe: {colour: 'white', margin: {top: 0, right: 0, bottom: 0, left: 0} },

  frameWidth = vars.signWidth  - vars.signBorder.borderSize*2;// - ( vars.signframe.margin.left + vars.signframe.margin.right )
  frameHeight = vars.signHeight  - vars.signBorder.borderSize*2;// - ( vars.signframe.margin.top + vars.signframe.margin.bottom )

  frameX = vars.signBorder.borderSize;// + vars.signframe.margin.left
  frameY = vars.signBorder.borderSize;// + vars.signframe.margin.top

   signFrame.origin = [frameX, frameY];
   signFrame.width = frameWidth;
   signFrame.height = frameHeight;


 };

 var createSignSymbols = function(){
   if(vars.symbols.length > 0){
      createSymbolFrame();
    }
    else {   //set the symbol frame and spacing to zero
      signSymbolFrame.width = 0;
      signSymbolFrame.height = 0;
      vars.symbolTextFrameSpacer = 0;
    }
 };

 var createSignPanel = function(){
   var panelWidth = signFrame.width;
   var panelHeight = signFrame.height;
   var panelX = signFrame.origin[0];
   var panelY = signFrame.origin[1];

   panelWidth -= ( vars.signPanel.margin.left + vars.signPanel.margin.right );
   panelHeight -= ( vars.signPanel.margin.top + vars.signPanel.margin.bottom );

    panelX +=  vars.signPanel.margin.left;
    panelY += vars.signPanel.margin.top;

    signPanel.origin = [panelX, panelY];
    signPanel.width = panelWidth;
    signPanel.height = panelHeight;
 };

 var createSymbolFrame = function(){

   var symbolFrameWidth = Math.max(vars.symbolFrameWidth, minSymbolWidth);
   var symbolFrameHeight = Math.max(vars.symbolFrameHeight, minSymbolHeight);  //Math.min(100, Math.max(0, $number));
   var symbolPanelX = signPanel.origin[0];
   var symbolPanelY = signPanel.origin[0];
   var spacingExtra = (vars.symbols.length - 1)*vars.symbolSpace;

   var symbolScale = 1;
   var symbolWidthScale = 1;
   var symbolHeightScale = 1;

   var symbolSpacing = 0;

//  minSymbolHeight = vars.signHeight * MIN_SYMBOL_HEIGHT
//  minSymbolWidth = vars.signHeight * MIN_SYMBOL_WIDTH

   if(vars.orientation == 0){
     symbolFrameWidth = signPanel.width;// - 2 * vars.symbolSpace
     var symbolContainerMaxHeightWidthBox = calcMaxSymbolHeight(symbolFrameHeight);   //this is the width of all the symbols if scalled to the selected symbol height


     if(symbolContainerMaxHeightWidthBox + spacingExtra > signPanel.width) {    //if the box is too big with min spacing then scale it
      symbolWidthScale = ((signPanel.width - spacingExtra) / symbolContainerMaxHeightWidthBox);  //new scaling factor for ALL symbol with spacing added
      symbolSpacing = (signPanel.width - symbolContainerMaxHeightWidthBox*symbolWidthScale)/(vars.symbols.length+1);
     }
     else {  //the maxwidth for the symbols is less than the required width...lets space them equally
       //check that size is not smaller than the allowed symbol height

       symbolSpacing = (symbolFrameWidth - symbolContainerMaxHeightWidthBox)/(vars.symbols.length+1);
     }

     //caluclaute the max height that the symbols can be for a the signframe width  -
     //symbolContainerMaxHeightWidthBox + spacingExtra is the width of all the symbols with min spacing
      var symbolMaxHeightFromWidth = Math.round((signPanel.width / (symbolContainerMaxHeightWidthBox + spacingExtra)) * symbolFrameHeight);
      var textPanelMinHeight = signPanel.height - (minTextPanelHeight + vars.symbolTextFrameSpacer);

      maxSymbolHeight = Math.min(textPanelMinHeight, symbolMaxHeightFromWidth);
      //minTextPanelHeight + vars.symbolTextFrameSpacer
      //we need to take into account when the sign is landcape, but the symbol is Portrait
      //need a minimum text panel size to be used


     symbolScale = symbolHeightScale*symbolWidthScale;

     setSymbolDetails(vars.orientation, symbolFrameHeight, symbolScale, symbolSpacing, [symbolPanelX, symbolPanelY]);
   }
   else {
     symbolFrameHeight = signPanel.height;
     var symbolContainerMaxWidthHeightBox = calcMaxSymbolWidth(symbolFrameWidth);

     if(symbolContainerMaxWidthHeightBox + spacingExtra > signPanel.height) {    //if the box is too big with min spacing then scale it
      symbolHeightScale = ((signPanel.height - spacingExtra) / symbolContainerMaxWidthHeightBox);  //new scaling factor for ALL symbol with spacing added
      symbolSpacing = (signPanel.height - symbolContainerMaxWidthHeightBox*symbolHeightScale)/(vars.symbols.length+1);
     }
     else {  //the maxwidth for the symbols is less than the required width...lets space them equally
       symbolSpacing = (symbolFrameHeight - symbolContainerMaxWidthHeightBox)/(vars.symbols.length+1);
     }

     //TODO - add in the min max range for symbols when landscape
     var symbolMaxWidthFromHeight = Math.round((signPanel.height / (symbolContainerMaxWidthHeightBox + spacingExtra)) * symbolFrameWidth);
     var textPanelMinWidth = signPanel.width - (minTextPanelWidth + vars.symbolTextFrameSpacer);
     maxSymbolWidth = Math.min(textPanelMinWidth, symbolMaxWidthFromHeight);

     symbolScale = symbolHeightScale*symbolWidthScale;

     setSymbolDetails(vars.orientation,symbolFrameWidth, symbolScale, symbolSpacing, [symbolPanelX, symbolPanelY]);
   }

   //console.log(signSymbols)

//testing - remove before relative
};

 var calcMaxSymbolHeight = function(symbolHeightIn) {
   var overAllWidth = 0;
   var scaleHeight = 1;
   //console.log('symbolHeightIn '+symbolHeightIn)
   vars.symbols.forEach(function(item){
      scaleHeight = symbolHeightIn / item.symbolHeight;
      overAllWidth += (item.symbolWidth * scaleHeight);

   });

   return overAllWidth;
 };

 var calcMaxSymbolWidth = function(symbolWidthIn) {
   var overAllWidth = 0;
   var scaleHeight = 1;
   vars.symbols.forEach(function(item){
      scaleHeight = symbolWidthIn / item.symbolWidth;
      overAllWidth += (item.symbolHeight * scaleHeight);
   });

   return overAllWidth;
 };


 var recreateSignSymbolSize = function()
 {
   createSignSymbols();
   createTextFrame();
 };

 var setSymbolDetails = function(orientation, symbolMaxSize, symbolScaling, symbolSpacing, symbolBaseOrigin) {
   var symbolTemp = [];
   var xPos = symbolBaseOrigin[0];
   var yPos = symbolBaseOrigin[1];
   var symbolScale = 1;
   var frameWidth = 0;
   var frameHeight = 0;
   var frameX = 0;
   var frameY = 0;

   signSymbols = [];

   vars.symbols.forEach(function(item,index){
     symbolTemp = [];
     symbolTemp.symbolPath = item.symbolPath;
     symbolTemp.svgCode = item.svgCode;
     symbolTemp.viewBox = item.viewBox;

     if(orientation == 0) {
       symbolScale = (symbolMaxSize/ item.symbolHeight) * symbolScaling;

       xPos += symbolSpacing;
       symbolTemp.height = item.symbolHeight * symbolScale;
       symbolTemp.width = item.symbolWidth * symbolScale;
       symbolTemp.origin = [xPos,yPos];

       xPos += symbolTemp.width;

       frameHeight = Math.max(frameHeight,symbolTemp.height );
       frameWidth += symbolTemp.width;


       signSymbols[index] = symbolTemp;

       signSymbolFrame.width = frameWidth + (vars.symbols.length - 1) * symbolSpacing;
       signSymbolFrame.height = frameHeight;
       signSymbolFrame.origin = [signSymbols[0].origin[0], symbolBaseOrigin[1]];

     }
     else {
       symbolScale = (symbolMaxSize/ item.symbolWidth) * symbolScaling;
       yPos += symbolSpacing;
       symbolTemp.height = item.symbolHeight * symbolScale;
       symbolTemp.width = item.symbolWidth * symbolScale;
       symbolTemp.origin = [xPos,yPos];

       yPos += symbolTemp.height;

       frameWidth = Math.max(frameWidth,symbolTemp.width );
       frameHeight += symbolTemp.height;

       signSymbols[index] = symbolTemp;

       signSymbolFrame.width = frameWidth;
       signSymbolFrame.height = frameHeight + (vars.symbols.length - 1) * symbolSpacing;
       signSymbolFrame.origin = [symbolBaseOrigin[0], signSymbols[0].origin[1]];

     }



   });

 };

  var createTextFrame = function(){

    var textContainterWidth = signPanel.width;
    var textContainterHeight = signPanel.height;
    var textContainterX = signPanel.origin[0];
    var textContainterY = signPanel.origin[1];

    var textSpacing = vars.textPanelSpacer;

  /*  var textContainterWidth  = 0
    var textContainterHeight  = 0
    var textPanelWidth = 0
    var textPanelHeight = 0
*/
    if(vars.orientation == 0){
      textContainterWidth  -= (vars.textContainerMargin.left + vars.textContainerMargin.right);
      textContainterHeight  -= (signSymbolFrame.height + vars.textContainerMargin.top + vars.textContainerMargin.bottom + vars.symbolTextFrameSpacer);
      textContainterY += signSymbolFrame.height + vars.textContainerMargin.top + vars.symbolTextFrameSpacer;
    }
    else {
      textContainterWidth  -= (vars.textContainerMargin.left + vars.textContainerMargin.right + vars.symbolTextFrameSpacer + signSymbolFrame.width);
      textContainterHeight  -= (vars.textContainerMargin.top + vars.textContainerMargin.bottom );
      textContainterX += signSymbolFrame.width + vars.textContainerMargin.top + vars.symbolTextFrameSpacer;
    }

    signTextFrame.width = textContainterWidth;
    signTextFrame.height = textContainterHeight;
    signTextFrame.origin = [textContainterX, textContainterY];

    var panelScaling = calcTextPanelHeightScale( textContainterHeight, vars.textPanelSpacer, vars.textPanels);

    setTextPanelDetails([textContainterX, textContainterY], textContainterWidth, textContainterHeight, panelScaling, 1, textSpacing);
  };

  var setTextPanelDetails = function(textFrameOrigin, textFrameWidth, textFrameHeight, panelScaleHeight, panelScaleWidth , panelSpacing )
  {
    textPanels = [];
    var textTemp = [];
    var xPos = textFrameOrigin[0];
    var yPos = textFrameOrigin[1];

    var panelWidth = 0;
    var panelHeight = 0;

    vars.textPanels.forEach(function(item,index){
      textTemp = [];

      //  {colour: 'red', panelRadius: 10, panelCorner: [1,1,1,1], height: 100, margin: {top: 5, right: 5, bottom: 5, left: 5} },
      textTemp.width = textFrameWidth * panelScaleWidth;
      textTemp.height = item.height * panelScaleHeight;
      textTemp.colour = item.colour;
      textTemp.baseTextColour = item.baseTextColour;

      textTemp.cornerRadius = item.panelRadius;
      textTemp.corners = item.panelCorner;

      textTemp.origin = [xPos, yPos];

      textTemp.margin = item.margin;

      textTemp.id = index;

      textTemp.textLines = item.textLines;
      textTemp.textLines.forEach(function(textItem, textIndex){
        if(textItem != null){
          if(textItem.size <= 0 )
          {
            textTemp.textLines[textIndex].size =  Math.max(Math.round(textFrameHeight * DEFAULT_FONT_HEIGHT_RATIO), MIN_FONT_SIZE); //DEFAULT_FONT_HEIGHT_RATIO * textFrameHeight;
          }
        }
      });
      signTextPanels[index] = textTemp;

      yPos += panelSpacing + textTemp.height;

    //  setTextLines(item.textLines)

      //textTemp['text'] = 'test'
    });
  };


  var calcTextPanelHeightScale = function(panelSize, spacingSize, panels) {
    var totalPanelHeight = 0;
    var panelSizeAvail = panelSize - (spacingSize *  (panels.length - 1));
    panels.forEach(function(item,index){
      totalPanelHeight += item.height;
    });

    return panelSizeAvail / totalPanelHeight;
  };

  var getTextBlockByID = function(textPanelID, textPanelLineID)
  {
    var arrIndex = -1;
      vars.textPanels[textPanelID].textLines.forEach(function(item, index) {
        if(item.id == textPanelLineID){
          arrIndex = index;
          return true;
        }
      });
      return arrIndex;
  };

  var loadSymbols = function(symbolPath)
  {
    //symbols: [       {symbolPath: '', symbolWidth: 0, symbolHeight: 0},     ]
    var symbolInfo = [];
    symbolInfo.symbolPath = symbolPath;

      $.ajax({
          async: false,
          type: 'GET',
          url: symbolPath,
          success: function(data) {
            var svgData = data.querySelector('svg');
            var svgViewBox = svgData.getAttribute('viewBox').split(/\s+|,/);
            var svgCode = svgData.innerHTML;

            symbolInfo.symbolWidth = parseFloat(svgData.getAttribute('width'));
            symbolInfo.symbolHeight = parseFloat(svgData.getAttribute('height'));
            symbolInfo.svgCode = svgCode;
            symbolInfo.viewBox = svgViewBox;

          }
        });

  };

  var getSymbolCode = function(symbolPath)
  {
    var symbolCodeInfo = [];
     $.ajax({
       async: false,
       type: 'GET',
       url: symbolPath,
       success: function(data) {
         var svgData = data.querySelector('svg');
         var svgViewBox = svgData.getAttribute('viewBox').split(/\s+|,/);
         var svgCode = svgData.innerHTML;

         symbolCodeInfo.symbolWidth = parseFloat(svgData.getAttribute('width'));
         symbolCodeInfo.symbolHeight = parseFloat(svgData.getAttribute('height'));
         symbolCodeInfo.svgCode = svgCode;
         symbolCodeInfo.viewBox = svgViewBox;
         symbolCodeInfo.symbolPath = symbolPath;

         return symbolCodeInfo;
       }
     });
  };

  var changeSignSize = function(heightRatio, widthRatio, panelID, textBlocksIn, orientationChanged) {
    var textPanel,
      ySpacing,
      yOffset,
      currentY,
      textLineCount,
      textLines,
      previousY,
      symbolCount,
      textBoundBox,
      oldTextPanel,
      textPanelY,
      oldTextPanelY,
      panelHeightRatio,
      paneWidthRatio,
      orientChangeY;

    oldTextPanel = signTextPanels[panelID];
    oldTextPanelY = oldTextPanel.origin[1];
    createTextFrame();
    textPanel = signTextPanels[panelID];
    textPanelY = textPanel.origin[1];   //this is the  new Y origin to the text panels

    panelHeightRatio = textPanel.height / oldTextPanel.height;
    paneWidthRatio = textPanel.width / oldTextPanel.width;
    //check if sclae ratio effects y positions
    yOffset = 0;
    yScaled = Math.floor(oldTextPanelY * panelHeightRatio );
    if( (oldTextPanelY * panelHeightRatio ) < textPanelY ) {
      yOffset = textPanelY - Math.floor(oldTextPanelY * panelHeightRatio );
    }

    textLines = textPanel.textLines;
    textLineCount = 0;
    textLineCount = textPanel.textLines.length;

    if (textLineCount > 0) {
      //check that the scaled block boundries

      textLines.forEach(function(textBlock, textblockIndex) {
        //scale evrything nicely
        textBlock.size = panelHeightRatio < 0 ? Math.max(Math.ceil(textBlock.size * panelHeightRatio),MIN_FONT_SIZE) : Math.max(Math.floor(textBlock.size * panelHeightRatio),MIN_FONT_SIZE);  //ISSUE?? min font size
        textBlock.text = textBlocksIn[textblockIndex];
        textBlock.linesHeight = Math.floor(panelHeightRatio*textBlock.linesHeight);
        if(orientationChanged){
          orientChangeY = Math.floor( (textBlock.y - oldTextPanelY) * panelHeightRatio);
          textBlock.y = orientChangeY + textPanelY;
          textBlock.boundBox.width = Math.floor(textBlock.boundBox.width * paneWidthRatio);
          textBlock.boundBox.height = Math.floor(textBlock.boundBox.height * panelHeightRatio);
          textBlock.boundBox.x = Math.floor(textBlock.boundBox.x * paneWidthRatio);
          textBlock.boundBox.y = Math.floor(textBlock.boundBox.y * panelHeightRatio);
        } else {
          textBlock.y = Math.floor(panelHeightRatio * textBlock.y) + yOffset;
        }


        /*currentY = textBlock.y;
        ySpacing = (currentY - previousY) * heightRatio;
        previousY = textBlock.y;
        textBlock.y += ySpacing + yOffset;
        yOffset += (textBlock.y - previousY);
        textBlock.yOffset = 0;*/
        console.log("textblock: "+textblockIndex + " font size: "+ textBlock.size);
      });
    }
  };
  var isIE = function() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf('MSIE '); // IE 10 or older
  var trident = ua.indexOf('Trident/'); //IE 11

  return (msie > 0 || trident > 0);
}

 this.construct(options);



};


var serializeXML = function(node, output) {
    var nodeType = node.nodeType;
    if (nodeType == 3) { // TEXT nodes.
        // Replace special XML characters with their entities.
        output.push(node.textContent.replace(/&/, '&amp;').replace(/</, '&lt;').replace('>', '&gt;'));
    } else if (nodeType == 1) { // ELEMENT nodes.
        // Serialize Element nodes.
        output.push('<', node.tagName);
        if (node.hasAttributes()) {
            var attrMap = node.attributes;
            for (var i = 0, len = attrMap.length; i < len; ++i) {
                var attrNode = attrMap.item(i);
                output.push(' ', attrNode.name, '=\'', attrNode.value, '\'');
            }
        }
        if (node.hasChildNodes()) {
            output.push('>');
            var childNodes = node.childNodes;
            for (var i = 0, len = childNodes.length; i < len; ++i) {
                serializeXML(childNodes.item(i), output);
            }
            output.push('</', node.tagName, '>');
        } else {
            output.push('/>');
        }
    } else if (nodeType == 8) {
        // TODO(codedread): Replace special characters with XML entities?
        output.push('<!--', node.nodeValue, '-->');
    } else {
        // TODO: Handle CDATA nodes.
        // TODO: Handle ENTITY nodes.
        // TODO: Handle DOCUMENT nodes.
        throw 'Error serializing XML. Unhandled node of type: ' + nodeType;
    }
}