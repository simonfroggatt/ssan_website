/*!
* bespokesign.js - library for creating bespoke signs.
* Uses the svg.js library
* @version 1.0
*
*
* @copyright Total safety Group <www.totalsafetygroup.co.uk>
*
*
* BUILT: 01/07/2019
*/
;
var DEBUG_MODE = true;

/**
 *
 * @param svgVars
 * @param signVars
 * @param signLayoutVars
 * @param signAutoVars
 * @param signSectionsVars
 * @constructor
 */
var BespokeSign = function(svgVars, signLayoutVars, signAutoVars) {

    /**
     *
     * @type {BespokeSign}
     *
     */
    var drawSVG, SIGN;

    /**
     * defines the size of the drawing / preview area on the page
     * @type {{drawObj: string, width: number, units: string, height: number}}
     */
    var SVGDRAWINGVARS = {
        width: 500,
        height: 500,
        units: 'px',
        drawObj : ''
    };


    /**
     * variable array acting as a constant
     * define the constants we have determined make a sign look good
     * @type {{MIN_TEXTPANEL_WIDTH: number, MIN_SYMBOL_HEIGHT: number, MEASURELINE_END: number, MIN_SYMBOL_WIDTH: number, MEASUREMENT_OFFSET: number, MIN_FONT_SIZE: number, MIN_TEXTPANEL_HEIGHT: number, SCALE_MAX_DRAW: number, PANEL_RATIO: number, MARGIN_RATIO: number, MAX_TEXT_PANEL_RATIO: number, FONT_HEIGHT_RATIO: number, BORDER_RATIO: number}}
     */
    var SIGNCONSTS = {
        SCALE_MAX_DRAW: 0.8,
        MEASUREMENT_OFFSET: 10,
        MEASURELINE_END: 20,
        FONT_HEIGHT_RATIO: 0.1,
        MAX_TEXT_PANEL_RATIO: 0.95,
        BORDER_RATIO: 0.04,
        PADDING_RATIO: 0.04,
        PANEL_RATIO: 0.04,
        RADIUS_RATIO: 0.75,
        SECTION_SPACING: 0.04
    };


    /**
     * auto calculate certain aspects of the sign unless set to false
     * @type {{borderRadius: boolean, symbolSizing: boolean, textPanelMargin: boolean, borderSize: boolean, panelSize: boolean, textBlockMargin: boolean, sectionBlockSpacing: boolean}}
     */
    var SIGNAUTO = {
        borderSize: false,
        borderRadius: false,
        symbolSizing: true,
        panelSize: true,
        textPanelMargin: true,
        textBlockMargin: true,
        sectionBlockSpacing: true
    };

    /**
     *
     * @type {{symbolSpace: number, sectionOrientation: number, signPanel: {padding: {top: number, left: number, bottom: number, right: number}, colour: string}, sectionCount: number, width: number, sectionSpace: number, backgroundColour: string, signBorder: {colour: string, borderRadius: number, borderSize: number}, autosize: boolean, height: number}}
     */
    var SIGNLAYOUT = {

        autosize: true,
        // orientation: 0,   //0 - portrait, 1 - landscape
        width: 0,
        height: 0,
        backgroundColour: '#FFFFFF',

        symbolSpace: 0,     //min space between multiple symbols.
        sectionOrientation: 0,
        sectionSpace: 0,    //min space between sign sections

        signBorder: {colour: 'black', borderSize: 0, borderRadius: 0},      //outer border for the entire sign
        signPanel: {colour: 'white', padding: {top: 0, right: 0, bottom: 0, left: 0} },   //sign panel for the complete sign - panels sit within this seciton

        section_layout : [],
        section_data: []

    }



    var mainSign = {
            frame: {},  //outer frame of the sign - not actually rendered
            border: {},
            signPanel: {},
            layoutDivs: [],
            bespokeSections : []
        }

    ;

    var signSectionLayout;


    var signSectionFrame;  /**  outer sign frame including the border if there is one  **/

    var rawSignSection;  /** raw json for initialisation **/

    /**
     *
     * @type {BespokeSign}
     */
    SIGN = this;


    /**
     *
      * @param svgOptions
     * @param signOptions
     * @param signLayoutOptions
     * @param signAutoOptions
     * @param signSectionOptions
     */
    this.construct = function(svgOptions, signLayoutOptions, signAutoOptions) {
        $.extend(SVGDRAWINGVARS, svgOptions);
        $.extend(SIGNLAYOUT, signLayoutOptions);
        $.extend(SIGNAUTO, signAutoOptions);

        //drawSVG = SVG(SVGDRAWINGVARS.drawObj).size(SVGDRAWINGVARS.width, SVGDRAWINGVARS.height);
        drawSVG = SVG().addTo(SVGDRAWINGVARS.drawObj).size(SVGDRAWINGVARS.width, SVGDRAWINGVARS.height);


        _setupSign();


      //  _createSectionFrame();  /** calcs the outer frame and border if there is one **/

        /*
        createSignFrame();
   createSignPanel();

   createSignSymbols();


   createTextFrame();
         */

    };

    this.addSection = function(parentID = '', sectionData, positionID = -1) {
        let position_index,
            working_section,
            section_count,
            working_section_id

        if(parentID != '') { //going in as a child
            working_section = _getSectionByID(parentID, SIGNLAYOUT.section_layout.sections)
        }
        else {
            working_section = SIGNLAYOUT.section_layout.sections
        }

        sectionData['id'] = _getNextSectionID(working_section)

        if(positionID >= 0) {
            SIGNLAYOUT.section_layout.sections.splice(positionID, 0, sectionData)
        }
        else {
            SIGNLAYOUT.section_layout.sections.push(sectionData)
        }

        _createAllSectionLayout();

        return sectionData['id'];


    }
        /*
        tmpLayoutDiv = _getLayoutDivByID(mainSign.layoutDivs, bespokeSectionValue.sectionID);
            if(tmpLayoutDiv !== undefined) {
                bespokeSectionsVars = {};
                bespokeSectionsVars.width = tmpLayoutDiv.width;
                bespokeSectionsVars.height = tmpLayoutDiv.height;
                bespokeSectionsVars.x = tmpLayoutDiv.x;
                bespokeSectionsVars.y = tmpLayoutDiv.y;
                newBespokeSection = new BespokeSignSection(drawSVG,bespokeSectionValue,bespokeSectionsVars);

            }
         */

    /**
     * The initial setup of variables, frame and border for the MAIN sign
     * @private
     */
    function _setupSign(){

        _setupDefaults();  // calc all the defaults for the call looking sign!!!

        _drawSVGFrame();    //the outer SVG from for visuals

        _drawBorder();      //the border and and frame of the actual signs

        _createSignPanel(); //create the sign panel that will house all the bespoke sections - taking into account for the border and radius corders if there are any

        _createAllSectionLayout(); //create all the sections of the sign for the bespoke sign to sit in

        _createSections();

  //      _calcSections();    //calculate the sections t
    };

/****   CONSTRUCTION FUNCTIONS  ****/

/****   PUBLIC  ****/

/****   PRIVATE ****/

    /**
     *
     * @private
     */
    function _setupDefaults() {
        if(SIGNLAYOUT.autosize === true)
        {

            let minborder = Math.ceil(Math.max(SIGNLAYOUT.width, SIGNLAYOUT.height) * SIGNCONSTS.BORDER_RATIO);
            let paddingCalc = Math.ceil(Math.max(SIGNLAYOUT.width, SIGNLAYOUT.height) * SIGNCONSTS.PADDING_RATIO);


            if(SIGNAUTO.borderSize === true) {
                SIGNLAYOUT.signBorder.borderSize = minborder
            }

            if(SIGNAUTO.borderRadius === true){
                SIGNLAYOUT.signBorder.borderRadius =  minborder*SIGNCONSTS.RADIUS_RATIO;
            }

            if(SIGNAUTO.sectionBlockSpacing === true) {
                SIGNLAYOUT.sectionSpace = Math.ceil(Math.max(SIGNLAYOUT.width, SIGNLAYOUT.height) * SIGNCONSTS.SECTION_SPACING);
            }
            if(SIGNAUTO.panelSize === true) {
                SIGNLAYOUT.signPanel.padding.top = SIGNLAYOUT.signPanel.padding.right = SIGNLAYOUT.signPanel.padding.bottom = SIGNLAYOUT.signPanel.padding.left = paddingCalc;

            }
        }
        else{
            //TODO - something in here for if autosize is set to false
        }
    }

    /**
     * Create the invisible frame that all the sections will fit within.
     * We need to take into account the border and if it has radius corners
     *
     * @private
     */
    function _createSignPanel() {
        mainSign.signPanel.width = mainSign.border.width - (SIGNLAYOUT.signPanel.padding.left + SIGNLAYOUT.signPanel.padding.right);
        mainSign.signPanel.height = mainSign.border.height - (SIGNLAYOUT.signPanel.padding.top + SIGNLAYOUT.signPanel.padding.bottom);;
        mainSign.signPanel.x = mainSign.border.x + SIGNLAYOUT.signPanel.padding.left;
        mainSign.signPanel.y = mainSign.border.y + SIGNLAYOUT.signPanel.padding.top;

        //TODO - check if the arc touches the signPanel and if so make it smaller
      /*  if (SIGNLAYOUT.signBorder.borderRadius > 0) {
            mainSign.signPanel.width -= SIGNLAYOUT.signBorder.borderRadius;
            mainSign.signPanel.height -= SIGNLAYOUT.signBorder.borderRadius;
            mainSign.signPanel.x += (SIGNLAYOUT.signBorder.borderRadius/2);
            mainSign.signPanel.y += (SIGNLAYOUT.signBorder.borderRadius/2);
        }*/

        if(DEBUG_MODE === true){
            mainSign.signPanel.svgElement = _drawRectangle(drawSVG,mainSign.signPanel.x,mainSign.signPanel.y, mainSign.signPanel.width, mainSign.signPanel.height, 'none', '#ff0f23', 1, '_debug_signPanel');   // fill with sign colour

        }
      //  mainSign.border.

        //mainSign.signPanel
    }

    /**
     * @description - Takes the layout object and divides the sign up into the appropriate sections
     * @private
     */
    function _createAllSectionLayout() {

        var layoutSection,
            lastX,
            lastY;


        lastX = mainSign.signPanel.x;
        lastY = mainSign.signPanel.y;

        mainSign.layoutDivs =  _createSectionLayout(SIGNLAYOUT.section_layout.sections,lastX, lastY,mainSign.signPanel.width, mainSign.signPanel.height);

    }

    function _createSectionLayout(varSections, lastX, lastY, widthIn, heightIn) {
        var layoutSection,
            sectionLayoutRatioSum,
            sectionLayoutatioNormalise,
            sectionCount,
            tmpLayoutDiv,
            calcSectionHeight,
            calcSectionWidth,
            layoutSectionsRtn;

        layoutSectionsRtn = [];
        layoutSection = varSections;

        sectionLayoutRatioSum = 0;
        sectionLayoutatioNormalise = 1;

        sectionCount = layoutSection.length;
        layoutSection.forEach(function(sectionObject) {
            sectionLayoutRatioSum += sectionObject.ratio;
        });


        if(sectionLayoutRatioSum > 1) {
            sectionLayoutatioNormalise = 1 / sectionLayoutRatioSum;
        }


        calcSectionHeight = heightIn - ( (sectionCount - 1) * SIGNLAYOUT.sectionSpace);
        calcSectionWidth = widthIn - ( (sectionCount - 1) * SIGNLAYOUT.sectionSpace);


        layoutSection.forEach(function (layoutSectionValue) {
            tmpLayoutDiv = {};
            tmpLayoutDiv.id = layoutSectionValue.id;
            tmpLayoutDiv.orientation = layoutSectionValue.orientation;

            if(layoutSectionValue.orientation === 0){   //top down
                tmpLayoutDiv.height = (layoutSectionValue.ratio * sectionLayoutatioNormalise * calcSectionHeight);
                tmpLayoutDiv.width =  widthIn;
                tmpLayoutDiv.x = lastX;
                tmpLayoutDiv.y = lastY;

                lastY += tmpLayoutDiv.height + SIGNLAYOUT.sectionSpace;


            }
            else{
                tmpLayoutDiv.width = (layoutSectionValue.ratio * sectionLayoutatioNormalise * calcSectionWidth);
                tmpLayoutDiv.height = heightIn;
                tmpLayoutDiv.x = lastX;
                tmpLayoutDiv.y = lastY;

                lastX += tmpLayoutDiv.width + SIGNLAYOUT.sectionSpace;

            }

            if(DEBUG_MODE) {
                var debugID = '_debug_div_' + tmpLayoutDiv.id;
                var fillcolour;
                fillcolour= '#24f0ff';
                if(layoutSectionValue.children !== undefined) {
                    fillcolour= 'none';
                }

                mainSign.signPanel.svgElement = _drawRectangle(drawSVG, tmpLayoutDiv.x, tmpLayoutDiv.y, tmpLayoutDiv.width, tmpLayoutDiv.height, fillcolour, '#3546ff', 1, debugID);   // fill with sign colour
            }



            if(layoutSectionValue.children !== undefined) {
                tmpLayoutDiv.children = _createSectionLayout(layoutSectionValue.children.sections, tmpLayoutDiv.x, tmpLayoutDiv.y, tmpLayoutDiv.width, tmpLayoutDiv.height);
            }
            layoutSectionsRtn.push(tmpLayoutDiv);


        });

        return layoutSectionsRtn;

    }

    /**
     * @description - for each section we setup the bespokeSection Object class
     * @private
     */
    function _createSections() {
        var newBespokeSection,
            tmpLayoutDiv,
            bespokeSectionsVars;
        SIGNLAYOUT.section_data.forEach(function (bespokeSectionValue) {
            tmpLayoutDiv = _getLayoutDivByID(mainSign.layoutDivs, bespokeSectionValue.sectionID);
            if(tmpLayoutDiv !== undefined) {
                bespokeSectionsVars = {};
                bespokeSectionsVars.width = tmpLayoutDiv.width;
                bespokeSectionsVars.height = tmpLayoutDiv.height;
                bespokeSectionsVars.x = tmpLayoutDiv.x;
                bespokeSectionsVars.y = tmpLayoutDiv.y;
                newBespokeSection = new BespokeSignSection(drawSVG,bespokeSectionValue,bespokeSectionsVars);

            }

          //  mainSign.bespokeSection.push(newBespokeSection);
        })

    }

    /**
     *
     * @param layoutDivID - String
     * @private
     */
    function _getLayoutDivByID(varLayoutDiv, layoutDivID){
        var rtnDiv;
        varLayoutDiv.forEach(function (divValue) {
            if(divValue.children !== undefined){
                rtnDiv =  _getLayoutDivByID(divValue.children, layoutDivID)
            }
            if(divValue.id === layoutDivID) {
                rtnDiv = divValue;
            }
        })
        return rtnDiv;

    }

    /**
     *
     * @description - give the section id, return the section arr or false
     * @param varSectionID
     * @param varSectionArr
     * @private
     */
    function _getSectionByID(varSectionID, varSectionArr) {
        varSectionArr.forEach(function (varSection) {
            if(varSection['id'] === varSectionID) {
                return varSection;
            }
            else{
                if(varSection.children !== undefined) {
                    let child_section
                    child_section = _getSectionByID(varSectionID, varSection.sections)
                    if(child_section)
                        return child_section
                }
            }
        })
        return false
    }

    function _getNextSectionID(varSectionArr) {
        let max_id = 0;
        let new_id;
        varSectionArr.forEach(function (varSection) {
            let rev_id = varSection.id.split('_').reverse();
            if(parseInt(rev_id[0]) > max_id){
                max_id = parseInt(rev_id[0]);
            }
        })

        let new_id_arr = varSectionArr[0].id.split('_').reverse();
        new_id_arr[0] = max_id + 1;
        new_id = new_id_arr.join('_');
        return new_id

    }




/****   OUTSIGN - DRAWING FUNCTIONS   ****/

    function _drawSVGFrame() {
        drawSVG.rect(SVGDRAWINGVARS.width, SVGDRAWINGVARS.height).fill('none').stroke({width: 1, color: '#000000'}).id('drawingArea');
    }

    function _drawBorder() {

        if (SIGNLAYOUT.signBorder.borderSize > 0) {
            var borderOriginX,
                borderOriginY,
                borderWidth,
                borderHeight;

            borderOriginX = SIGNLAYOUT.signBorder.borderSize
            borderOriginY = SIGNLAYOUT.signBorder.borderSize;


            borderWidth = SIGNLAYOUT.width - 2 * SIGNLAYOUT.signBorder.borderSize;
            borderHeight = SIGNLAYOUT.height - 2 * SIGNLAYOUT.signBorder.borderSize;


            mainSign.frame.svgElement = _drawRectangle(drawSVG,0,0, SIGNLAYOUT.width, SIGNLAYOUT.height, SIGNLAYOUT.signBorder.colour, '#FFFFFF', 0, 'signFrame'); //fill with the sign colour
            mainSign.frame.width = SIGNLAYOUT.width;
            mainSign.frame.height = SIGNLAYOUT.height;
            mainSign.frame.x = 0;
            mainSign.frame.y = 0;

            mainSign.border.svgElement = _drawCorneredRectangle(drawSVG, borderOriginX, borderOriginY, borderWidth, borderHeight, SIGNLAYOUT.signBorder.borderRadius, [1,1,1,1], SIGNLAYOUT.backgroundColour, 'none', 0, 'signBorder');  //fill with border colour
            mainSign.border.width = borderWidth;
            mainSign.border.height = borderHeight;
            mainSign.border.x = borderOriginX;
            mainSign.border.y = borderOriginY;

        } else {

            mainSign.frame.svgElement  = _drawRectangle(drawSVG,0,0, SIGNLAYOUT.width, SIGNLAYOUT.height, SIGNLAYOUT.backgroundColour, '#FFFFFF', 0, 'signFrame');   // fill with sign colour
            mainSign.frame.height = SIGNLAYOUT.height;
            mainSign.frame.width = SIGNLAYOUT.width;
            mainSign.frame.x = 0;
            mainSign.frame.y = 0;

            mainSign.border.svgElement  = _drawRectangle(drawSVG, 0,0, SIGNLAYOUT.width, SIGNLAYOUT.height, 'none', '#000000', 1, 'signBorder');  //no fill as just a place holder
            mainSign.border.width = SIGNLAYOUT.width;
            mainSign.border.height = SIGNLAYOUT.height;
            mainSign.border.x = 0;
            mainSign.border.y = 0;
        }
    }


    SIGN.construct(svgVars, signLayoutVars, signAutoVars);
};









