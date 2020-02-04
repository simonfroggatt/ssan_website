//give a bespoke construct object this class dras the sign
var bespokeDrawer = function(drawObject, options) {

    DRAW_DEBUG_FRAMES = false
    DEBUG_TEXT_BOXES = false
    SCALE_MAX_DRAW = 0.8
    MEASUREMENT_OFFSET = 10
    MEASURELINE_END = 20

    DEFAULT_FONT = 'Arial'
    DEFAULT_FONT_WEIGHT = 'Bold'
    DEFAULT_FONT_HEIGHT_RATIO = 0.1
    MIN_FONT_SIZE = 5

    MAX_TEXT_PANEL_RATIO = 0.95

    var vars = {
      signWidth: 0,
      signHeight: 0,
      drawingWidth: 0,
      drawingHeight: 0,

      signBackground: '#000000',
      signPanel : {},
      signSymbols: {},

      signSymbolFrame: {},
      signTextFrame: {},
      signTextPanels: {},

      drawIgnore: {},

      units: 'px'

    }

    var lockSymbolSize = true;
    var lockTextVertical = true;

    var drawingArea;
    var signFrameDrawSolid
    var signFrameDraw;   //very out edge to indicate the size
    var signBorderDraw;  //border of the sign
    var signPanelDraw;  //contains the symbols and text
    var symbolPanel;

    var textFrameGroup
    var symbolFrameGroup

    var completeSign;

    var sizingGuide;

    var thumbBorder;
    var thumbFrame;

    var textDebugArr = [];
    var textDebug;

    this.drawSVG

    var root = this

    /*
     * Constructor
     */
    this.construct = function(drawObject, options){

        $.extend(vars , options)
        this.drawSVG = SVG(drawObject).size(vars.drawingWidth, vars.drawingHeight)

        drawingArea = root.drawSVG.rect(vars.drawingWidth,vars.drawingHeight).fill('none').stroke({ width: 1 }).id('drawingArea');
    };

    this.drawSign = function(options, clear = false, whatsChanged = '')
    {

      $.extend(vars , options)

      if(clear)
      {
        clearSign()
      }

          //drawFrame(origin, width, height, borderSize, borderRadius , radiusCorner, borderColour, fillColour, strokeColour, strokeWidth )
          drawFrame([0,0], vars.signWidth, vars.signHeight, vars.signBorder.borderSize,  vars.signBorder.borderRadius, [1,1,1,1], vars.signBorder.colour, vars.signBackground)

          drawPanel(vars.signPanel.origin, vars.signPanel.width, vars.signPanel.height, vars.signPanel.colour)

          symbolFrameGroup = root.drawSVG.group().id('symbols')

          drawSymbols(vars.signSymbols)

          textFrameGroup = root.drawSVG.group().id('texts')
          textDebug = root.drawSVG.group().id('text_debug')
          drawTextPanels()

          alignSign()

          drawSizing()

    }

    this.drawSignForExport = function(options, addBorder = false, addFrame = false)
    {
      $.extend(vars , options)

          this.drawSVG.clear()  //clear everything

          this.drawSVG.width(vars.drawingWidth + vars.units)  //set the realylife dimenstions
          this.drawSVG.height(vars.drawingHeight + vars.units)

          this.drawSVG.viewbox(0, 0, vars.drawingWidth, vars.drawingHeight)


          //drawFrame(origin, width, height, borderSize, borderRadius , radiusCorner, borderColour, fillColour, strokeColour, strokeWidth )
      //    if(addBorder){
        //      thumbBorder = root.drawSVG.rect(vars.signWidth,vars.signHeight).fill('none').stroke({ width: 1, color: 'black'}).move(0,0).id('thumbBorder')
      //    }

          drawFrame([0,0], vars.signWidth, vars.signHeight, vars.signBorder.borderSize,  vars.signBorder.borderRadius, [1,1,1,1], vars.signBorder.colour, vars.signBackground)  //the sign frame and border color if needed

          drawPanel(vars.signPanel.origin, vars.signPanel.width, vars.signPanel.height, vars.signPanel.colour)  //the panel that the symbols and text fit in (needed for multi signs)

          symbolFrameGroup = root.drawSVG.group().id('symbols')   //symbols

          drawSymbols(vars.signSymbols)

          textFrameGroup = root.drawSVG.group().id('texts')  //texts
          drawTextPanels()


          alignSign(false, false, false) //don't draw the measurements

      /*    if(addFrame){
            thumbFrame = drawRectangle([0,0], vars.signWidth, vars.signHeight, 'none', 'black', 1,'thumbSignFrame')
            alignSign(false)
          }*/


        //  drawSizing()
    }

    this.drawThumb = function(options)
    {
      $.extend(vars , options)

          this.drawSVG.width(vars.drawingWidth)
          this.drawSVG.height(vars.drawingHeight)

          this.drawSVG.clear()
          this.drawSVG.viewbox(0, 0, vars.drawingWidth, vars.drawingHeight)


          //drawFrame(origin, width, height, borderSize, borderRadius , radiusCorner, borderColour, fillColour, strokeColour, strokeWidth )
          drawFrame([0,0], vars.signWidth, vars.signHeight, vars.signBorder.borderSize,  vars.signBorder.borderRadius, [1,1,1,1], vars.signBorder.colour, vars.signBackground)

          drawPanel(vars.signPanel.origin, vars.signPanel.width, vars.signPanel.height, vars.signPanel.colour)

          symbolFrameGroup = root.drawSVG.group().id('symbols')

          drawSymbols(vars.signSymbols)

          textFrameGroup = root.drawSVG.group().id('texts')
          drawTextPanels()

          alignSign()

        //  drawSizing()
    }

    this.reDrawSymbol = function(options)
    {
        $.extend(vars , options)

        symbolFrameGroup.clear()

        drawSymbols(vars.signSymbols)
    }

    //changer functions

    this.scaleSymbol = function(options)
    {
          $.extend(vars , options)

        //  symbolFrameGroup.clear()

          rescaleSymbols(vars.signSymbols)
          rescaleTextPanels()
    }

    this.setSignSize = function(newWidth, newHeight)
    {
      vars.signWidth = newWidth
      vars.signHeight = newHeight
    }

    this.reDrawText = function(options, textPanelID = -1, textBlockID = -1)
    {
          $.extend(vars , options)

          textFrameGroup.remove()
          textFrameGroup = root.drawSVG.group().id('texts')

        //  if( (textPanelID > -1)  ){
        //  var newTextBlock = recalcTextPanelBlock(textPanel, textPanel.textLines[textBlockID], textBlockID)
        //

          drawTextPanels(true)



          if(textFrameGroup)
           completeSign.add(textFrameGroup)

          return  vars.signTextPanels;
      //    alignSign()
    }


    this.reDrawSignColor = function(backgroundColour)
    {
        vars.signPanel.colour = backgroundColour;
        signBorderDraw.fillColour = backgroundColour;

    }

    this.reDrawSignBorder = function(options)
    {
        $.extend(vars , options);
    }

    //functions used for Call backs
    this.getTextInfo = function()
    {
        return vars.signTextPanels;
    }

    this.ChangeTextSize = function(textPanelID,textPanelBlockID, changeBy)
    {
      var textblock = 'textblock-'+textPanelID+'-'+textPanelBlockID;
      var textBlockToChange = SVG.get(textblock);

      var panelBounds = getSingleTextBlockBounds(textPanelID, textPanelBlockID)  // function(textPanel, textPanelLine, textBlockID = -1)

      var textLinesNew = createTextToBounds(textPanelID, textPanelBlockID, panelBounds[0], panelBounds[1], changeBy) //function(textPanel, panelWidth, panelHeight, textPanelLine)

      textBlockToChange.font('size', textLinesNew.font('size'));

      var newLines = textLinesNew.lines();

      textBlockToChange.clear();

    //  textBlockToChange = textLinesNew;
    //  textBlockToChange.rebuild(true);
    //  textLinesNew.remove();

      //get the space available to this text block

  //    var oldSize = textBlockToChange.font('size');
  //    oldSize += changeBy
  //    textBlockToChange.font('size', oldSize);


      return textBlockToChange.attr('size');
    }

    var clearSign = function()
    {
      root.drawSVG.clear()
      drawingArea = root.drawSVG.rect(vars.drawingWidth,vars.drawingHeight).fill('none').stroke({ width: 1 })
    }

    var drawFrame = function(origin, width, height, borderSize = 0, borderRadius = 0, radiusCorner = [0,0,0,0], borderColour = '#000000', fillColour = '#000000', strokeColour = '#FFFFFF', strokeWidth = 0){

      if(borderSize > 0){
        var borderOrigin = [origin[0] + borderSize, origin[1] + borderSize]
        var borderWidth = width - 2 * borderSize
        var borderHeight = height - 2 * borderSize


        signFrameDraw = drawRectangle(origin, width, height, borderColour, '#FFFFFF', 0,'signFrame')

        signBorderDraw = drawCorneredRectangle(borderOrigin, borderWidth, borderHeight, borderRadius, radiusCorner,  fillColour, 'none',1, 'signBorder')

      }
      else {

        signFrameDraw = drawRectangle(origin, width, height, fillColour, '#000000', 0, 'signFrame')
        if(signBorderDraw)
        {
          signBorderDraw = null;
        }

      }

    }

    this.setSymbolLock = function(symbolLockStatus)
    {
      lockSymbolSize = symbolLockStatus;


    }

    this.setTextVeticalLock = function(textLockStatus)
    {
      lockTextVertical = textLockStatus;
    }


    var drawPanel = function(origin, width, height, panelColour){
      if(DRAW_DEBUG_FRAMES)
          signPanelDraw = drawRectangle(origin, width, height, panelColour, '#000000', 1)
    }


    var createCompleteSign = function()
    {
      //  completeSign = root.drawSVG.group(signPanelDraw,signBorderDraw)
    }



    var drawRectangle = function(origin, width, height, fillColour = '#000000', strokeColour = '#FFFFFF', strokeWidth = 0, idText = '')
    {

      if(idText != '') {
        return root.drawSVG.rect(width,height).fill(fillColour).stroke({ width: strokeWidth, color: strokeColour}).move(origin[0], origin[1]).id(idText)
      }
        else {
        return  root.drawSVG.rect(width,height).fill(fillColour).stroke({ width: strokeWidth, color: strokeColour}).move(origin[0], origin[1])
        }
    }

    var drawCorneredRectangle = function(origin, width, height, rsize, radius, fillColour = '#000000', strokeColour = '#FFFFFF', strokeWidth = 0, idText = '')
    //radius is array [topleft, topright, bottomleft, bottomright]
    {

      //radius top, right, bottom, left
      var pathstr = ''
      var originX = origin[0]
      var originY = origin[1]

      pathstr += 'M' + (originX + radius[0]*rsize) + ' '+(originY)

      pathstr += ' h'+ (width - ((radius[0]*rsize) + (radius[1])*rsize))
      if(radius[1])
        pathstr += ' a'+(radius[1]*rsize)+','+(radius[1]*rsize) + ' 0 0 1 ' + (radius[1]*rsize) + ' '+(radius[1]*rsize)

      pathstr += ' v'+ (height - ((radius[1]*rsize) + (radius[2]*rsize)))
      if(radius[2])
        pathstr += ' a'+(radius[2]*rsize)+','+(radius[2]*rsize) + ' 0 0 1 ' + '-'+(radius[2]*rsize) + ' ' +(radius[2]*rsize)

      pathstr += ' h-'+ (width - ((radius[2]*rsize) + (radius[3]*rsize)))
      if(radius[3])
        pathstr += ' a'+(radius[3]*rsize)+','+(radius[3]*rsize) + ' 0 0 1 ' + '-' + (radius[3]*rsize) + ' -'+(radius[3]*rsize)

      pathstr += ' v-'+ (height - ((radius[3]*rsize) + (radius[0]*rsize)))
      if(radius[0])
        pathstr += ' a'+(radius[0]*rsize)+','+(radius[0]*rsize) + ' 0 0 1 ' + ' ' + (radius[0]*rsize) + ' -'+(radius[0]*rsize)

        pathstr += 'z';

    var tmp
    if(idText != '') {
      tmp =  root.drawSVG.path(pathstr).fill(fillColour).stroke({ width: strokeWidth, color: strokeColour }).id(idText)
    }
    else {
      tmp =  root.drawSVG.path(pathstr).fill(fillColour).stroke({ width: strokeWidth, color: strokeColour })
    }
    return tmp
  }

  var drawSymbols = function(symbolsArr){
    if(symbolsArr.length > 0){

  //  if(DRAW_DEBUG_FRAMES)
  //  symbolPanel = root.drawSVG.rect(vars.signSymbolFrame.width, vars.signSymbolFrame.height).fill('none').stroke({ width: 1, color: 'green'}).move(vars.signSymbolFrame.origin[0], vars.signSymbolFrame.origin[1]).id('symbolPanel')
  //     symbolFrameGroup.add(symbolPanel)

    var xpos = 0
    var ypos = 0
       symbolsArr.forEach(function(item, index){
         var symbolSVG = AddSymbolToSVG('symbol-'+index, item)
         })
    }
  }

  var AddSymbolToSVG = function(symbolID, svgInfo) {
    var nested = root.drawSVG.nested().svg(svgInfo.svgCode)
    nested.width(svgInfo.width)
    nested.height(svgInfo.height)

    var svgViewBox = svgInfo.viewBox;
    var origin = svgInfo.origin

    nested.viewbox(parseFloat(svgViewBox[0]), parseFloat(svgViewBox[1]), parseFloat(svgViewBox[2]), parseFloat(svgViewBox[3]))
    nested.id(symbolID)

    nested.move(origin[0], origin[1])

    symbolFrameGroup.add(nested)

  }

  var AddSymbolToSVGAjax = function(symbolPath, symbolID, width, height, origin, symbolID)
  {

    $.ajax({
     async: false,
     type: 'GET',
     url: symbolPath,
     success: function(data) {
       var svgData = data.querySelector('svg')
       var svgHeight = parseFloat(svgData.getAttribute('height'))
       var svgWidth = parseFloat(svgData.getAttribute('width'))
       var svgViewBox = svgData.getAttribute('viewBox').split(/\s+|,/)

       //var nestedSymbol = symbolFrameGroup.nested().svg(svgData.innerHTML)
     //  var nestedSymbol = root.drawSVG.svg(svgData.innerHTML).id(symbolID)
     //  outerSVG.id('outerSVG')
       var nested = root.drawSVG.nested().svg(svgData.innerHTML)
       nested.width(width)
       nested.height(height)

       nested.viewbox(parseFloat(svgViewBox[0]), parseFloat(svgViewBox[1]), parseFloat(svgViewBox[2]), parseFloat(svgViewBox[3]))
       nested.id(symbolID)

       var scaleWidth = width/svgWidth
       var scaleHeight = height/svgHeight

       nested.move(origin[0], origin[1])

       symbolFrameGroup.add(nested)
     }
});
  }


    var rescaleSymbols = function(symbolsArr)
    {
      var tmpSymbol;
      var svgHeight;
      var svgWidth;
      symbolsArr.forEach(function(item, index){

        tmpSymbol  = SVG.get('symbol-'+index)
        if(tmpSymbol != null)
            tmpSymbol.size(item.width, item.height).move(item.origin[0],item.origin[1])
      })

    //  symbolPanel.remove()
    //  symbolPanel = root.drawSVG.rect(vars.signSymbolFrame.width, vars.signSymbolFrame.height).fill('none').stroke({ width: 1, color: 'green'}).move(vars.signSymbolFrame.origin[0], vars.signSymbolFrame.origin[1]).id('symbolPanel')
    //     symbolFrameGroup.add(symbolPanel)

    }




    var drawTextPanels = function(recalcAll = true){
      /*
      this function loops through each of the text panels  - simple isgns only have 1 text Panel
      */
        if(DRAW_DEBUG_FRAMES)
          root.drawSVG.rect(vars.signTextFrame.width, vars.signTextFrame.height).fill('none').stroke({ width: 1, color: 'green'}).move(vars.signTextFrame.origin[0], vars.signTextFrame.origin[1])


         vars.signTextPanels.forEach(function(textPanelItem, textPanelIndex){   //each text panel
         if(textPanelItem.cornerRadius > 0 )
           {
             //root.textGroup.add( drawCorneredRectangle([xpos,ypos], textPanelWidth, item.height*panelScaling, item.panelRadius, item.panelCorner,item.colour,1))
             //function(origin, width, height, rsize, radius, fillColour = '#000000', strokeColour = '#FFFFFF', strokeWidth = 0, idText = '')
             var textFrame = drawCorneredRectangle([textPanelItem.origin[0],textPanelItem.origin[1]], textPanelItem.width, textPanelItem.height, textPanelItem.cornerRadius, textPanelItem.corners,textPanelItem.colour, 'none', 0).id('text-panel-'+textPanelIndex)
             textFrameGroup.add(textFrame)
           }
           else {
             //root.textGroup.add(root.drawSVG.rect(textPanelWidth,item.height*panelScaling).fill(item.colour).stroke({ width: 1 }).move(xpos,ypos))
             var textFrame = root.drawSVG.rect(textPanelItem.width,textPanelItem.height).fill(textPanelItem.colour).stroke({ width: 1 }).move(textPanelItem.origin[0],textPanelItem.origin[1])
             textFrameGroup.add(textFrame)
           }

          // var textLineAdded = setTextLinesOld(item.textLines, textFrame)
           //var textLineAdded = setTextLines(item.textLines, textFrame, 1, item.baseTextColour)
          // var textLineAdded = setTextLines(item, 1)
          //if(recalcAll){
           DrawTextPanelBlocks(textPanelItem);

        //   recalcTextPanelBlock(index, )
        //   var textLineAdded = setTextLines(item, 1)


          // textFrameGroup.add(textLineAdded)
         })

      }

      var DrawTextPanelBlocks = function(textPanel) {
          /*
          Draws the text for a given text panel
          Intereate through each of the text blocks in each panel
          */
          var textLineColor;
          var textLines = textPanel.textLines;
          textLines.forEach(function(textObject, textIndex) {
            if(textObject.colour)
            {
              textLineColor = textObject.colour;
            }
            else {
              textLineColor = textPanel.baseTextColour;
            }

            textLineDrawn = root.drawSVG.text(textObject.text).font( {family:  DEFAULT_FONT, fill: textLineColor, size: textObject.size, weight: textObject.weight, anchor: textObject.anchor, leading: textObject.leading  }).id('textblock-'+textPanel.id+'-'+textIndex);
            textLineDrawn.x(textObject.x);
            textLineDrawn.y(textObject.y);

            textFrameGroup.add(textLineDrawn)
          })


      }



      var DrawTextPanelBlocks_old = function(textPanel) {
          /*
          Draws the text for a given text panel
          Intereate through each of the text blocks in each panel
          */
          var totalPanelHeight = textPanel.height - (textPanel.margin['top'] + textPanel.margin['bottom']);
          var totalPanelWidth = textPanel.width - (textPanel.margin['left'] + textPanel.margin['right']);

          var textPanelLines = textPanel.textLines;
          var newTextLinesArr = [];
          textPanelLines.forEach(function(textPanelLine, textLineIndex) {
              var newTextLines = recalcTextPanelBlock(textPanel, textPanelLine, textLineIndex)
              newTextLinesArr.push(newTextLines);

          })
          if(lockTextVertical) {
              newTextLinesArr = alignTextBlocksMiddle(newTextLinesArr, textPanel)
          }


          return newTextLinesArr;

          //1 - for each of the text blocks get the "space left"
          //2 - with that space scale / move / line height etc withing the bounds of that space


      }

      var recalcTextPanelBlock = function(textPanel, textPanelLine, textPanelIndex = -1 ){
        /*
        Takes a given text line and re-sizes, word wraps etc for the given line of text in the
        */
              //used to recale the font size, position, line height etc for a certain text panel block

        var panelBoundX = textPanel.origin[0] + textPanel.margin['left'];
        var panelBoundY = textPanel.origin[1] + textPanel.margin['top'];
        var boundArr = getTextBlockBounds(textPanel, textPanelLine, textPanelIndex)


        //now check that the movement  / scale etc fits within the bounds
        textDebugArr = [];
        var textLinesNew = createTextToBoundsOld(textPanel, boundArr[0], boundArr[1], textPanelLine);
        textLinesNew = setTextLinePosition(textLinesNew, textPanelLine, boundArr[0], boundArr[1], [panelBoundX, panelBoundY],  lockTextVertical);


        return textLinesNew;



      }

      var getTextBlockBounds = function(textPanel, textPanelLine, textBlockID = -1)
      {
      //  var textPanel = vars.signTextPanels[textPanelID];
        var panelWidth = textPanel.width - (textPanel.margin['left'] + textPanel.margin['right']);
        var panelHeight = textPanel.height - (textPanel.margin['top'] + textPanel.margin['bottom']);
        var textBlockCount = textPanel.textLines.length;

        var panelBoundWidth = panelWidth
        var panelBoundHeight = panelWidth



        var iBlockID = 0;
        var v_textBlock;

        if(textPanel.textLines.length > 1){  //this is the only text line

          if( textBlockID == 0){   //get the bounds from top of the panel to the next block below

          }
          else {
            if(textBlockID == textPanel.textLines.length){ //get the bounds from previous block to bottom of panel

            }
            else { //get the bounds from previous block to the next block

            }
          }
        }

        return [panelBoundWidth, panelBoundHeight]


      }

      var getSingleTextBlockBounds = function(textPanelID, textPanelBlockID)
      {
        var textPanel = vars.signTextPanels[textPanelID];
        var panelWidth = textPanel.width - (textPanel.margin['left'] + textPanel.margin['right']);
        var panelHeight = textPanel.height - (textPanel.margin['top'] + textPanel.margin['bottom']);
        var textBlockCount = textPanel.textLines.length;

        var panelBoundWidth = panelWidth
        var panelBoundHeight = panelWidth



        var iBlockID = 0;
        var v_textBlock;

        if(textPanel.textLines.length > 1){  //this is the only text line

          if( textBlockID == 0){   //get the bounds from top of the panel to the next block below

          }
          else {
            if(textBlockID == textPanel.textLines.length){ //get the bounds from previous block to bottom of panel

            }
            else { //get the bounds from previous block to the next block

            }
          }
        }

        return [panelBoundWidth, panelBoundHeight]


      }


      var createTextToBounds = function(textPanelID, textPanelBlockID, fitWidth, fitHeight, changeBy)
      {
        var textPanel = vars.signTextPanels[textPanelID];
        var textPanelLine = textPanel.textLines[textPanelBlockID];

        var panelWidth = textPanel.width - (textPanel.margin['left'] + textPanel.margin['right']);
        var panelHeight = textPanel.height - (textPanel.margin['top'] + textPanel.margin['bottom']);
        var textLineColor;
        var panelX = textPanel.origin[0] + textPanel.margin['left'];
        var panelY = textPanel.origin[1] + textPanel.margin['top'];


        //var textAdded =  scaleTexttoPanelSize(textPanelLine.text, fitWidth, fitHeight, textPanelLine.weight, textPanelLine.size + changeBy, textPanelLine.anchor, textPanelLine.leading);
        calcTextToPanelSize = function(textPanelLine.text, fitWidth, fitHeight, textPanelLine.weight, textPanelLine.size + changeBy, textPanelLine.anchor, textPanelLine.leading);
      //  textPanelLine.size = textAdded.attr('size');
/*
        switch(textPanelLine.anchor){
          case 'start' :
          textAdded.x(panelX);// + panelWidth*(1-MAX_TEXT_PANEL_RATIO))
           break
          case 'middle' :
            textAdded.x(panelX + panelWidth/2)
            break
          case 'end' :

           textAdded.x(panelX + panelWidth);//*MAX_TEXT_PANEL_RATIO))
             break
        }*/


        //textAdded.id('text-line-' + textPanel['id']+'-' +textPanelLine['id'])
        //textAdded.remove();
        return textAdded;

      }


      var createTextToBoundsOld = function(textPanel, panelWidth, panelHeight, textPanelLine)
      {
        /*
        For the given text line and the bounds passed in re-size, word wrap for these bounds
        */



        var textLineColor;
        var panelX = textPanel.origin[0] + textPanel.margin['left'];
        var panelY = textPanel.origin[1] + textPanel.margin['top'];

        if(DEBUG_TEXT_BOXES) {
        temp = root.drawSVG.rect(panelWidth, panelHeight).fill('none').stroke({ width: 1, color: 'green'}).move(panelX, panelY).id('debug-text-'+textPanelLine['id'])
        textFrameGroup.add(temp)
        textDebugArr[textPanelLine['id']] = temp;
        }

             if(textPanelLine.colour)
             {
               textLineColor = textPanelLine.colour;
             }
             else {
               textLineColor = textPanel.baseTextColour;
             }

             var textAdded =  scaleTexttoPanelSize(textPanelLine.text, panelWidth, panelHeight, textLineColor, textPanelLine.weight, textPanelLine.size, textPanelLine.anchor, textPanelLine.leading);
             textPanelLine.size = textAdded.attr('size');

             switch(textPanelLine.anchor){
               case 'start' :
               textAdded.x(panelX);// + panelWidth*(1-MAX_TEXT_PANEL_RATIO))
                break
               case 'middle' :
                 textAdded.x(panelX + panelWidth/2)
                 break
               case 'end' :

                textAdded.x(panelX + panelWidth);//*MAX_TEXT_PANEL_RATIO))
                  break
             }

             textAdded.id('text-line-' + textPanel['id']+'-' +textPanelLine['id'])

            // var newPanelHeight = (textAdded.cy() - textAdded.y()) * 2
           //  textAdded.y(textLinesTotalHeight)

        return textAdded;
      //  newTextArray = setTextLineOrigin(textAddedArr, textPanelFrame)


      //  return newTextArray;

      }


    var rescaleTextPanels = function()
    {
      textFrameGroup.clear()
      if(DRAW_DEBUG_FRAMES)
        root.drawSVG.rect(vars.signTextFrame.width, vars.signTextFrame.height).fill('none').stroke({ width: 1, color: 'red'}).move(vars.signTextFrame.origin[0], vars.signTextFrame.origin[1])


       vars.signTextPanels.forEach(function(item){
       if(item.cornerRadius > 0 )
         {
           //root.textGroup.add( drawCorneredRectangle([xpos,ypos], textPanelWidth, item.height*panelScaling, item.panelRadius, item.panelCorner,item.colour,1))
           //function(origin, width, height, rsize, radius, fillColour = '#000000', strokeColour = '#FFFFFF', strokeWidth = 0, idText = '')
           var textFrame = drawCorneredRectangle([item.origin[0],item.origin[1]], item.width, item.height, item.cornerRadius, item.corners,item.colour, 'none', 0)
           textFrameGroup.add(textFrame)
         }
         else {
           //root.textGroup.add(root.drawSVG.rect(textPanelWidth,item.height*panelScaling).fill(item.colour).stroke({ width: 1 }).move(xpos,ypos))
           var textFrame = root.drawSVG.rect(item.width,item.height).fill(item.colour).stroke({ width: 1 }).move(item.origin[0],item.origin[1])
           textFrameGroup.add(textFrame)
         }

        var textLineAdded = setTextLines(item, 0)

         textLineAdded.forEach(function(textObject) {
           textFrameGroup.add(textObject)
         })
       })

    }





    var alignTextBlocksMiddle = function(newTextPanelLines, textPanel) {
        var panelHeight = textPanel.height - (textPanel.margin['top'] + textPanel.margin['bottom']);
        var panelTop = textPanel.origin[1] + textPanel.margin['top'];
        var textTop = newTextPanelLines[0].y();


        var textBlockHeight = getTotalTextBlockHeight(newTextPanelLines);
        var middleYOffset = ((panelHeight - textBlockHeight) / 2) + textPanel.origin[1] + textPanel.margin['top'];


        var moveY = (middleYOffset - textTop) / 2;

        newTextPanelLines.forEach(function(textObject, textIndex) {
          var newY = textObject.y() + moveY;
           textObject.y(newY);

      //     var tmpdebugY = textDebugArr[textIndex].y() + moveY
        //  textDebugArr[textIndex].y(tmpdebugY)

        })



        return newTextPanelLines;
    }









    var setTextLinePosition = function(newTextPanelLines, textPanelLine, panelWidth, panelHeight, panelOrigin,  lockTextVertical = true) {
      var newTextArr = [];
   //   var panelHeight = textFrame.height()

      //var panelY = textFrame.y()
      var lineHeight = 0;
      var previousYBottom = 0;
      var lineSpacing = 0;
      var newY = 0;
      var textLineOffset = 0
      var newyOffset = 0
      var previousYBottom = 0

      var frameTopY = panelOrigin[1];  //top of panel
      var frameBottomY = (panelOrigin[1] + panelHeight)    //bottom of panel
      previousYBottom = frameTopY
      nextYTop = frameBottomY
      lineHeight = (newTextPanelLines.cy() - newTextPanelLines.y())*2

         newY = textPanelLine.y + textPanelLine.yOffset + textLineOffset   //apply te movement
         if(newY == 0)   //very first black
         {
           newY = panelOrigin[1] + ((panelHeight - lineHeight)/ 2)  //center in the txt panel
         }

    /*     //see if there is another textline below and if so get the topY for this
         if(lineIndex < (newTextPanelLines.length-1))
         {
           nextYTop = textPanelInfo.textLines[lineIndex + 1].y;   //the next block down
         }
         if(lineIndex == newTextPanelLines.length - 1)  // last block
         {
           nextYTop = frameBottomY
         }
         if(textPanelInfo.textLines[lineIndex].yOffset > 0) { //moving down
           if( (newY > (nextYTop - lineHeight - textLineOffset )) )   //see if we are trying to move up into an existing text block
           {
               newY = nextYTop - textLineOffset - lineHeight
           }
         }
         else if (textPanelInfo.textLines[lineIndex].yOffset < 0) {  //moving up
           if( newY  <  previousYBottom )   //se if we trying to go down onto and existing tet block
           {
             //only move it to the closest place
             newY = previousYBottom + textLineOffset
           }
         }
*/
         newTextPanelLines.y(newY)
         previousYBottom = lineHeight + newY ;



     return newTextPanelLines;
    }

    var setTextLines = function(textPanelFrame, sizeBySpace = 1)
    {
      var panelWidth = textPanelFrame.width - (textPanelFrame.margin['left'] + textPanelFrame.margin['right']);
      var panelHeight = textPanelFrame.height - (textPanelFrame.margin['top'] + textPanelFrame.margin['bottom'])
      var textPanelLines = textPanelFrame.textLines;

      var textlines = textPanelLines.length

      var blockRatio = textLineRatios(textPanelLines)
      var spaceleft = panelHeight - getTotalBlockHeight(textPanelLines)
      if(spaceleft < 0)
         sizeBySpace = 0;

      //text panel for the whole section
      var panelX = textPanelFrame.origin[0] + textPanelFrame.margin['left'];
      var panelY = textPanelFrame.origin[1] + textPanelFrame.margin['top'];
      var textLinesTotalHeight = 0;

      var textAddedArr = []
      var newTextArray = []
      var textLineColor = textPanelFrame.baseColour;


      textPanelLines.forEach(function(lineItem, lineIndex){
           var newPanelHeight = 0
           if(sizeBySpace == 1){
             newPanelHeight = spaceleft + lineItem.blockHeight;
           }
           else {
             newPanelHeight = panelHeight * (lineItem.blockHeight / blockRatio)
           }

         //  var currentPanelHeight = spaceleft + getTextPanelHeight(lineItem)
           if(lineItem.colour)
           {
             textLineColor = lineItem.colour;
           }
           else {
             textLineColor = baseColour;
           }
           var textAdded =  scaleTexttoPanelSize(lineItem.text, panelWidth, newPanelHeight, textLineColor, lineItem.weight, lineItem.size, lineItem.anchor, lineItem.leading);
           lineItem.size = textAdded.attr('size');

           switch(lineItem.anchor){
             case 'start' :
             textAdded.x(panelX);// + panelWidth*(1-MAX_TEXT_PANEL_RATIO))
              break
             case 'middle' :
               textAdded.x(panelX + panelWidth/2)
               break
             case 'end' :

              textAdded.x(panelX + panelWidth);//*MAX_TEXT_PANEL_RATIO))
                break
           }
           textAdded.id('text-line-' + textPanelFrame['id']+'-' +lineIndex)

           var newPanelHeight = (textAdded.cy() - textAdded.y()) * 2
         //  textAdded.y(textLinesTotalHeight)
           textLinesTotalHeight += newPanelHeight

           textAddedArr.push(textAdded)

      })


      newTextArray = setTextLineOrigin(textAddedArr, textPanelFrame)


      return newTextArray;

    }

    var scaleTexttoPanelSize = function(textIn, panelwidth, panelHeight, colour, weight, size, anchor, leading)
    {
         var textLineObjsArr = createTextForSize(textIn, panelwidth, panelHeight, colour, weight, size, anchor, leading)
         var textLineObjs = textLineObjsArr[0]
         var textLinesHeight = getTextPanelHeight(textLineObjs)
         var textLinesWidth = textLineObjsArr[1]
         var origSize = size
         while( (textLinesHeight > panelHeight) || (textLinesWidth > panelwidth) )
         {
           origSize -= 1
           textLineObjsArr[0].remove()
           textLineObjsArr =  createTextForSize(textIn, panelwidth, panelHeight, colour, weight, origSize, anchor, leading)
           textLineObjs = textLineObjsArr[0]
           textLinesHeight = getTextPanelHeight(textLineObjs)
           textLinesWidth = textLineObjsArr[1]

           test1 = (textLinesHeight > panelHeight)
           test2 = (textLinesWidth > panelwidth)

         }

         return textLineObjs
    }

    var createTextForSize = function(textIn, width, height, colour, weight, size, anchor, leading = 1.5)
    {

     var inText = textIn.replace(/(?:\r\n|\r|\n)/g, '\n');
     tspanText = inText.split( "\n" )

      var maxPanel = 0
      var txtLineObj;
      var txtLine = ""
      var lines = []
      var spacer = ' '
      var maxwidth = 0;
      var lastWidth = 0;
      var lastLetterCount = 0


      for(var i = 0; i < tspanText.length; i++)
      {
        var spaceArr = tspanText[i].split(/ +/)
        txtLine = ''

        for(var j = 0; j < spaceArr.length; j++)
        {
           if(spaceArr[j].length > lastLetterCount - 2)
           {
             //potentially a long word so might have to scale
             txtWordObj = root.drawSVG.text(spaceArr[j]).font( {family:  DEFAULT_FONT, fill: colour, size: size, weight: weight, anchor: anchor, leading: leading })
             maxwidth = Math.max(txtWordObj.length(),maxwidth)
             txtWordObj.remove()
             //if(maxwidth > (width * MAX_TEXT_PANEL_RATIO)){
             //    return true
             //}
           }

           txtLineObj = root.drawSVG.text(txtLine + spacer + spaceArr[j]).font( {family:  DEFAULT_FONT, fill: colour, size: size, weight: weight, anchor: anchor, leading: leading })
           if(txtLineObj.length() > width )
           {
             lines.push(txtLine.trim() + '\n')
             txtLine = spaceArr[j] + spacer
             lastWidth = 0
           }
           else {
             lastValidWidth = txtLineObj.length()
             txtLine += spaceArr[j] + spacer
             lastLetterCount = txtLine.length
           }
           maxwidth = Math.max(lastWidth, maxwidth)
           txtLineObj.remove()
        }
        lines.push(txtLine.trim())
        lines.push('\n')
      }

      var panelTextLines = lines.join('')
      txtLineObj.remove()
      txtLineObj = root.drawSVG.text(panelTextLines).font( {family:  DEFAULT_FONT, fill: colour, size: size, weight: weight, anchor: anchor, leading: leading  })

       //return {'textObject' : ]txtLineObj, 'maxWidth' : maxwidth}
       return [txtLineObj,maxwidth]
    }

    var calcTextToPanelSize = function(textIn, panelwidth, panelHeight, weight, size, anchor, leading)
    {
      /*
      rtnData['plaintext'] = panelTextLines;
      rtnData['maxwidth'] = maxwidth;
      rtnData['lineheight'] = (txtLineObj.cy() - txtLineObj.y()) * 2;
      */
         var textLineObjsArr = calcTextForSize(textIn, panelwidth, panelHeight, weight, size, anchor, leading)
         var textLinesHeight = textLineObjsArr['lineheight'];
         var textLinesWidth = textLineObjsArr['maxwidth'];
         var origSize = size
         while( (textLinesHeight > panelHeight) || (textLinesWidth > panelwidth) )
         {
           origSize -= 1
           textLineObjsArr[0].remove()
           textLineObjsArr =  calcTextForSize(textIn, panelwidth, panelHeight,  weight, origSize, anchor, leading)
           textLinesHeight = textLineObjsArr['lineheight'];
           textLinesWidth = textLineObjsArr['maxwidth'];

           test1 = (textLinesHeight > panelHeight)
           test2 = (textLinesWidth > panelwidth)

         }

         return textLineObjs
    }

    var calcTextForSize = function(textIn, width, height,  weight, size, anchor, leading = 1.5)
    {

     var inText = textIn.replace(/(?:\r\n|\r|\n)/g, '\n');
     tspanText = inText.split( "\n" )

      var maxPanel = 0
      var txtLineObj;
      var txtLine = ""
      var lines = []
      var spacer = ' '
      var maxwidth = 0;
      var lastWidth = 0;
      var lastLetterCount = 0


      for(var i = 0; i < tspanText.length; i++)
      {
        var spaceArr = tspanText[i].split(/ +/)
        txtLine = ''

        for(var j = 0; j < spaceArr.length; j++)
        {
           if(spaceArr[j].length > lastLetterCount - 2)
           {
             //potentially a long word so might have to scale
             txtWordObj = root.drawSVG.text(spaceArr[j]).font( {family:  DEFAULT_FONT, size: size, weight: weight, anchor: anchor, leading: leading })
             maxwidth = Math.max(txtWordObj.length(),maxwidth)
             txtWordObj.remove()
             //if(maxwidth > (width * MAX_TEXT_PANEL_RATIO)){
             //    return true
             //}
           }

           txtLineObj = root.drawSVG.text(txtLine + spacer + spaceArr[j]).font( {family:  DEFAULT_FONT, size: size, weight: weight, anchor: anchor, leading: leading })
           if(txtLineObj.length() > width )
           {
             lines.push(txtLine.trim() + '\n')
             txtLine = spaceArr[j] + spacer
             lastWidth = 0
           }
           else {
             lastValidWidth = txtLineObj.length()
             txtLine += spaceArr[j] + spacer
             lastLetterCount = txtLine.length
           }
           maxwidth = Math.max(lastWidth, maxwidth)
           txtLineObj.remove()
        }
        lines.push(txtLine.trim())
        lines.push('\n')
      }

      var panelTextLines = lines.join('')


       //return {'textObject' : ]txtLineObj, 'maxWidth' : maxwidth}
       var panelTextLines = lines.join('')
       txtLineObj.remove()
       txtLineObj = root.drawSVG.text(panelTextLines).font( {family:  DEFAULT_FONT, fill: colour, size: size, weight: weight, anchor: anchor, leading: leading  })

       var rtnData = [];
       rtnData['plaintext'] = panelTextLines;
       rtnData['maxwidth'] = maxwidth;
       rtnData['lineheight'] = (txtLineObj.cy() - txtLineObj.y()) * 2;


       return rtnData;
    }



     var setTextLineOrigin = function(newTextPanelLines, textPanelInfo) {
       var newTextArr = [];
    //   var panelHeight = textFrame.height()

       //var panelY = textFrame.y()
       var lineHeight = 0;
       var previousYBottom = 0;
       var lineSpacing = 0;
       var newY = 0;
       var textLineOffset = 0
       var newyOffset = 0
       var previousYBottom = 0


       var textLinesTotalHeight = getTotalLineHeight(newTextPanelLines);

       var frameTopY = textPanelInfo.origin[1] + textPanelInfo.margin['top'];  //top of panel
       var frameBottomY = (textPanelInfo.origin[1] + textPanelInfo.height) - textPanelInfo.margin['bottom'];    //bottom of panel
       previousYBottom = frameTopY
       nextYTop = frameBottomY

       newTextPanelLines.forEach(function(lineItem, lineIndex){
          lineHeight = (lineItem.cy() - lineItem.y())*2

          newY = textPanelInfo.textLines[lineIndex].y + textPanelInfo.textLines[lineIndex].yOffset + textLineOffset   //apply te movement
          if(newY == 0)   //very first black
          {
            newY = textPanelInfo.origin[1] + ((textPanelInfo.height - lineHeight)/ 2)  //center in the txt panel
          }

          //see if there is another textline below and if so get the topY for this
          if(lineIndex < (newTextPanelLines.length-1))
          {
            nextYTop = textPanelInfo.textLines[lineIndex + 1].y;   //the next block down
          }
          if(lineIndex == newTextPanelLines.length - 1)  // last block
          {
            nextYTop = frameBottomY
          }
          if(textPanelInfo.textLines[lineIndex].yOffset > 0) { //moving down
            if( (newY > (nextYTop - lineHeight - textLineOffset )) )   //see if we are trying to move up into an existing text block
            {
                newY = nextYTop - textLineOffset - lineHeight
            }
          }
          else if (textPanelInfo.textLines[lineIndex].yOffset < 0) {  //moving up
            if( newY  <  previousYBottom )   //se if we trying to go down onto and existing tet block
            {
              //only move it to the closest place
              newY = previousYBottom + textLineOffset
            }
          }

          lineItem.y(newY)
          previousYBottom = lineHeight + newY ;

       })

      return newTextPanelLines;
     }

     var setTextInitialOrigin = function(textPanelLines, textPanelInfo, textFrame) {
        //this is the case when the x
        var newTextArr = [];
        var panelHeight = textFrame.height()

        var lineHeight = 0;
        var lineSpacing = 0;
        var panelY = textFrame.y()

        var textLinesTotalHeight = getTotalLineHeight(textPanelLines);
        var textLineY = panelY + (panelHeight*MAX_TEXT_PANEL_RATIO - textLinesTotalHeight) / 2;

        textPanelLines.forEach(function(lineItem, lineIndex){
           lineItem.y(textLineY)
           textLineY += lineSpacing + (lineItem.cy() - lineItem.y())*2

        })

       return textPanelLines;


     }



     var getTotalLineHeight = function(textPanelLines)
     {
       var totalLineHeight = 0

       textPanelLines.forEach(function(lineItem, lineIndex){
      //   if(lineItem.text.length <= 0)
      //    return true
          totalLineHeight += (lineItem.cy() - lineItem.y()) * 2;
       })

       return totalLineHeight;
     }

     var getTotalBlockHeight = function(textBlocks)
     {
        var totalHeight = 0
        textBlocks.forEach(function(item){

           totalHeight += item.blockHeight
        })
        return totalHeight
     }

     var getTotalTextBlockHeight = function(textBlocks)
     {
        var totalHeight = 0
        var objectCount = textBlocks.length;

        var topY = textBlocks[0].y();
        var bottomY = textBlocks[objectCount-1].y() + (textBlocks[objectCount-1].cy() - textBlocks[objectCount-1].y())*2
        totalHeight = bottomY - topY;

      /*  textBlocks.forEach(function(item){

           totalHeight += (item.cy() - item.y())*2
        })*/
        return totalHeight
     }

     var setTextLinesOld = function(textPanelLines, textFrame)
     {
       var panelWidth = textFrame.width()
       var panelHeight = textFrame.height()

       var textlines = textPanelLines.length

       var textRatio = textLineRatios(textPanelLines)

       //text panel for the whole section
       var panelCX = textFrame.cx()
       var panelCY = textFrame.cy()
       var panelX = textFrame.x()
       var panelY = textFrame.y()

       var textAddedArr = []
       var textLinesTotalHeight = 0;

       textPanelLines.forEach(function(lineItem, lineIndex){
            var panelHeightRatio = panelHeight * (lineItem.size / textRatio)
            var textAdded =  scaleTexttoPanelSize(lineItem.text, panelWidth, panelHeightRatio, lineItem.colour, lineItem.weight, lineItem.size, lineItem.anchor);
            var fontSize = textAdded.attr('size');
            lineItem.size = fontSize;
            console.log('font size:'+fontSize)

            switch(lineItem.anchor){
              case 'start' :
              textAdded.x(panelX + panelWidth*(1-MAX_TEXT_PANEL_RATIO))
               break
              case 'middle' :
                textAdded.x(panelX + panelWidth/2)
                break
              case 'end' :

               textAdded.x(panelX + (panelWidth*MAX_TEXT_PANEL_RATIO))
                 break
            }

            var newPanelHeight = (textAdded.cy() - textAdded.y()) * 2
            textAdded.y(textLinesTotalHeight)
            textLinesTotalHeight += newPanelHeight
            textAddedArr.push(textAdded)

       })

       var textLineOffset = (panelHeight - textLinesTotalHeight) / 2;

       var panelHeightBound = panelHeight*(1-MAX_TEXT_PANEL_RATIO)/2;

       var previousBounds = [panelY + panelHeightBound, (panelY + panelHeight) - panelHeightBound];
       textAddedArr.forEach(function(lineItemMove, lineItemMoveIndex){
         //check that moving it doesn't take it outside the bounds of the panel or over the top of another textline
         //panel bounds
         var tmp = lineItemMove.y() + textPanelLines[lineItemMoveIndex].topMargin + panelY + ((lineItemMove.cy() - lineItemMove.y())*2);
         var movedY = lineItemMove.y() + textPanelLines[lineItemMoveIndex].topMargin + panelY + textLineOffset;
         var lineHeight = (lineItemMove.cy() - lineItemMove.y())*2

         if(lineItemMoveIndex + 1 < textAddedArr.length )
         {
           var nextLineBounds = textAddedArr[lineItemMoveIndex + 1].y();
        //   previousBounds[1] = nextLineBounds +  panelY;
         }

         currentYBottom = Math.min(movedY + lineHeight, previousBounds[1] - lineHeight)
         currentYTop = Math.max(movedY, previousBounds[0])

         if((currentYTop ) > currentYBottom) {
           currentY = currentYBottom
         }
         else {
           currentY = currentYTop
         }
         //is there another line to check

         lineItemMove.y(currentY)
         previousBounds[0] = currentY + ((lineItemMove.cy() - lineItemMove.y())*2)
         previousBounds[1] = (panelY + panelHeight) - panelHeightBound

//         var currentY = lineItemMove.y() + textPanelLines[lineItemMoveIndex].topMargin

       })

       return textAddedArr

     }




     var getTextPanelHeight = function(textObj)
     {
        return (textObj.cy() - textObj.y()) * 2

     }

     var getTextPanelWidth = function(textObj)
     {
       console.log('x pos - ' + textObj.x())
       console.log('cx pos - ' + textObj.cx())
       console.log('length - ' + textObj.length())
       console.log('obj - ' + textObj)


     }


     var textLineRatios = function(textLines)
     {
       var totalSize = 0
       textLines.forEach(function(item){
         totalSize += item.blockHeight
       })
       return totalSize
     }

     var textLineRatiosFont = function(textLines)
     {
       var totalSize = 0
       textLines.forEach(function(item){
         totalSize += item.size
       })
       return totalSize
     }


     /****** - SIZING GUIDES - NOT USED FOR SVG REMDERING    */

     var drawSizing = function()
     {
       //used to add the measurements

       sizingGuide = root.drawSVG.group().id('measurements');

       drawVerticalSizing()
       drawVHorizonatlSizing()

     }


     var alignSign = function(addMeasurements = true, addFrame = true, scaleSign = true)
      {

        completeSign = root.drawSVG.group().id('complete');

        completeSign.add(signFrameDraw)

        if(signBorderDraw)
         completeSign.add(signBorderDraw)

       if(signPanelDraw)
        completeSign.add(signPanelDraw)

        if(symbolPanel)
        completeSign.add(symbolPanel)

        if(textFrameGroup)
         completeSign.add(textFrameGroup)

       if(symbolFrameGroup)
        completeSign.add(symbolFrameGroup)

      if(thumbFrame)
         completeSign.add(thumbFrame)


      if(thumbBorder)
        completeSign.add(thumbBorder)

    if(DEBUG_TEXT_BOXES){
      //  textDebug.remove();
      //  textDebugArr.forEach(function(textDebugBoxitem) {
    //      textDebug.add(textDebugBoxitem)
    //    })
        completeSign.add(textDebug)

    }




        var x = (vars.drawingWidth - vars.signWidth) / 2
        var y = (vars.drawingHeight - vars.signHeight) / 2


        completeSign.move(x, y)

        //scale the image
        if(scaleSign) {
          var scaleFactor =  Math.min((vars.drawingWidth / vars.signWidth ) , (vars.drawingHeight / vars.signHeight)) * SCALE_MAX_DRAW
        }
        else {
          var scaleFactor = 1;
        }
       completeSign.scale(scaleFactor,scaleFactor)

       if(thumbFrame)
       {
         thumbBorder.stroke({ width: 1, color: 'black'})
       }


         //draw the outer frame with nice pixel border
         var newWidth = vars.signWidth * scaleFactor
         var newHeight = vars.signHeight * scaleFactor
         var newX = (vars.drawingWidth - newWidth) / 2
         var newY = (vars.drawingHeight - newHeight) / 2

        if(addFrame)
        {
          signFrameDrawSolid = root.drawSVG.rect(newWidth,newHeight).fill('none').stroke({ width: 0.5, color: 'black'}).move(newX, newY).id('signFrameDrawArea')
        }
        else {
          signFrameDrawSolid = root.drawSVG.rect(newWidth,newHeight).fill('none').stroke({ width: 0, color: 'none'}).move(newX, newY).id('signFrameDrawArea')
        }

      if(addMeasurements){
         signFrameDraw.stroke({ width: 0, color: 'black' })

         signFrameDraw.filter(function(add) {
           var blur = add.offset(4, 4).in(add.sourceAlpha).gaussianBlur(4)
           add.blend(add.source, blur)
           this.size('200%','200%').move('-50%', '-50%')
         })
       }

      }

     var drawVerticalSizing = function()
     {

       var posX = eval(signFrameDrawSolid.x()) + MEASUREMENT_OFFSET + signFrameDrawSolid.width()
       var posY = eval(signFrameDrawSolid.y())

       var totalLength = signFrameDrawSolid.height()


         sizingGuide.add(root.drawSVG.line(posX, posY, posX + MEASURELINE_END,  posY).stroke({ width: 1 }))
         sizingGuide.add(root.drawSVG.line(posX + MEASURELINE_END/2, posY, posX + MEASURELINE_END/2,  posY + totalLength).stroke({ width: 1 }))
         sizingGuide.add(root.drawSVG.line(posX, posY  + totalLength , posX + MEASURELINE_END,  posY + totalLength).stroke({ width: 1 }))

         var txtVert = root.drawSVG.text(vars.signHeight + 'mm')
         txtVert.font({family:'Arial', size: 10})
         var fontlength = txtVert.length()

         txtVert.move((posX + MEASURELINE_END/2) - (MEASUREMENT_OFFSET) + 2, posY + ((totalLength - fontlength) /  2))
         txtVert.transform({ rotation: -90 })
         sizingGuide.add(txtVert)




     }

     var drawVHorizonatlSizing = function()
     {
         var posX = signFrameDrawSolid.x()
         var posY = eval(signFrameDrawSolid.y()) + MEASUREMENT_OFFSET + signFrameDrawSolid.height()
         var totalLength = signFrameDrawSolid.width()

         sizingGuide.add(root.drawSVG.line(posX, posY, posX ,  posY + MEASURELINE_END).stroke({ width: 1 }))
         sizingGuide.add(root.drawSVG.line(posX , posY + MEASURELINE_END/2 , posX + totalLength,  posY + MEASURELINE_END/2).stroke({ width: 1 }))
         sizingGuide.add(root.drawSVG.line(posX + totalLength, posY , posX  + totalLength ,  posY  + MEASURELINE_END).stroke({ width: 1 }))

         var txtHoriz = root.drawSVG.text(vars.signWidth + 'mm')
         txtHoriz.font({family:'Arial', size: 10})
         var fontlength = txtHoriz.length()
         txtHoriz.move((posX + (totalLength - fontlength) /  2) , (posY + MEASURELINE_END/2)  + 2)
         sizingGuide.add(txtHoriz)

     }





    this.construct(drawObject, options);


    this.exportToSVGThumb = function(thumbWidth, thumbHeight)
    {

      return this.drawSVG.svg();



      var thumbsign = completeSign.svg();


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

      var SVGOut = '<svg id="SVGThumb" width="'+vars.signWidth+'" height="'+vars.signHeight+'" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs">';
      SVGOut += thumbsign;
      SVGOut += '</svg>';

      return SVGOut;
    }

}

//document.createElementNS("http://www.w3.org/2000/svg", 'svg')
//this.node.setAttribute('class','app-svg-symbol')
