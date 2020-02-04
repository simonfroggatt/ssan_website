var bespokeSign = function(drawObject, options) {
  /*
     * Variables accessible
     * in the class
     */

     var SCALE_MAX_PANEL = .9
     var BORDER_RATIO = 0.04
     var MARGIN_RATIO = 0.02
     var SYMBOL_TEXT_RATIO = 0.5
     var RADIUS_RATIO = 0.75
     var BORDER_RADIUS = 0.00

     var autoIgnore = {
       borderSize: true,
       borderRadius: false
     }

  var vars = {

    drawingWidth: 500,
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
    symbolContainerMargin: {left: 0, right: 0, top: 0, bottom: 0},

  }

   this.drawSVG
   this.drawFrame
   this.signBox
   this.signPanel
   this.symbolContainer
   this.symbolgroup
   this.textContainter
   this.textGroup


   var root = this

   /*
    * Constructor
    */
   this.construct = function(drawObject, options){
       this.drawSVG = SVG(drawObject).size(vars.drawingWidth, vars.drawingHeight)
       this.drawFrame = root.drawSVG.rect(drawwidth,drawheight).fill('none').stroke({ width: 1 })
       $.extend(vars , options)
    //   console.log(vars)
   };

   /*
    * Public method
    */
   this.drawSign = function(ignoreAuto){

     $.extend(autoIgnore, ignoreAuto)
     initDimensions()
     drawSignBox()
     drawSignPanel()

     if(vars.hasSymbol)
       drawSynbols()

     drawTextPanels()
    // alignSign();
   };

   this.setSize = function(newWidth, newHeight){
     vars.signWidth = newWidth
     vars.signHeight = newHeight
  //   drawSign()
   }

   this.setBorderStatus = function(hasBorderChanged, hasRadiusChanged){
     vars.hasBorder = hasBorderChanged
     if(hasRadiusChanged) {
       vars.signPanel.borderRadius = BORDER_RADIUS;
     }
     else {
       vars.signPanel.borderRadius = 0;
     }

   }

   this.clearSign = function(){
     this.signBox.remove()
     this.signPanel.remove()
     this.symbolContainer.remove()
     this.symbolgroup.remove()
     this.textContainter.remove()
     this.textGroup.remove()
   }

   this.setSymbol = function(imageInfo, imagePosition = 0,  clear = false)
   {
        if(clear)
        {
            vars.symbols = []
        }
        vars.symbols[imagePosition] = imageInfo

        console.log(vars.symbols)
   }

   this.removeSymbol = function(symbolPosition)
   {
     console.log('before remove'+ vars.symbols)
     vars.symbols.splice(symbolPosition,1)
     console.log('after remove' + vars.symbols)
   }

   this.exportSVG = function() {
  //   console.log(root.drawSVG.svg());
    // root.signBox.size(vars.signWidth, vars.signHeight).fill('none').stroke({width: 0})
     return root.drawSVG.svg()
   }

   /* private functions */

   var initDimensions = function ()
   {
     if(vars.autoSize)
     {

       var minborder = Math.ceil(Math.max(vars.signWidth, vars.signWidth) * BORDER_RATIO)
       var marginCalc = Math.ceil(Math.max(vars.signWidth, vars.signWidth) * MARGIN_RATIO)
       BORDER_RADIUS = minborder*RADIUS_RATIO

       if(!autoIgnore.borderRSize)
         vars.signPanel.borderSize = minborder

      if(!autoIgnore.borderRadius)
          vars.signPanel.borderRadius = BORDER_RADIUS

       vars.textPanelSpacer = minborder
       vars.textContainerMargin.left = marginCalc
       vars.textContainerMargin.right = marginCalc
       vars.textContainerMargin.top = 0//marginCalc  - need to change this to look at the symbol position
       vars.textContainerMargin.bottom = marginCalc

       vars.symbolSpace = minborder
       vars.symbolContainerMargin.left = marginCalc
       vars.symbolContainerMargin.right = marginCalc
       vars.symbolContainerMargin.top = marginCalc
       vars.symbolContainerMargin.bottom = marginCalc





       vars.symbolContainerHeight = vars.signHeight * SYMBOL_TEXT_RATIO

     }
   }

   var drawSignBox = function(){
     root.signBox = root.drawSVG.rect(vars.signWidth,vars.signHeight).fill('none').stroke({ width: 1 })
   }

   var drawSignPanel = function()
   {
     //signPanel: {colour: 'yellow', borderSize: 0, borderRadius: 0, borderColour: 'black'},
     var panelWidth = 0;
     var panelHeight = 0;

     if(vars.signPanel.borderSize > 0 && vars.hasBorder)
     {

       var panelWidth = vars.signWidth  - vars.signPanel.borderSize*2
       var panelHeight = vars.signHeight  - vars.signPanel.borderSize*2
       root.signBox.fill(vars.signPanel.borderColour)
       if(vars.signPanel.borderRadius > 0)
       {
          root.signPanel = drawCorneredRectangle([vars.signPanel.borderSize,vars.signPanel.borderSize], panelWidth, panelHeight, vars.signPanel.borderRadius, [1,1,1,1],vars.signPanel.colour,0)
       }
       else {

         root.signPanel = root.drawSVG.rect(panelWidth,panelHeight).fill(vars.signPanel.colour).stroke({ width: 0 }).move(vars.signPanel.borderSize,vars.signPanel.borderSize)
       }

     }
     else {
       panelWidth = vars.signWidth
       panelHeight = vars.signHeight
         root.signPanel = root.drawSVG.rect(panelWidth,panelHeight).fill(vars.signPanel.colour).stroke({ width: 0 })
     }
   }

   var drawTextPanels = function() {
     //  {color: 'yellow', panelRadius: 0, panelCorner: [0,0,0,0], height: 200}
     var xpos = 0
     var ypos = 0

     var textSpacing = vars.textPanelSpacer
     var textContainterWidth  = 0
     var textContainterHeight  = 0
     var textPanelWidth = 0
     var textPanelHeight = 0
     root.textGroup = root.drawSVG.group()  //create a new group for manipulation

     if(vars.orientation == 0){

       textContainterWidth  = root.signPanel.width() - (vars.textContainerMargin.left + vars.textContainerMargin.right)
       textContainterHeight  = root.signPanel.height() -  (vars.symbolContainerHeight + vars.textContainerMargin.top + vars.textContainerMargin.bottom)

       root.textContainter = root.drawSVG.rect(root.signPanel.width(),root.signPanel.height() -  vars.symbolContainerHeight).fill('none').stroke({ width: 0, color: 'blue' })
       root.textGroup.add(root.textContainter)

       textPanelWidth = textContainterWidth
       xpos = vars.textContainerMargin.left
       ypos = vars.textContainerMargin.top

       var panelScaling = calcTextPanelHeightScale( textContainterHeight, textSpacing, vars.textPanels)

       vars.textPanels.forEach(function(item,index){
         if(item.panelRadius > 0 )
         {
            root.textGroup.add( drawCorneredRectangle([xpos,ypos], textPanelWidth, item.height*panelScaling, item.panelRadius, item.panelCorner,item.colour,1))
         }
         else {
           root.textGroup.add(root.drawSVG.rect(textPanelWidth,item.height*panelScaling).fill(item.colour).stroke({ width: 1 }).move(xpos,ypos))
         }
         ypos += (item.height * panelScaling) + textSpacing

       })

       var xposC = root.signPanel.x()
       var yposC = root.signPanel.y() + vars.symbolContainerHeight
       root.textGroup.move(xposC, yposC)
     }




     var symbolGroupHeight = 0

   }

   var calcTextPanelHeightScale = function(panelSize, spacingSize, panels) {
     var totalPanelHeight = 0
     panels.forEach(function(item,index){
       totalPanelHeight += item.height
     })
     totalPanelHeight += (spacingSize *  (panels.length - 1))
     return panelSize / totalPanelHeight
   }


   var calcBorderSize = function() {
      var newBoardSize  = 0;
      //need to do something with min / max width height percentage
   }

   var drawSynbols = function(){

     var rawSvg = '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100.07 88.07"><defs><style>.cls-1,.cls-2{stroke:#000;stroke-width:0.07px;}.cls-1,.cls-2,.cls-3,.cls-4{stroke-miterlimit:2.61;}.cls-2{fill:#f3c736;}.cls-3,.cls-4{stroke:#f3c736;}.cls-3{stroke-width:0.82px;}.cls-4{stroke-width:1.38px;}</style></defs><title>W0012</title><polygon class="cls-1" points="99.64 83.66 52.55 1.5 52.24 1.06 51.88 0.73 51.48 0.45 51.02 0.23 50.55 0.07 50.03 0.04 49.52 0.07 49.02 0.23 48.59 0.45 48.16 0.73 47.83 1.06 47.53 1.5 0.45 83.66 0.21 84.14 0.07 84.61 0.04 85.11 0.07 85.63 0.21 86.14 0.45 86.58 0.72 87.02 1.05 87.34 1.49 87.64 1.93 87.86 2.44 88 2.94 88.03 97.14 88.03 97.64 88 98.11 87.86 98.58 87.64 98.98 87.34 99.34 87.02 99.64 86.58 99.86 86.14 100 85.63 100.03 85.11 100 84.61 99.86 84.14 99.64 83.66 99.64 83.66"/><polygon class="cls-2" points="50.03 9.21 91.77 82.02 8.31 82.02 50.03 9.21 50.03 9.21"/><path class="cls-3" d="M50,76.84a5.25,5.25,0,1,0-5.23-5.27v0A5.24,5.24,0,0,0,50,76.84Z" transform="translate(0.01 0.01)"/><path class="cls-4" d="M50,26.78c4.17,0,8,3.83,7.56,7.61L54,60.8c-.35,2.31-1.78,4-4,4s-3.63-1.69-4-4L42.49,34.39C42,30.63,45.87,26.78,50,26.78Z" transform="translate(0.01 0.01)"/></svg>'
     //symbolContainerMargin: {left: 5, right: 5, top: 5, bottom: 5},
     var xpos = 0
     var ypos = 0

     var symbolScale = 1
     var symbolWidthScale = 1
     var symbolHeightScale = 1
     var symbolSpacing = vars.symbolSpace

    //   symbolSpacing = 0

     if(vars.orientation == 0) {

       var symbolPanelWidth = root.signPanel.width() - (vars.symbolContainerMargin.left + vars.symbolContainerMargin.right)
       var symbolPanelHeight = vars.symbolContainerHeight - (vars.symbolContainerMargin.top + vars.symbolContainerMargin.bottom)

       var symbolGroupHeight = 0

       root.symbolgroup = root.drawSVG.group()  //create a new group for manipulation

       root.symbolContainer = root.drawSVG.rect(root.signPanel.width(),vars.symbolContainerHeight).fill('none').stroke({ width: 0 })

       root.symbolgroup.add(root.symbolContainer)

       var symbolHeight = symbolPanelHeight //set the default max height for a single symbol
       var spacingExtra = (vars.symbols.length - 1)*symbolSpacing
       var symbolContainerHeightBoxWidth = calcMaxSymbolHeight(symbolHeight) //calculate the width that symbol would be when scalled the symbal panel height


       if(symbolContainerHeightBoxWidth + spacingExtra > symbolPanelWidth) {    //if the box is too big with min spacing then scale it
        symbolWidthScale = ((symbolPanelWidth - spacingExtra) / symbolContainerHeightBoxWidth)  //new scaling factor for ALL symbol with spacing added

        symbolSpacing = (symbolPanelWidth - symbolContainerHeightBoxWidth*symbolWidthScale)/(vars.symbols.length+1)
      //  xpos = (symbolSpacing/2) //set the start off set
      //  xpos += vars.symbolContainerMargin.left
        }

        else {  //the maxwidth for the symbols is less than the required width...lets space them equally

          symbolSpacing = (symbolPanelWidth - symbolContainerHeightBoxWidth)/(vars.symbols.length+1)

        //  xpos = vars.symbolContainerMargin.left + (symbolSpacing/2) //set the start off set
        }

        //ypos = vars.symbolContainerMargin.top
        xpos = symbolSpacing
        vars.symbols.forEach(function(item,index){

          var symbolHeightScale = symbolPanelHeight / item.symbolHeight

          symbolScale = symbolHeightScale*symbolWidthScale
      //    svg1 = draw.svg(item.symbolPath)
      //    root.symbolgroup.add(svg1)
      //    svg1.move(xpos, ypos)
          //root.symbolgroup.add(draw.svg('<g><rect width="100" height="50" fill="#f06"></rect></g>', item.symbolWidth*symbolScale,item.symbolHeight*symbolScale).move(xpos, ypos))
      //    root.symbolgroup.add(root.drawSVG.rect( item.symbolWidth*symbolScale,item.symbolHeight*symbolScale).fill('green').move(xpos, ypos))
          root.symbolgroup.add(root.drawSVG.image(item.symbolPath, item.symbolWidth*symbolScale,item.symbolHeight*symbolScale).move(xpos, ypos))
          symbolGroupHeight = Math.max(item.symbolHeight*symbolScale, symbolGroupHeight)
          xpos += symbolSpacing + item.symbolWidth*symbolScale
        })

        var xposC = root.signPanel.x() + vars.symbolContainerMargin.left
        var yposC = root.signPanel.y() + vars.symbolContainerMargin.top


        root.symbolgroup.move(xposC, yposC)

        root.symbolContainer.height(symbolGroupHeight + vars.symbolContainerMargin.top + vars.symbolContainerMargin.bottom)
        vars.symbolContainerWidth = root.symbolContainer.width()
        vars.symbolContainerHeight = root.symbolContainer.height()

       }

   }

   var calcMaxSymbolHeight = function(symbolHeightIn) {
     var overAllWidth = 0
     var scaleHeight = 1
     //console.log('symbolHeightIn '+symbolHeightIn)
     vars.symbols.forEach(function(item){
        scaleHeight = symbolHeightIn / item.symbolHeight
        //console.log('scaleHeight for ' + item.symbolPath + ' ' + scaleHeight)
        overAllWidth += (item.symbolWidth * scaleHeight)

     })

     return overAllWidth
   }

   var calcMaxSymbolWidth = function(symbolWidthIn, symbolSpacing) {
     var overAllHeight = 0
     var scaleHWidth = 1
     vars.symbols.forEach(function(item){
        scaleHWidth = symbolWidthIn / item.symbolWidth
        overAllHeight += (item.symbolWidth * scaleHeight)
     })
     if(symbolSpacing > 0)
        overAllHeight += (vars.symbols.length - 1)*symbolSpacing
     return overAllHeight
   }

   /*drawing tools */
   var drawCorneredRectangle = function(origin, width, height, rsize, radius, fillColour = 'yellow', strokeWidth = 0)
   //radius is array [topleft, topright, bottomleft, bottomright]
   {
     var pathstr = ''
     var originX = origin[0]
     var originY = origin[1]

     pathstr += 'M' + (originX + radius[0]*rsize) + ','+(originY)

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

     return root.drawSVG.path(pathstr).fill(fillColour).stroke({ width: strokeWidth })

   }

   var calcSignWidth = function(){
     //given the orientation and symbol width calculate the width of the sign
     var newWidth = vars.signWidth
     if(vars.hasBorder){
       if(vars.orientation == 1) {
         if(vars.hasSymbol)
           newWidth = vars.signWidth - (3*vars.borderSize) - vars.symbolWidth
         else
           newWidth = vars.signWidth - (2*vars.borderSize)
       }
       else {
         newWidth = vars.signWidth - (2*vars.borderSize)
       }
     }

     return newWidth
   }

   var calcSignHeight = function(){
     //given the orientation and symbol height calculate the height of the sign
     var newHeight = vars.signHeight
     if(vars.hasBorder){
       if(vars.orientation == 0) {
         if(vars.hasSymbol)
           newHeight = vars.signHeight - (3*vars.borderSize) - vars.symbolHeight
         else
           newHeight = vars.signHeight - (2*vars.borderSize)
       }
       else {
         newHeight = vars.signHeight - (2*vars.borderSize)
       }
     }

     return newHeight
   }

   var setMaxSymbolHeight = function() {
     var newMaxHeight = vars.signHeight
     if(vars.hasBorder){
       newMaxHeight -= 2*vars.borderSize
     }

     vars.symbolHeight = newMaxHeight
     vars.symbolWidth = vars.symbolHeight / vars.symbolWHRatio
   }

   var setMaxSymbolWidth = function() {
     var newMaxWidth = vars.signWidth
     if(vars.hasBorder){
       newMaxWidth -= 2*vars.borderSize
     }

     vars.symbolWidth = newMaxWidth
     vars.symbolHeight = vars.symbolWidth * vars.symbolWHRatio
   }


   var alignSign = function()
   {
     var grp = root.drawSVG.group();
     grp.add(root.signBox)
     grp.add(root.textPanel)
     grp.add(root.symbolBox)

     var x = (vars.drawingWidth - vars.signWidth) / 2
     var y = (vars.drawingHeight - vars.signHeight) / 2
     grp.move(x, y)

     //scale the image
     var scaleFactor =  Math.min((vars.drawingWidth / vars.signWidth ) , (vars.drawingHeight / vars.signHeight)) * vars.scaleMaxDrawPanel
     grp.scale(scaleFactor,scaleFactor)
   }


   /*
    * Pass options when class instantiated
    */
   this.construct(drawObject, options);
}