/*************************          SIGN SECTIONS           ********
 *
 * A sign section is tasked with holding and creating a bespoke section.
 * Current types:
 *  Single section with 1 symbol and 1 text block
 *  Single section with 1 symbol and multi text block
 *
 *  Single section with multi symbol and 1 text block
 *  Single section with multi symbol and multi text block
 *
 *  Multi section made up of any combination of the above
 *
 *
 *  Each section is independent of the others and know nothing about the other sections
 *
 */

/**
 * @description object class for the sign sections
 * @param svgDrawObjVar
 * @param bespokeSectionVars
 * @param sectionLayoutVars
 * @constructor
 */
var BespokeSignSection = function(svgDrawObjVar, bespokeSectionVars, sectionLayoutVars) {

    /**
     *
     * @type {BespokeSign}
     *
     */
    var  SECTION, svgDrawObj;


    /**
     *
     * @type {{PANEL_RATIO: number, MIN_SYMBOLFRAME_HEIGHT: number, MAX_TEXT_PANEL_RATIO: number, MIN_TEXTFRAME_HEIGHT: number, MIN_SYMBOLFRAME_WIDTH: number, FONT_HEIGHT_RATIO: number, BORDER_RATIO: number, PADDING_RATIO: number, RADIUS_RATIO: number, SYMBOL_TEXT_RATIO: number, MIN_TEXTFRAMEL_WIDTH: number, TEXT_BLOCK_MARGIN: number}}
     */
    var SECTION_CONSTS = {
        MIN_TEXTFRAME_HEIGHT: 0.25,
        MIN_TEXTFRAMEL_WIDTH: 0.25,
        MIN_SYMBOLFRAME_HEIGHT: 0.25,
        MIN_SYMBOLFRAME_WIDTH: 0.25,
        FONT_HEIGHT_RATIO: 0.1,
        MAX_TEXT_PANEL_RATIO: 0.95,
        BORDER_RATIO: 0.04,
        PADDING_RATIO: 0.04,
        PANEL_RATIO: 0.04,
        RADIUS_RATIO: 0.75,
        SYMBOL_TEXT_RATIO: 0.3,
        TEXT_BLOCK_MARGIN: 0.02
    };

    /**
     *
     * @type {{FONT_WEIGHT: string, FONT: string}}
     */
    var SECTION_DEFAULTS = {
        FONT: 'Arial',
        FONT_WEIGHT: 'bold'
    };

    /**
     *
     * @type {{marginSize: boolean, borderRadius: boolean, symbolSizing: boolean, textPanelMargin: boolean, borderSize: boolean, textBlockMargin: boolean}}
     */
    var SECTION_AUTO = {
        borderSize: false,
        borderRadius: false,
        symbolSizing: false,
        paddingSize: false,
        textPanelMargin: false,
        textBlockMargin: true,
        sectionBlockSpacing: true
    };


    var SECTION_VARS = {
        sectionID: '',
        autosize: true,
        sectionOrientation: 0,
        width: 0,
        height: 0,
        backgroundColour: 'none',
       // borderRadius: 0,    //radius of the solid border
        x: 0,
        y: 0,
       // symbolFrameToTextFrameSpacer: 0,

        sectionBorder: {colour: 'none', borderSize: 0, borderRadius: 0},      //outer border for this section
        sectionPadding: {top: 0, right: 0, bottom: 0 , left: 0},

        symbols: [], //the raw symbols passed in on creation
        textPanels: [],  //raw text panels passed in on creation

        symbolFrame: {
            minWidth: 20,
            minHeight: 20,
            width: 0,
            height: 0
        },

        textFrame: {
            minWidth: 20,
            minHeight: 20,
            width: 0,
            height: 0
        },
        symbolTextSpacing: 10,

/*        colourPanels: {},
        textPanels: {},
        textBlocks: {},

        signTextFrame: {}*/
    };


    /**
     * @description - this is the render SVG object along. Manipulation of the bespoke sign is done via the SECTION_VARS and re-rendered.
     * @type {{border: {}, subframe: {}, textFrame: {x: number, width: number, y: number, height: number}, symbolFrame: {x: number, width: number, y: number, height: number}, frame: {}}}
     */
    var bespokeSection = {
        frame : {}, //outer frame - used for colouring
        border: {}, //border
        subframe: {}, //the subframe that the text and symbols fit within
        symbolFrame: {
            x: 0,
            y: 0,
            width: 0,
            height : 0
        },
        textFrame: {
            x: 0,
            y: 0,
            width: 0,
            height : 0
        }
    }

    SECTION = this;

    this.construct = function (svgDrawObjVar, sectionVars, sectionLayoutVars) {
        svgDrawObj = svgDrawObjVar;
        $.extend(SECTION_VARS, sectionVars);
        $.extend(SECTION_VARS, sectionLayoutVars);


        _setupSectionDefaults();
        _createSectionFramework();
        _createSymbolTextLayout();


        return SECTION;

    };

    function _setupSectionDefaults() {
        if(SECTION_VARS.autosize === true)
        {

            var minborder = Math.ceil(Math.max(SECTION_VARS.width, SECTION_VARS.height) * SECTION_CONSTS.BORDER_RATIO);
            var paddingCalc = Math.ceil(Math.max(SECTION_VARS.width, SECTION_VARS.height) * SECTION_CONSTS.PADDING_RATIO);


            if(SECTION_AUTO.borderSize === true) {
                SECTION_VARS.sectionBorder.borderSize = minborder*SECTION_CONSTS.RADIUS_RATIO;
            }
            if(SECTION_AUTO.borderRadius === true){
                SECTION_VARS.sectionBorder.borderRadius = SECTION_VARS.borderRadius;
            }
            if(SECTION_AUTO.sectionBlockSpacing === true) {
                SECTION_VARS.sectionSpace = Math.ceil(Math.max(SECTION_VARS.width, SECTION_VARS.height) * SECTION_CONSTS.SECTION_SPACING);
            }
            if(SECTION_AUTO.paddingSize === true) {
                SECTION_VARS.sectionPadding.top = SECTION_VARS.sectionPadding.right = SECTION_VARS.sectionPadding.bottom = SECTION_VARS.sectionPadding.left = paddingCalc;
            }
            if(SECTION_AUTO.symbolSizing === true){
                switch(SECTION_VARS.sectionOrientation){
                    case 0:
                        SECTION_VARS.symbolFrame.minHeight = SECTION_CONSTS.MIN_SYMBOLFRAME_HEIGHT * SECTION_VARS.height;
                        SECTION_VARS.symbolFrame.height = Math.max(SECTION_CONSTS.SYMBOL_TEXT_RATIO * SECTION_VARS.height, SECTION_VARS.symbolFrame.minHeight);
                        SECTION_VARS.symbolFrame.minWidth = 0;
                        SECTION_VARS.symbolFrame.width = SECTION_VARS.width;
                        break;
                    case 1:
                        SECTION_VARS.symbolFrame.minWidth = SECTION_CONSTS.MIN_SYMBOLFRAME_HEIGHT * SECTION_VARS.width;
                        SECTION_VARS.symbolFrame.width = Math.max(SECTION_CONSTS.SYMBOL_TEXT_RATIO * SECTION_VARS.width,SECTION_VARS.symbolFrame.minWidth);
                        SECTION_VARS.symbolFrame.minHeight = 0;
                        SECTION_VARS.symbolFrame.height = SECTION_VARS.height;

                        break;
                }
                SECTION_VARS.symbolTextSpacing = minborder;
               // SYMBOL_TEXT_RATIO
            }


        }
        else{
            //TODO - something in here for if autosize is set to false
        }
    }

    function _createSectionFramework() {


        bespokeSection.frame.width = SECTION_VARS.width - (SECTION_VARS.sectionPadding.left + SECTION_VARS.sectionPadding.right);
        bespokeSection.frame.height = SECTION_VARS.height - (SECTION_VARS.sectionPadding.top + SECTION_VARS.sectionPadding.bottom);
        bespokeSection.frame.x = SECTION_VARS.x + SECTION_VARS.sectionPadding.left;
        bespokeSection.frame.y = SECTION_VARS.y + SECTION_VARS.sectionPadding.top;

        bespokeSection.border.width = bespokeSection.frame.width - (SECTION_VARS.sectionBorder.borderSize * 2);
        bespokeSection.border.height = bespokeSection.frame.height - (SECTION_VARS.sectionBorder.borderSize * 2);
        bespokeSection.border.x = bespokeSection.frame.x + SECTION_VARS.sectionBorder.borderSize;
        bespokeSection.border.y = bespokeSection.frame.y + SECTION_VARS.sectionBorder.borderSize;

        if (SECTION_VARS.sectionBorder.borderRadius > 0) {
            bespokeSection.subframe.width = bespokeSection.border.width - SECTION_VARS.sectionBorder.borderRadius;
            bespokeSection.subframe.height = bespokeSection.border.width - SECTION_VARS.sectionBorder.borderRadius;
            bespokeSection.subframe.x = bespokeSection.frame.x + (SECTION_VARS.sectionBorder / 2);
            bespokeSection.subframe.y = bespokeSection.frame.y + (SECTION_VARS.sectionBorder / 2);

        } else {
            bespokeSection.subframe.width = bespokeSection.border.width;
            bespokeSection.subframe.height = bespokeSection.border.height;
            bespokeSection.subframe.x = bespokeSection.frame.x;
            bespokeSection.subframe.y = bespokeSection.frame.y;
        }

        if (SECTION_VARS.sectionBorder.borderSize > 0) {
            bespokeSection.frame.svgElement = _drawRectangle(svgDrawObj, bespokeSection.frame.x, bespokeSection.frame.y, bespokeSection.frame.width, bespokeSection.frame.height, SECTION_VARS.sectionBorder.colour, 'none', 0, 'bespokeSectionFrame_' + SECTION_VARS.sectionID);// fill with sign colour
            bespokeSection.border.svgElement = _drawCorneredRectangle(svgDrawObj, bespokeSection.border.x, bespokeSection.border.y, bespokeSection.border.width, bespokeSection.border.height, SECTION_VARS.sectionBorder.borderRadius, [1, 1, 1, 1], SECTION_VARS.backgroundColour, 'none', 0, 'bespokeSectionBorder_' + SECTION_VARS.sectionID);  //fill with border colour
        } else {
            if(SECTION_VARS.sectionBorder.borderRadius > 0){
                bespokeSection.frame.svgElement = _drawCorneredRectangle(svgDrawObj, bespokeSection.frame.x, bespokeSection.frame.y, bespokeSection.frame.width, bespokeSection.frame.height, SECTION_VARS.sectionBorder.borderRadius, [1, 1, 1, 1] , 'none', 'none', 0, 'bespokeSectionFrame_' + SECTION_VARS.sectionID);// fill with sign colour
                bespokeSection.border.svgElement = _drawCorneredRectangle(svgDrawObj, bespokeSection.border.x, bespokeSection.border.y, bespokeSection.border.width, bespokeSection.border.height, SECTION_VARS.sectionBorder.borderRadius, [1, 1, 1, 1], SECTION_VARS.backgroundColour, 'none', 0, 'bespokeSectionBorder_' + SECTION_VARS.sectionID);  //fill with border colour
            }
            else{
                bespokeSection.frame.svgElement = _drawRectangle(svgDrawObj, bespokeSection.frame.x, bespokeSection.frame.y, bespokeSection.frame.width, bespokeSection.frame.height,'none' , 'none', 0, 'bespokeSectionFrame_' + SECTION_VARS.sectionID);// fill with sign colour
                bespokeSection.border.svgElement = _drawRectangle(svgDrawObj, bespokeSection.border.x, bespokeSection.border.y, bespokeSection.border.width, bespokeSection.border.height, SECTION_VARS.backgroundColour, 'none', 0, 'bespokeSectionBorder_' + SECTION_VARS.sectionID);   // fill with sign colour
            }
         }

        if (DEBUG_MODE) {
            bespokeSection.subframe.svgElement = _drawRectangle(svgDrawObj, bespokeSection.subframe.x, bespokeSection.subframe.y, bespokeSection.subframe.width, bespokeSection.subframe.height, 'none', '#ffd821', 1, '_debug_signSectionSubframe_' + SECTION_VARS.sectionID);   // fill with sign colour
        }

    }

    /**
     * @description - create the symbol frame and the text panel frames
     * @private
     */
    function _createSymbolTextLayout(){
       // var;
        switch(SECTION_VARS.sectionOrientation){
            case 0:
                bespokeSection.symbolFrame.height = Math.max(SECTION_CONSTS.SYMBOL_TEXT_RATIO * bespokeSection.subframe.height, SECTION_VARS.symbolFrame.minHeight);
                bespokeSection.symbolFrame.width = bespokeSection.subframe.width;
                bespokeSection.symbolFrame.x = bespokeSection.subframe.x;
                bespokeSection.symbolFrame.y = bespokeSection.subframe.y;
                break;
            case 1:
                bespokeSection.symbolFrame.height = bespokeSection.subframe.height;
                bespokeSection.symbolFrame.width = Maths.max(SECTION_CONSTS.SYMBOL_TEXT_RATIO * bespokeSection.subframe.width,SECTION_VARS.symbolFrame.minWidth);
                bespokeSection.symbolFrame.x = bespokeSection.subframe.x;
                bespokeSection.symbolFrame.y = bespokeSection.subframe.y;
                break;
        }
        _createSymbolFrame();
        _createTextFrame();
    }

    function _createSymbolFrame(){
        var symbolframe = new SymbolFrame(svgDrawObj,bespokeSection.symbolFrame.width, bespokeSection.symbolFrame.height, bespokeSection.symbolFrame.x, bespokeSection.symbolFrame.y, SECTION_VARS.symbols, SECTION_VARS.sectionID );
        //bespokeSection.symbolFrame
    }

    function _createTextFrame(){
       // bespokeSection.textFrame
    }

    SECTION.construct(svgDrawObjVar, bespokeSectionVars, sectionLayoutVars); //drawSVG,bespokeSectionValue,bespokeSectionsVars
};




