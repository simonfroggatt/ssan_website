//give a bespoke construct object this class dras the sign
var bespokeDrawer = function(drawObject, options) {

  DRAW_DEBUG_FRAMES = false;
  DEBUG_TEXT_BOXES = false;
  SCALE_MAX_DRAW = 0.8;
  MEASUREMENT_OFFSET = 10;
  MEASURELINE_END = 20;

  DEFAULT_FONT = 'Arial';
  DEFAULT_FONT_WEIGHT = 'Bold';
  DEFAULT_FONT_HEIGHT_RATIO = 0.1;
  MIN_FONT_SIZE = 10;

  MAX_TEXT_PANEL_RATIO = 0.95;

  var vars = {
    signWidth: 0,
    signHeight: 0,
    drawingWidth: 0,
    drawingHeight: 0,

    signBackground: '#000000',
    signPanel: {},
    signSymbols: {},

    signSymbolFrame: {},
    signTextFrame: {},
    signTextPanels: {},

    drawIgnore: {},

    units: 'px'

  };

  var lockSymbolSize = true;
  var lockTextVertical = true;

  var drawingArea;
  var signFrameDrawSolid;
  var signFrameDraw; //very out edge to indicate the size
  var signBorderDraw; //border of the sign
  var signPanelDraw; //contains the symbols and text
  var symbolPanel;

  var textFrameGroup;
  var symbolFrameGroup;

  var completeSign;

  var sizingGuide;

  var thumbBorder;
  var thumbFrame;

  var textDebugArr = [];
  var textDebug;

  this.drawSVG;

  var root = this;

  /*
   * Constructor
   */
  this.construct = function(drawObject, options) {

    $.extend(vars, options);
    this.drawSVG = SVG(drawObject).size(vars.drawingWidth, vars.drawingHeight);

    drawingArea = root.drawSVG.rect(vars.drawingWidth, vars.drawingHeight).fill('none').stroke({
      width: 1
    }).id('drawingArea');
  };

  this.drawSign = function(options, clear) {

    $.extend(vars, options);

    if (clear) {
      clearSign();
    }

    //drawFrame(origin, width, height, borderSize, borderRadius , radiusCorner, borderColour, fillColour, strokeColour, strokeWidth )
    drawFrame([0, 0], vars.signWidth, vars.signHeight, vars.signBorder.borderSize, vars.signBorder.borderRadius, [1, 1, 1, 1], vars.signBorder.colour, vars.signBackground, '#FFFFFF', 0);

    //drawPanel(vars.signPanel.origin, vars.signPanel.width, vars.signPanel.height, vars.signPanel.colour)

    symbolFrameGroup = root.drawSVG.group().id('symbols');

    drawSymbols(vars.signSymbols);

    textFrameGroup = root.drawSVG.group().id('texts');
    textDebug = root.drawSVG.group().id('text_debug');
    drawTextPanels(clear, true);

    alignSign(true,true,true);

    drawSizing();

  };

  this.reDrawSymbols = function(options) {
    $.extend(vars, options);
    drawSymbols(vars.signSymbols);
  };

  this.scaleSymbol = function(options) {
    $.extend(vars, options);

    //  symbolFrameGroup.clear()

    rescaleSymbols(vars.signSymbols);
    rescaleTextPanels();


    //drawTextPanels();
    //  rescaleTextPanels()
  };

  this.changeTextBlockContent = function(textIn, panelID, blockID) {
    var textPanel = vars.signTextPanels[panelID];
    var textBlockIndex = getTextBlockIndexByID(panelID, blockID);
    var textLines = textPanel.textLines[textBlockIndex];

    var textBlockBound = getTextBlockBoundsByID(panelID, blockID);
    //record the bounds for this text block for later use
    textLines.boundBox = textBlockBound;


    var newTextInfo = calcTextToPanelSize(textIn, textBlockBound.width, textBlockBound.height, textLines.weight, textLines.size, textLines.anchor, textLines.leading); //['plainText'] ['fontsize']
    textLines.size = newTextInfo.fontsize;
    textLines.text = newTextInfo.plainText;
    textLines.linesHeight = newTextInfo.linesHeight;

    verticalAlignTextInBlock(panelID, blockID); //, textBlockBound, newTextInfo['linesHeight']);
    horizontalAlignTextInBlock(panelID, blockID, textLines.anchor);
    reDrawTextBlock(panelID, blockID);

    return textLines;

  };

  this.ChangeTextSize = function(panelID, blockID, changeBy, textLineIn) {
    var textPanel = vars.signTextPanels[panelID];
    var textBlockIndex = getTextBlockIndexByID(panelID, blockID);
    var textLines = textPanel.textLines[textBlockIndex];
    var textBlockBound = getTextBlockBoundsByID(panelID, blockID);
    var textLineToUse = '';
    var textblock = 'text-block-' + panelID + '-' + textBlockIndex;
    var textBlockToChange = SVG.get(textblock);

    textLines.boundBox = textBlockBound;


    if (textLineIn) {
      textLineToUse = textLineIn;
    } else {
      textLineToUse = textLines.text;
    }

    var newTextSize = MIN_FONT_SIZE;
    if (textLines.size + changeBy >= MIN_FONT_SIZE) {
      var newTextInfo = calcTextToPanelSize(textLineToUse, textBlockBound.width, textBlockBound.height, textLines.weight, textLines.size + changeBy, textLines.anchor, textLines.leading); //['plainText'] ['fontsize']

      textLines.size = newTextInfo.fontsize;
      textLines.text = newTextInfo.plainText;
      textLines.linesHeight = newTextInfo.linesHeight;

      verticalAlignTextInBlock(panelID, blockID); //, textBlockBound, newTextInfo['linesHeight']);

      reDrawTextBlock(panelID, blockID);

      newTextSize = newTextInfo.fontsize;
    }

    return textLines;
  };

  this.setTextAlignment = function(panelID, blockID) {
    var textPanel = vars.signTextPanels[panelID];
    var textBlockIndex = getTextBlockIndexByID(panelID, blockID);
    var textLines = textPanel.textLines[textBlockIndex];
    horizontalAlignTextInBlock(panelID, blockID, textLines.anchor);
    reDrawTextBlock(panelID, blockID);
  };

  this.changeTextLineSpace = function(panelID, blockID) {
    //  var textPanel = vars.signTextPanels[panelID];
    //  var textLines = textPanel.textLines[blockID];
    this.ChangeTextSize(panelID, blockID, 0, null);
    //verticalAlignTextInBlock(panelID,blockID)
    reDrawTextBlock(panelID, blockID);
  };

  this.changeSize = function(newWidth, newHeight, oldWidth, oldHeight, orientation, panelID, textBlocksIn){
      /*
      vars,signWidth: 0,
      vars.signHeight: 0,*/
      var widthRatio,
          heightRatio,
          textPanel;

        widthRatio = newWidth / oldWidth;
        heightRatio = newHeight / oldHeight;

        if(heightRatio > 1) {
          //step throught all the fonts and spacings and increaase them
          textPanel = vars.signTextPanels[panelID];
          textPanel.textLines.forEach(function(textBlock, textblockIndex){
              textBlock.size *= heightRatio;
              textBlock.text = textBlocksIn[textblockIndex];
          });
        }
  };

  this.moveTextVertically = function(panelID, blockID, changeBy) {
    var textPanel = vars.signTextPanels[panelID];
    var textBlockIndex = getTextBlockIndexByID(panelID, blockID);
    var textLines = textPanel.textLines[textBlockIndex];

    //  var textBlockBound = getTextBlockBoundsByID(panelID, blockID);

    var textLinebounds = getTextBlockBoundsByID(panelID, blockID); //textLines.boundBox;

    var newY = textLines.y + changeBy;
    if ((textLinebounds.y <= newY) && (newY + textLines.linesHeight <= textLinebounds.y + textLinebounds.height)) {
      textLines.y = newY;
      reDrawTextBlock(panelID, blockID);
    //  textLines.yOffset += changeBy;
      textLines.yOffset = 1;
    }
  };

  this.isRoomForNewTextBlock = function(panelID){
    var textPanel,
        textLine,
        lastBlockIndex,
        textBlockBottomPos,
        blockSpaceLeft,
        newBlockSize,
        lastFontSize,
        blIsRoom;

    blIsRoom = false;
    textPanel = vars.signTextPanels[panelID];
    lastBlockIndex = textPanel.textLines.length - 1;
    textLine = textPanel.textLines[lastBlockIndex];
    textBlockBottomPos = textLine.y + textLine.linesHeight;
    blockSpaceLeft = (textPanel.height + textPanel.origin[1]) - (textBlockBottomPos + textPanel.margin.bottom);
    lastFontSize = textLine.size;

    txtLineObj = root.drawSVG.text('X').font({
      family: DEFAULT_FONT,
      size: lastFontSize,
      weight: 'bold'
    });
    newBlockSize = (txtLineObj.cy() - txtLineObj.y()) * 2;

    blIsRoom = (newBlockSize <= blockSpaceLeft);
    txtLineObj.remove();
    return blIsRoom;

  };

  this.getTextBlockInfo = function(panelID, blockID) {
    var textPanel = vars.signTextPanels[panelID];
    var textBlockIndex = getTextBlockIndexByID(panelID, blockID);
    var textLines = textPanel.textLines[textBlockIndex];

    return textLines;
  };

  this.getSymbolFrameDefs = function() {
    var rtnVal = [],
        textBlockHeight,
        symbolIncreaseLeft,
        panelID;

    panelID = 0;
    var textPanel = vars.signTextPanels[panelID];
    textBlockHeight = getPanelBlockHeight(0);
    symbolIncreaseLeft = textPanel.height - textBlockHeight - (textPanel.margin.top + textPanel.margin.bottom);
    return symbolIncreaseLeft;
  };


  this.getTexts = function() {
      var allTextsPanels = vars.signTextPanels;
      var textLinesArr;
      var textOutArr = [];
      var textOutStr = "";
      allTextsPanels.forEach(function(textPanels){
          textLinesArr = textPanels.textLines;
          textLinesArr.forEach(function(textLineRaw){
            textOutArr.push(textLineRaw.text.toString());
          });
      });
      textOutStr = textOutArr.toString();
      return textOutStr.replace(/(\r\n|\n|\r)/gm," ");
  };

  /* *********************************************** PRIVATE FUNCTIONS ***********************************************  */

  var clearSign = function() {
    root.drawSVG.clear();
    drawingArea = root.drawSVG.rect(vars.drawingWidth, vars.drawingHeight).fill('none').stroke({
      width: 1
    });
  };


  var drawFrame = function(origin, width, height, borderSize, borderRadius, radiusCorner, borderColour, fillColour, strokeColour , strokeWidth) {

    if (borderSize > 0) {
      var borderOrigin = [origin[0] + borderSize, origin[1] + borderSize];
      var borderWidth = width - 2 * borderSize;
      var borderHeight = height - 2 * borderSize;


      signFrameDraw = drawRectangle(origin, width, height, borderColour, '#FFFFFF', 0, 'signFrame');

      signBorderDraw = drawCorneredRectangle(borderOrigin, borderWidth, borderHeight, borderRadius, radiusCorner, fillColour, 'none', 1, 'signBorder');

    } else {

      if (DRAW_DEBUG_FRAMES) {
        signFrameDraw = drawRectangle(origin, width, height, fillColour, 'black', 1, 'signFrame');
      } else {
        signFrameDraw = drawRectangle(origin, width, height, fillColour, 'none', 0, 'signFrame');
      }
      if (signBorderDraw) {
        signBorderDraw = null;
      }

    }

  };


  var drawRectangle = function(origin, width, height, fillColour , strokeColour , strokeWidth , idText) {

    if (idText != '') {
      return root.drawSVG.rect(width, height).fill(fillColour).stroke({
        width: strokeWidth,
        color: strokeColour
      }).move(origin[0], origin[1]).id(idText);
    } else {
      return root.drawSVG.rect(width, height).fill(fillColour).stroke({
        width: strokeWidth,
        color: strokeColour
      }).move(origin[0], origin[1]);
    }
  };

  var drawCorneredRectangle = function(origin, width, height, rsize, radius, fillColour, strokeColour, strokeWidth, idText) {
    //radius is array [topleft, topright, bottomleft, bottomright]

    //radius top, right, bottom, left
    var pathstr = '';
    var originX = origin[0];
    var originY = origin[1];

    pathstr += 'M' + (originX + radius[0] * rsize) + ' ' + (originY);

    pathstr += ' h' + (width - ((radius[0] * rsize) + (radius[1]) * rsize));
    if (radius[1])
      pathstr += ' a' + (radius[1] * rsize) + ',' + (radius[1] * rsize) + ' 0 0 1 ' + (radius[1] * rsize) + ' ' + (radius[1] * rsize);

    pathstr += ' v' + (height - ((radius[1] * rsize) + (radius[2] * rsize)));
    if (radius[2])
      pathstr += ' a' + (radius[2] * rsize) + ',' + (radius[2] * rsize) + ' 0 0 1 ' + '-' + (radius[2] * rsize) + ' ' + (radius[2] * rsize);

    pathstr += ' h-' + (width - ((radius[2] * rsize) + (radius[3] * rsize)));
    if (radius[3])
      pathstr += ' a' + (radius[3] * rsize) + ',' + (radius[3] * rsize) + ' 0 0 1 ' + '-' + (radius[3] * rsize) + ' -' + (radius[3] * rsize);

    pathstr += ' v-' + (height - ((radius[3] * rsize) + (radius[0] * rsize)));
    if (radius[0])
      pathstr += ' a' + (radius[0] * rsize) + ',' + (radius[0] * rsize) + ' 0 0 1 ' + ' ' + (radius[0] * rsize) + ' -' + (radius[0] * rsize);

    pathstr += 'z';

    var tmp;
    if (idText != '') {
      tmp = root.drawSVG.path(pathstr).fill(fillColour).stroke({
        width: strokeWidth,
        color: strokeColour
      }).id(idText);
    } else {
      tmp = root.drawSVG.path(pathstr).fill(fillColour).stroke({
        width: strokeWidth,
        color: strokeColour
      });
    }
    return tmp;
  };

  var drawPanel = function(origin, width, height, panelColour) {
    //if(DRAW_DEBUG_FRAMES)
    signPanelDraw = drawRectangle(origin, width, height, panelColour, '#FFFFFF', 1,'signpanel');
  };

  /* ************************   SYMBOL DRAWING ***************************   */

  var drawSymbols = function(symbolsArr) {
    if (symbolsArr.length > 0) {

      //  if(DRAW_DEBUG_FRAMES)
      //  symbolPanel = root.drawSVG.rect(vars.signSymbolFrame.width, vars.signSymbolFrame.height).fill('none').stroke({ width: 1, color: 'green'}).move(vars.signSymbolFrame.origin[0], vars.signSymbolFrame.origin[1]).id('symbolPanel')
      //     symbolFrameGroup.add(symbolPanel)

      var xpos = 0;
      var ypos = 0;
      symbolsArr.forEach(function(item, index) {
        var symbolSVG = AddSymbolToSVG('symbol-' + index, item);
      });
    }
  };

  var AddSymbolToSVG = function(symbolID, svgInfo) {
    //var nested = root.drawSVG.nested().svg(svgInfo.svgCode);

    //ie change
    var nested = root.drawSVG.nested();
    nested.svg(svgInfo.svgCode);
    nested.id(symbolID);
    nested.attr('width', svgInfo.width)
    nested.attr('height', svgInfo.height)

  /*  nested.width(svgInfo.width);
    nested.height(svgInfo.height);*/

    var svgViewBox = svgInfo.viewBox;
    var origin = svgInfo.origin;

    nested.viewbox(parseFloat(svgViewBox[0]), parseFloat(svgViewBox[1]), parseFloat(svgViewBox[2]), parseFloat(svgViewBox[3]));
    nested.id(symbolID);

    nested.move(origin[0], origin[1]);

    symbolFrameGroup.add(nested);

  };

  var rescaleSymbols = function(symbolsArr) {
    var tmpSymbol;
    var svgHeight;
    var svgWidth;
    symbolsArr.forEach(function(item, index) {

      tmpSymbol = SVG.get('symbol-' + index);
      if (tmpSymbol != null)
        tmpSymbol.size(item.width, item.height).move(item.origin[0], item.origin[1]);
    });

    //  symbolPanel.remove()
    //  symbolPanel = root.drawSVG.rect(vars.signSymbolFrame.width, vars.signSymbolFrame.height).fill('none').stroke({ width: 1, color: 'green'}).move(vars.signSymbolFrame.origin[0], vars.signSymbolFrame.origin[1]).id('symbolPanel')
    //     symbolFrameGroup.add(symbolPanel)

  };

  /** ******************TEXT DRAWING ***************************************** */

  var drawTextPanels = function(clearSign, drawText) {

    vars.signTextPanels.forEach(function(textPanelItem, textPanelIndex) { //each text panel
      if (textPanelItem.cornerRadius > 0) {
        //root.textGroup.add( drawCorneredRectangle([xpos,ypos], textPanelWidth, item.height*panelScaling, item.panelRadius, item.panelCorner,item.colour,1))
        //function(origin, width, height, rsize, radius, fillColour = '#000000', strokeColour = '#FFFFFF', strokeWidth = 0, idText = '')
        var textFrame = drawCorneredRectangle([textPanelItem.origin[0], textPanelItem.origin[1]], textPanelItem.width, textPanelItem.height, textPanelItem.cornerRadius, textPanelItem.corners, textPanelItem.colour, 'none', 0, 'text-panel-' + textPanelIndex).id('text-panel-' + textPanelIndex);
        textFrameGroup.add(textFrame);
      } else {
        //root.textGroup.add(root.drawSVG.rect(textPanelWidth,item.height*panelScaling).fill(item.colour).stroke({ width: 1 }).move(xpos,ypos))
        var textFrame = root.drawSVG.rect(textPanelItem.width, textPanelItem.height).fill(textPanelItem.colour).stroke({
          width: 1
        }).move(textPanelItem.origin[0], textPanelItem.origin[1]);
        textFrameGroup.add(textFrame);
      }

      if (drawText) {
        if (clearSign) {
          reDrawTextPanel(textPanelItem, textPanelIndex);
        } else {
          DrawTextPanelBlocks(textPanelItem);
        }
      }
    });

  };

  var rescaleTextPanels = function(){
      var textPanel,
          textPanelID;
      textFrameGroup.clear();

      textPanelID = 0;
      textPanel = vars.signTextPanels[textPanelID];
    //  var textBlockIndex = getTextBlockIndexByID(0, blockID);
      var textLines = textPanel.textLines;
      drawTextPanels(false, false);
      movePanelTextBlockVertically(0);

      textPanel.textLines.forEach(function(textLineInfo){
        reDrawTextBlock(textPanelID, textLineInfo.id);
      });



/*      textLines.forEach(function(lineItemsInfo, lineItemIndex) {
        root.changeTextBlockContent(lineItemsInfo.text, 0 ,lineItemIndex);
      });
*/

};

  var DrawTextPanelBlocks = function(textPanel) {

    var textLineColor;
    var textLines = textPanel.textLines;

    textLines.forEach(function(textObject, textIndex) {
      if (textObject.colour) {
        textLineColor = textObject.colour;
      } else {
        textLineColor = textPanel.baseTextColour;
      }

      textLineDrawn = root.drawSVG.text(textObject.text).font({
        family: DEFAULT_FONT,
        fill: textLineColor,
        size: textObject.size,
        weight: textObject.weight,
        anchor: textObject.anchor,
      //  leading: textObject.leading
      }).id('text-block-' + textPanel.id + '-' + textIndex);
      textLineDrawn.x(textObject.x);
      textLineDrawn.y(textObject.y);

      textFrameGroup.add(textLineDrawn);
    });


  };

  var DrawTextPanelBlocksStripTSPAN = function(textPanel) {

    var textLineColor;
    var textLines = textPanel.textLines;

    textLines.forEach(function(textObject, textIndex) {
      if (textObject.colour) {
        textLineColor = textObject.colour;
      } else {
        textLineColor = textPanel.baseTextColour;
      }

      textLineDrawn = root.drawSVG.text(textObject.text).font({
        family: DEFAULT_FONT,
        fill: textLineColor,
        size: textObject.size,
        weight: textObject.weight,
        anchor: textObject.anchor,
      //  leading: textObject.leading
      }).id('text-block-' + textPanel.id + '-' + textIndex);
      textLineDrawn.x(textObject.x);
      textLineDrawn.y(textObject.y);

      textFrameGroup.add(textLineDrawn);
    });


  };


  var reDrawTextBlock = function(panelID, blockID) {
    var textPanel = vars.signTextPanels[panelID];
    var textBlockIndex = getTextBlockIndexByID(panelID, blockID);
    var textObject = textPanel.textLines[textBlockIndex];

    var drawTextBlockID = 'text-block-' + textPanel.id + '-' + textBlockIndex;
    if (textObject.colour) {
      textLineColor = textObject.colour;
    } else {
      textLineColor = textPanel.baseTextColour;
    }

    var oldSVGElements = SVG.get(drawTextBlockID);
    if (oldSVGElements) {
      oldSVGElements.remove();
    }

    textLineDrawn = root.drawSVG.text(textObject.text).font({
      family: DEFAULT_FONT,
      fill: textLineColor,
      size: textObject.size,
      weight: textObject.weight,
      anchor: textObject.anchor,
    //  leading: textObject.leading
    }).id(drawTextBlockID);
    textLineDrawn.x(textObject.x);
    textLineDrawn.y(textObject.y);

    textFrameGroup.add(textLineDrawn);

    /*  var tmph = (textLineDrawn.cy() - textLineDrawn.y()) * 2;
      var tmpw = textLineDrawn.length();
      textDebug.add(root.drawSVG.rect(tmpw, tmph).fill('none').stroke({width:1 }).move(textObject.x, textObject.y));
      console.log('textblock: y'+textObject.y);*/
  };

  var verticalAlignTextInBlock = function(panelID, blockID) {
    var textPanel = vars.signTextPanels[panelID];
    var textBlockIndex = getTextBlockIndexByID(panelID, blockID);
    var textLines = textPanel.textLines[textBlockIndex];
    var textBlockBound = [];
    var textLineHeight = textLines.linesHeight;
    var yOffset = 0;
    var newYOffse;

    if (textLines.boundBox) {
      textBlockBound = textLines.boundBox;
    } else {
      textBlockBound = getTextBlockBoundsByID(panelID, blockID);
      textLines.boundBox = textBlockBound;
    }

    if ((textLines.yOffset != 0) || (textPanel.textLines.length > 1)) {
      newYOffset = textLines.y;
      while (((newYOffset + textLineHeight) > (textBlockBound.height + textBlockBound.y)) && (newYOffset >= textBlockBound.y)) {
        newYOffset -= 1;
      }
      yOffset = newYOffset;
    } else {
      yOffset = ((textBlockBound.height - textLineHeight) / 2) + textBlockBound.y;
    }
    textLines.y = yOffset;

  };

  var horizontalAlignTextInBlock = function(panelID, blockID, anchor) {
    var textPanel = vars.signTextPanels[panelID];
    var textBlockIndex = getTextBlockIndexByID(panelID, blockID);
    var textLines = textPanel.textLines[textBlockIndex];
    var panelWidth = textPanel.width - (textPanel.margin.left + textPanel.margin.right);
    var panelX = textPanel.origin[0] + textPanel.margin.left;
    switch (anchor) {
      case 'start':
        textLines.x = panelX;
        break;
      case 'middle':
        textLines.x = (panelX + panelWidth / 2);
        break;
      case 'end':
        textLines.x = (panelX + panelWidth);
        break;
    }
  };

  var verticalAlignTextblockInPanel = function(panelID){
    var textPanel;
    textPanel = vars.signTextPanels[panelID];
  };

  var movePanelTextBlockVertically = function(panelID) {
    var textPanel,
        firstTextBlock,
        panelY,
        yOffset;

    textPanel = vars.signTextPanels[panelID];
    panelY = textPanel.origin[1];
    firstTextBlock = textPanel.textLines[0];
    yOffset = 0;
    if(firstTextBlock.y < panelY + textPanel.margin.top){
      yOffset = (panelY + textPanel.margin.top) - firstTextBlock.y;
      textPanel.textLines.forEach(function(textLineInfo){
        textLineInfo.y += yOffset;
      });
    }

  };



  /***************************** UTILITY FUNCTIONS ******************************************************/


  var getTextBlockIndexByID = function(panelID, blockID) {
    var arrIndex = -1;
    var textPanel = vars.signTextPanels[panelID];
    textPanel.textLines.forEach(function(item, index) {
      if (item.id == blockID) {
        arrIndex = index;
        return true;
      }
    });
    return arrIndex;
  };

  var getTextBlockHeight = function(panelID, blockID) {
    var textPanel = vars.signTextPanels[panelID];
    var textLines = textPanel.textLines[blockID];
    var totalLineHeight = 0;

    totalLineHeight += (textLines.cy() - textLines.y()) * 2;

    return totalLineHeight;
  };

  var calcTextForSize = function(textIn, width, height, weight, size, anchor, leading) {

    var inText = textIn.replace(/(?:\r\n|\r|\n)/g, '\n');
    tspanText = inText.split("\n");

    var maxPanel = 0;
    var txtLineObj;
    var txtLine = "";
    var lines = [];
    var spacer = ' ';
    var maxwidth = 0;
    var lastWidth = 0;
    var lastLetterCount = 0;


    for (var i = 0; i < tspanText.length; i++) {
      var spaceArr = tspanText[i].split(/ +/);
      txtLine = '';

      for (var j = 0; j < spaceArr.length; j++) {
        if (spaceArr[j].length > lastLetterCount - 2) {
          //potentially a long word so might have to scale
          txtWordObj = root.drawSVG.text(spaceArr[j]).font({
            family: DEFAULT_FONT,
            size: size,
            weight: weight,
            anchor: anchor,
          //  leading: leading
        });
          maxwidth = Math.max(txtWordObj.length(), maxwidth);
          txtWordObj.remove();
        }

        txtLineObj = root.drawSVG.text(txtLine + spacer + spaceArr[j]).font({
          family: DEFAULT_FONT,
          size: size,
          weight: weight,
          anchor: anchor,
      //    leading: leading
    });
        if (txtLineObj.length() > width) {
          //IE change
          lines.push($.trim(txtLine) + '\n');

        //  lines.push(txtLine.trim() + '\n');
          txtLine = spaceArr[j] + spacer;
          lastWidth = 0;
        } else {
          lastValidWidth = txtLineObj.length();
          txtLine += spaceArr[j] + spacer;
          lastLetterCount = txtLine.length;
        }
        maxwidth = Math.max(lastWidth, maxwidth);
        txtLineObj.remove();
      }
      //IE change
      lines.push($.trim(txtLine));
      //lines.push(txtLine.trim());
      lines.push('\n');
    }

    var tempPanelTextLines = lines.join('');
    //IE change
    var panelTextLines = $.trim(tempPanelTextLines);
  //  var panelTextLines = tempPanelTextLines.trimRight();

    txtLineObj.remove();
    txtLineObj = root.drawSVG.text(panelTextLines).font({
      family: DEFAULT_FONT,
      size: size,
      weight: weight,
      anchor: anchor,
  //    leading: leading
});

    var rtnData = [];
    rtnData['plaintext'] = panelTextLines;
    rtnData['maxwidth'] = maxwidth;
    rtnData['lineheight'] = (txtLineObj.cy() - txtLineObj.y()) * 2;
    rtnData['fontsize'] = size;
    txtLineObj.remove();


    return rtnData;
  };

  var calcTextToPanelSize = function(textIn, panelwidth, panelHeight, weight, size, anchor, leading) {

    var textLineObjsArr = calcTextForSize(textIn, panelwidth, panelHeight, weight, size, anchor, leading);
    var textLinesHeight = textLineObjsArr['lineheight'];
    var textLinesWidth = textLineObjsArr['maxwidth'];
    var origSize = size;
    while ((textLinesHeight > panelHeight) || (textLinesWidth > panelwidth)) {
      origSize -= 1;
      textLineObjsArr = calcTextForSize(textIn, panelwidth, panelHeight, weight, origSize, anchor, leading);
      textLinesHeight = textLineObjsArr['lineheight'];
      textLinesWidth = textLineObjsArr['maxwidth'];
    }

    //align the text in the midde of the block
    var textCreatedArr = [];
    textCreatedArr['plainText'] = textLineObjsArr['plaintext'];
    textCreatedArr['fontsize'] = textLineObjsArr['fontsize'];
    textCreatedArr['linesHeight'] = textLineObjsArr['lineheight'];

    return textCreatedArr;
  };

  var getTextBlockBoundsByID = function(panelID, blockID) {
    var textPanel = vars.signTextPanels[panelID];
    var textBlockIndex = getTextBlockIndexByID(panelID, blockID);
    var textLines = textPanel.textLines[textBlockIndex];

    var panelWidth = textPanel.width - (textPanel.margin['left'] + textPanel.margin['right']);
    var panelHeight = textPanel.height - (textPanel.margin['top'] + textPanel.margin['bottom']);
    var panelX = textPanel.origin[0] + textPanel.margin['left'];
    var panelY = textPanel.origin[1] + textPanel.margin['top'];
    var textBlockCount = textPanel.textLines.length;

    var panelBoundWidth = panelWidth;
    var panelBoundHeight = panelHeight;



    if (textPanel.textLines.length > 1) {

      if (textBlockIndex == 0) { //get the bounds from top of the panel to the next block below
        var nextBlock = textPanel.textLines[textBlockIndex + 1];
        panelBoundHeight = Math.min((nextBlock.y - panelY), panelBoundHeight);
      } else {
        if (textBlockIndex == textPanel.textLines.length - 1) { //get the bounds from previous block to bottom of panel
          var previousBlock = textPanel.textLines[textBlockIndex - 1];
          panelY = previousBlock.y + previousBlock.linesHeight;
          panelBoundHeight = (panelHeight - panelY) + (textPanel.origin[1] + textPanel.margin['top']);
        } else { //get the bounds from previous block to the next block
          var nextBlock = textPanel.textLines[textBlockIndex + 1];
          var previousBlock = textPanel.textLines[textBlockIndex - 1];
          panelY = previousBlock.y + previousBlock.linesHeight;
          panelBoundHeight = nextBlock.y - panelY;
        }
      }
    }

    textDebug.clear();

    if(panelBoundHeight < 0)
    {
      console.log('ooops');
    }

  /*  textDebug.add(root.drawSVG.rect(panelBoundWidth, panelBoundHeight).fill('none').stroke({
      width: 1
    }).move(panelX, panelY).id('debug-block-' + panelID + '-' + textBlockIndex));
*/
    var boundsArr = [];
    boundsArr['width'] = panelBoundWidth;
    boundsArr['height'] = panelBoundHeight;
    boundsArr['x'] = panelX;
    boundsArr['y'] = panelY;



    return boundsArr;
  };

  var getPanelBlockSpace = function(panelID){
    //given a text panel - work out how much space there is if all blocks are closed up
    var textPanel,
        overallHeight,
        spaceAvailable;

    textPanel = vars.signTextPanels[panelID];
    spaceAvailable = textPanel.height - (textPanel.margin.top + textPanel.margin.bottom);
    overallHeight = 0;
    textPanel.textLines.forEach(function(lineItem, lineItemIndex) {
      overallHeight += lineItem.linesHeight;
    });



    return spaceAvailable - overallHeight;

  };

  var getPanelBlockHeight = function(panelID){
    //given the panelID get the over text block bounds with current spacing
    var textPanel,
        firstTextPanel,
        lastTextPanel,
        textLines,
        overallHeight;

    textPanel = vars.signTextPanels[panelID];
    textLines = textPanel.textLines.length;
    if(textLines > 0) {
        firstTextPanel = textPanel.textLines[0];
        lastTextPanel = textPanel.textLines[textLines - 1];
        overallHeight = (lastTextPanel.y + lastTextPanel.linesHeight) - firstTextPanel.y;
    }
    return overallHeight;

  };

  var reDrawTextPanel = function(textPanel, textPanelIndex) {
      var textLines,
          textBlockBound,
          panelID,
          oldBlocksHeight,
          newTextInfo;

      panelID = textPanelIndex;
      textBLockLines = textPanel.textLines;
      oldBlocksHeight = getPanelBlockHeight(textPanelIndex);
      textBLockLines.forEach(function(textLines, blockID){
        textBlockBound = getTextBlockBoundsByID(panelID, blockID);
        //record the bounds for this text block for later use
        textLines.boundBox = textBlockBound;

        newTextInfo = calcTextToPanelSize(textLines.text, textBlockBound.width, textBlockBound.height, textLines.weight, textLines.size, textLines.anchor, textLines.leading); //['plainText'] ['fontsize']
        textLines.size = newTextInfo.fontsize;
        textLines.text = newTextInfo.plainText;
        textLines.linesHeight = newTextInfo.linesHeight;

        verticalAlignTextInBlock(panelID, blockID); //, textBlockBound, newTextInfo['linesHeight']);
        horizontalAlignTextInBlock(panelID, blockID, textLines.anchor);
        reDrawTextBlock(panelID, blockID);
      });

//      return textLines;

};

  var alignSign = function(addMeasurements, addFrame, scaleSign)
   {

     completeSign = root.drawSVG.group().id('complete');

     completeSign.add(signFrameDraw);

     if(signBorderDraw)
      completeSign.add(signBorderDraw);

    if(signPanelDraw)
     completeSign.add(signPanelDraw);

     if(symbolPanel)
     completeSign.add(symbolPanel);

     if(textFrameGroup)
      completeSign.add(textFrameGroup);

    if(symbolFrameGroup)
     completeSign.add(symbolFrameGroup);

   if(thumbFrame)
      completeSign.add(thumbFrame);


   if(thumbBorder)
     completeSign.add(thumbBorder);

     if(textDebug)
       completeSign.add(textDebug);

 if(DEBUG_TEXT_BOXES){
  //   textDebug.remove();
  //   textDebugArr.forEach(function(textDebugBoxitem) {
 //      textDebug.add(textDebugBoxitem)
 //    })
     completeSign.add(textDebug);

 }




     var x = (vars.drawingWidth - vars.signWidth) / 2;
     var y = (vars.drawingHeight - vars.signHeight) / 2;


     completeSign.move(x, y);

     //scale the image
     var scaleFactor = 1;
     if(scaleSign) {
       scaleFactor =  Math.min((vars.drawingWidth / vars.signWidth ) , (vars.drawingHeight / vars.signHeight)) * SCALE_MAX_DRAW;
     }
     else {
       scaleFactor = 1;
     }
    completeSign.scale(scaleFactor,scaleFactor);

    if(thumbFrame)
    {
      thumbBorder.stroke({ width: 1, color: 'black'});
    }


      //draw the outer frame with nice pixel border
      var newWidth = vars.signWidth * scaleFactor;
      var newHeight = vars.signHeight * scaleFactor;
      var newX = (vars.drawingWidth - newWidth) / 2;
      var newY = (vars.drawingHeight - newHeight) / 2;

     if(addFrame)
     {
       signFrameDrawSolid = root.drawSVG.rect(newWidth,newHeight).fill('none').stroke({ width: 0.5, color: 'black'}).move(newX, newY).id('signFrameDrawArea');
     }
     else {
       signFrameDrawSolid = root.drawSVG.rect(newWidth,newHeight).fill('none').stroke({ width: 0, color: 'none'}).move(newX, newY).id('signFrameDrawArea');
     }

   if(addMeasurements){
      signFrameDraw.stroke({ width: 0, color: 'black' });

      signFrameDraw.filter(function(add) {
        var blur = add.offset(4, 4).in(add.sourceAlpha).gaussianBlur(4);
        add.blend(add.source, blur);
        this.size('200%','200%').move('-50%', '-50%');
      });
    }

  };

  var drawVerticalSizing = function()
  {

    var posX = eval(signFrameDrawSolid.x()) + MEASUREMENT_OFFSET + signFrameDrawSolid.width();
    var posY = eval(signFrameDrawSolid.y());

    var totalLength = signFrameDrawSolid.height();


      sizingGuide.add(root.drawSVG.line(posX, posY, posX + MEASURELINE_END,  posY).stroke({ width: 1 }));
      sizingGuide.add(root.drawSVG.line(posX + MEASURELINE_END/2, posY, posX + MEASURELINE_END/2,  posY + totalLength).stroke({ width: 1 }));
      sizingGuide.add(root.drawSVG.line(posX, posY  + totalLength , posX + MEASURELINE_END,  posY + totalLength).stroke({ width: 1 }));

      var txtVert = root.drawSVG.text(vars.signHeight + 'mm');
      txtVert.font({family:'Arial', size: 10});
      var fontlength = txtVert.length();

      txtVert.move((posX + MEASURELINE_END/2) - (MEASUREMENT_OFFSET) + 2, posY + ((totalLength - fontlength) /  2));
      txtVert.transform({ rotation: -90 });
      sizingGuide.add(txtVert);




  };

  var drawVHorizonatlSizing = function()
  {
      var posX = signFrameDrawSolid.x();
      var posY = eval(signFrameDrawSolid.y()) + MEASUREMENT_OFFSET + signFrameDrawSolid.height();
      var totalLength = signFrameDrawSolid.width();

      sizingGuide.add(root.drawSVG.line(posX, posY, posX ,  posY + MEASURELINE_END).stroke({ width: 1 }));
      sizingGuide.add(root.drawSVG.line(posX , posY + MEASURELINE_END/2 , posX + totalLength,  posY + MEASURELINE_END/2).stroke({ width: 1 }));
      sizingGuide.add(root.drawSVG.line(posX + totalLength, posY , posX  + totalLength ,  posY  + MEASURELINE_END).stroke({ width: 1 }));

      var txtHoriz = root.drawSVG.text(vars.signWidth + 'mm');
      txtHoriz.font({family:'Arial', size: 10});
      var fontlength = txtHoriz.length();
      txtHoriz.move((posX + (totalLength - fontlength) /  2) , (posY + MEASURELINE_END/2)  + 2);
      sizingGuide.add(txtHoriz);

  };

  var drawSizing = function()
  {
    //used to add the measurements

    sizingGuide = root.drawSVG.group().id('measurements');

    drawVerticalSizing();
    drawVHorizonatlSizing();

  };


  this.drawSignForExport = function(options, addBorder, addFrame)
  {
    $.extend(vars , options);

        this.drawSVG.clear() ; //clear everything

        this.drawSVG.width(vars.drawingWidth + vars.units);  //set the realylife dimenstions
        this.drawSVG.height(vars.drawingHeight + vars.units);

        //this.drawSVG.viewbox(0, 0, vars.drawingWidth, vars.drawingHeight)
        this.drawSVG.viewbox(0, 0, vars.signWidth, vars.signHeight);


        //drawFrame(origin, width, height, borderSize, borderRadius , radiusCorner, borderColour, fillColour, strokeColour, strokeWidth )
    //    if(addBorder){
      //      thumbBorder = root.drawSVG.rect(vars.signWidth,vars.signHeight).fill('none').stroke({ width: 1, color: 'black'}).move(0,0).id('thumbBorder')
    //    }

        drawFrame([0,0], vars.signWidth, vars.signHeight, vars.signBorder.borderSize,  vars.signBorder.borderRadius, [1,1,1,1], vars.signBorder.colour, vars.signBackground, '#FFFFFF', 0);  //the sign frame and border color if needed

      //  drawPanel(vars.signPanel.origin, vars.signPanel.width, vars.signPanel.height, vars.signPanel.colour)  //the panel that the symbols and text fit in (needed for multi signs)

        symbolFrameGroup = root.drawSVG.group().id('symbols');   //symbols

        drawSymbols(vars.signSymbols);

        textFrameGroup = root.drawSVG.group().id('texts');  //texts
        drawTextPanels(false, true);


    //    alignSign(false, false, false) //don't draw the measurements

        if(addFrame){
          thumbFrame = drawRectangle([0,0], vars.signWidth, vars.signHeight, 'none', 'black', 1,'thumbSignFrame');
        }


      //  drawSizing()









  };


  this.exportToSVGThumb = function(thumbWidth, thumbHeight)
  {

    return this.drawSVG.svg();

  //  var thumbsign = completeSign.svg();


  /*  thumbsign.add(signFrameDraw)

    if(signBorderDraw)
     thumbsign.add(signBorderDraw)

   if(signPanelDraw)
    thumbsign.add(signPanelDraw)

    if(symbolPanel)
    thumbsign.add(symbolPanel)

    if(textFrameGroup)
     thumbsign.add(textFrameGroup)

   if(symbolFrameGroup)
    thumbsign.add(symbolFrameGroup)*/


    //thumbSVG.get('measurements').remove();

  //  var SVGOut = '<svg id="SVGThumb" width="'+vars.signWidth+'" height="'+vars.signHeight+'" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs">';
  //  SVGOut += thumbsign;
  //  SVGOut += '</svg>';

  //  return SVGOut;
  };


  this.construct(drawObject, options);

};