/****   DRAWING FUNCTIONS   ****/

/****   PUBLIC  ****/

/****   PRIVATE ****/

/**** finaly call to create the object ****/


/**
 *
 * @param svgDrawObjVar
 * @param widthInit
 * @param heightInit
 * @param xInit
 * @param yInit
 * @param symbolsInit
 * @param sectionID
 * @constructor
 */
var SymbolFrame = function(svgDrawObjVar, widthInit, heightInit, xInit, yInit, symbolsInit, sectionID){

    var SYMBOLFRAME_CONST = {
        MIN_SYMBOL_HEIGHT: 0.25,
        MIN_SYMBOL_WIDTH: 0.25
    };

    var SYMBOLFRAME_VARS = {
        minSymbolWidth : 0,
        minSymbolHeight : 0,
        symbolSpace : 0,
        symbolOrientation : 0,
        parentFrameID : '',
        symbols : []   //this will be an array of symbol object
    }


    /*  NOT SURE IF WE WILL NEED THESE YET
        padding = [],    //padding - top, right, bottom, left.  Used for padding around symbol INSIDE the frame
        margin = [],    //padding - top, right, bottom, left. Used for margin to reduce the */

    var symbolFrame = {
        width: 0,
        height: 0,
        x: 0,
        y:0
    }

    var svgDrawObj;

    SYMBOLFRAME = this;



/****   SYMBOL FRAME - CONSTRUCTION FUNCTIONS  ****/

/****   SYMBOL FRAME - PUBLIC  ****/

    /**
     *
     * @param symbolData - The details of the symbol being added
     * @param position - Index position of the symbol from 0.  Either left to right or top to bottom
     */
    var replaceSymbol = function(symbolData, position){

    };

/****   SYMBOL FRAME - PRIVATE ****/


    /**
     *
     * @param svgDrawObjVar
     * @param widthConstruct
     * @param heightConstruct
     * @param originX
     * @param originY
     * @param symbolsConstruct
     * @param parentSectionID
     */
    this.construct = function(svgDrawObjVar, widthConstruct, heightConstruct, originX, originY, symbolsConstruct, parentSectionID){
        symbolFrame.width = widthConstruct;
        symbolFrame.height = heightConstruct;
        symbolFrame.x = originX;
        symbolFrame.y = originY;
        SYMBOLFRAME_VARS.symbols = symbolsConstruct;
        SYMBOLFRAME_VARS.parentFrameID = parentSectionID;

        _setupDefaults();
        __createFrameToSize(symbolFrame.width, symbolFrame.height,symbolFrame.x,symbolFrame.y,  SYMBOLFRAME_VARS.symbols);

    };

    /**
     *
     * @param symbolData - The details of the symbol being added
     */
    function __addSymbolToFrame(symbolData){

    };



    /**
     * @description - given the variables, create the symbol frame and symbol positions for this frames symbols
     * @param widthIn
     * @param heightIn
     * @param originX
     * @param originY
     */
    function __createFrameToSize(widthIn, heightIn, originX, originY) {
        let symbolFrameWidth,
            symbolFrameHeight,
            symbolPanelX,
            symbolPanelY,
            spacingExtra,
            symbolScale,
            symbolWidthScale,
            symbolHeightScale,
            symbolSpacing,
            symbolContainerMaxWidthFromBox,
            symbolContainerMaxHeightFromBox,
            symbolMaxHeight,
            maxSymbolHeight;


        symbolFrameWidth = Math.max(widthIn, SYMBOLFRAME_VARS.minSymbolWidth);
        symbolFrameHeight = Math.max(heightIn, SYMBOLFRAME_VARS.minSymbolHeight);  //Math.min(100, Math.max(0, $number));
        symbolPanelX = originX;
        symbolPanelY = originY;
        spacingExtra = (SYMBOLFRAME_VARS.symbols.length - 1)*SYMBOLFRAME_VARS.symbolSpace;   //TODO - pass through the padding for the section


        symbolScale = 1;
        symbolWidthScale = 1;
        symbolHeightScale = 1;

        symbolSpacing = 0;

        if(SYMBOLFRAME_VARS.symbolOrientation === 0){
            symbolFrameWidth = widthIn;// - 2 * vars.symbolSpace
            symbolContainerMaxWidthFromBox = _calcMaxSymbolWidthFromFrameHeight(symbolFrameHeight);   //this is the width of all the symbols if scalled to the selected symbol height


            if(symbolContainerMaxWidthFromBox + spacingExtra > widthIn) {    //if the box is too big with min spacing then scale it
                symbolWidthScale = ((widthIn - spacingExtra) / symbolContainerMaxWidthFromBox);  //new scaling factor for ALL symbol with spacing added
                symbolSpacing = Math.round((widthIn - (symbolContainerMaxWidthFromBox*symbolWidthScale))/(SYMBOLFRAME_VARS.symbols.length+1));
            }
            else {  //the maxwidth for the symbols is less than the required width...lets space them equally
                //check that size is not smaller than the allowed symbol height

                symbolSpacing = Math.round((symbolFrameWidth - symbolContainerMaxWidthFromBox)/(SYMBOLFRAME_VARS.symbols.length+1));
            }

            //caluclaute the max height that the symbols can be for a the sign frame width  -
            //symbolContainerMaxWidthFromBox + spacingExtra is the width of all the symbols with min spacing

            //symbolMaxHeight = Math.round((widthIn / (symbolContainerMaxWidthFromBox + spacingExtra)) * symbolFrameHeight);
           // var textPanelMinHeight = signPanel.height - (minTextPanelHeight + vars.symbolTextFrameSpacer);

           // maxSymbolHeight = Math.min(heightIn, symbolMaxHeight);
            //minTextPanelHeight + vars.symbolTextFrameSpacer
            //we need to take into account when the sign is landcape, but the symbol is Portrait
            //need a minimum text panel size to be used


            symbolScale = symbolHeightScale*symbolWidthScale;

           // setSymbolDetails(vars.orientation, symbolFrameHeight, symbolScale, symbolSpacing, [symbolPanelX, symbolPanelY]);
        } else {
            symbolFrameHeight = heightIn;
            symbolContainerMaxHeightFromBox = _calcMaxSymbolHeightFromFrameWidth(symbolFrameWidth);

            if(symbolContainerMaxHeightFromBox + spacingExtra > heightIn) {    //if the box is too big with min spacing then scale it
                symbolHeightScale = ((heightIn - spacingExtra) / symbolContainerMaxHeightFromBox);  //new scaling factor for ALL symbol with spacing added
                symbolSpacing = (heightIn - symbolContainerMaxHeightFromBox*symbolHeightScale)/(SYMBOLFRAME_VARS.symbols.length+1);
            }
            else {  //the maxwidth for the symbols is less than the required width...lets space them equally
                symbolSpacing = (symbolFrameHeight - symbolContainerMaxHeightFromBox)/(SYMBOLFRAME_VARS.symbols.length+1);
            }

            //TODO - add in the min max range for symbols when landscape
                    //  var symbolMaxWidthFromHeight = Math.round((signPanel.height / (symbolContainerMaxHeightFromBox + spacingExtra)) * symbolFrameWidth);
                    //  var textPanelMinWidth = signPanel.width - (minTextPanelWidth + vars.symbolTextFrameSpacer);
            maxSymbolWidth = Math.min(textPanelMinWidth, symbolMaxWidthFromHeight);

            symbolScale = symbolHeightScale*symbolHeightScale;


        }
        if(DEBUG_MODE === true){
       //     _drawRectangle(drawSVG,mainSign.signPanel.x,mainSign.signPanel.y, mainSign.signPanel.width, mainSign.signPanel.height, 'none', '#ff0f23', 1, '_debug_symbol');   // fill with sign colour

        }
    }

    function _setupDefaults(){
        SYMBOLFRAME_VARS.minSymbolWidth = symbolFrame.width * SYMBOLFRAME_CONST.MIN_SYMBOL_WIDTH;
        SYMBOLFRAME_VARS.minSymbolHeight = symbolFrame.height * SYMBOLFRAME_CONST.MIN_SYMBOL_HEIGHT;
    }

    function _calcMaxSymbolWidthFromFrameHeight(symbolHeightIn) {
        var overAllWidth,
            scaleHeight;

        overAllWidth= 0;
        scaleHeight = 1;

        //console.log('symbolHeightIn '+symbolHeightIn)
        SYMBOLFRAME_VARS.symbols.forEach(function(item){
            scaleHeight = symbolHeightIn / item.symbolHeight;
            overAllWidth += (item.symbolWidth * scaleHeight);

        });

        return overAllWidth;
    }


    function _calcMaxSymbolHeightFromFrameWidth(symbolWidthIn) {
        var overAllHeight,
            scaleWidth;

        overAllHeight = 0;
        scaleWidth = 1;

        SYMBOLFRAME_VARS.symbols.forEach(function(item){
            scaleWidth = symbolWidthIn / item.symbolWidth;
            overAllHeight += (item.symbolHeight * scaleHeight);
        });

        return overAllHeight;
    }


    function _createSymbols(symbolOrientation, sectionFrameWidth, sectionFrameHeight, symbolSpacing, symbolMaxSize, symbolScaling, originX, originY) {
        var symbolTemp,
            xPos,
            yPos,
            symbolScale,
            frameWidth,
            frameHeight,
            frameX,
            frameY,
            symbolFrameRtn


        xPos = originX;
        yPos = originY;
        symbolScale = 1;
        frameWidth = 0;
        frameHeight = 0;
        frameX = 0;
        frameY = 0;
        symbolFrameRtn = {};

        var signSymbols = [];

        SYMBOLFRAME_VARS.symbols.forEach(function(item,index){
            symbolTemp = new SymbolObj();
          //  symbolTemp.symbolPath = item.symbolPath;
            //symbolTemp.svgCode = item.svgCode;
           // symbolTemp.viewBox = item.viewBox;

            if(symbolOrientation === 0) {
                symbolScale = (symbolMaxSize/ item.symbolHeight) * symbolScaling;

                xPos += symbolSpacing;
                symbolTemp.height = item.symbolHeight * symbolScale;
                symbolTemp.width = item.symbolWidth * symbolScale;
                symbolTemp.x = xPos;
                symbolTemp.y = yPos;


                xPos += symbolTemp.width;

                frameHeight = Math.max(frameHeight,symbolTemp.height );
                frameWidth += symbolTemp.width;


                signSymbols.push(symbolTemp);

                symbolFrameRtn.width = frameWidth + (vars.symbols.length - 1) * symbolSpacing;
                symbolFrameRtn.height = frameHeight;
              //  symbolFrameRtn.x = [signSymbols[0].origin[0];
             //   symbolFrameRtn.y = originY;

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

    }

   // this.createSymbolFrame

    SYMBOLFRAME.construct(svgDrawObjVar, widthInit, heightInit, xInit, yInit, symbolsInit, sectionID);
 };


/**
 *
 * @constructor
 */
var SymbolObj = function(){

    var width,
        height,
        x,
        y,
        path,
        id,
        svgCode
}

/**
 *
 * @param drawObj
 * @param origin
 * @param width
 * @param height
 * @param rsize
 * @param radius
 * @param fillColour
 * @param strokeColour
 * @param strokeWidth
 * @param idText
 * @return {*}
 * @private
 */
_drawCorneredRectangle = function(drawObj, originX, originY, width, height, rsize, radius, fillColour, strokeColour, strokeWidth, idText) {
    //radius is array [topleft, topright, bottomleft, bottomright]

    //radius top, right, bottom, left
    var returnObject,
        pathstr = '';

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


    if (idText != '') {
        returnObject = drawObj.path(pathstr).fill(fillColour).stroke({
            width: strokeWidth,
            color: strokeColour
        }).id(idText);
    } else {
        returnObject = rdrawObj.path(pathstr).fill(fillColour).stroke({
            width: strokeWidth,
            color: strokeColour
        });
    }
    return returnObject;
};


/**
 *
 * @param drawObj
 * @param originX
 * @param originY
 * @param width
 * @param height
 * @param fillColour
 * @param strokeColour
 * @param strokeWidth
 * @param idText
 * @return {*}
 * @private
 */
_drawRectangle = function(drawObj, originX, originY, width, height, fillColour , strokeColour , strokeWidth , idText) {

    var rtnObj;

    if (idText != '') {
        rtnObj = drawObj.rect(width, height).fill(fillColour).stroke({
            width: strokeWidth,
            color: strokeColour
        }).move(originX, originY).id(idText);
    } else {
        rrtnObj = drawObj.rect(width, height).fill(fillColour).stroke({
            width: strokeWidth,
            color: strokeColour
        }).move(originX, originY);
    }

    return rtnObj;
};



/*
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

 */