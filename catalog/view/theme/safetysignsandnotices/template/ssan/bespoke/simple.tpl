<link href="catalog/view/theme/safetysignsandnotices/stylesheet/bespoke/stylesheet.css" rel="stylesheet" type="text/css">




<div class="col-sm-6">

  <div  id="bespokesigndiv"></div>
      <div  id="thumbdrawing" ></div>

</div>
<div class="col-sm-6">
  <div class="row">

<!-- start accordian -->
    <div class="panel-group" id="bespoke-accordian">

      <div class="panel panel-default">
        <div class="panel-heading">
          <h4 class="panel-title" id="size-chooser-header"><a data-toggle="collapse" data-parent="#bespoke-accordian" href="#collapseSizeMaterial"><?php echo $accordian_sizes; ?></a></h4>
        </div>
        <div id="collapseSizeMaterial" class="panel-collapse collapse in">
          <div class="panel-body">  <?php echo $prod_var_dropdown; ?></div>
        </div>
      </div>

      <div class="panel panel-default">
        <div class="panel-heading">
          <h4 class="panel-title" id="symbol-chooser-header"><a data-toggle="collapse" data-parent="#bespoke-accordian" href="#collapseSymbols"><?php echo $accordian_symbols; ?></a></h4>
        </div>
        <div id="collapseSymbols" class="panel-collapse collapse">  <div><?php echo $symbols; ?></div></div>
      </div>
      <div class="panel panel-default">
        <div class="panel-heading">
          <h4 class="panel-title"><a data-toggle="collapse" data-parent="#bespoke-accordian" href="#collapseText"><?php echo $accordian_text; ?></a></h4>
        </div>
        <div id="collapseText" class="panel-collapse collapse">  <div><?php echo $textareas; ?></div></div>
      </div>
    </div>

<!-- end accordian -->

<div class="row">
  <div class="col-sm-6 ">
  </div>

  <!-- start of options drop down -->
  <div class="col-sm-6 options_grey">


    <div class="form-group row">
      <label class="col-xs-4 col-form-label" for="pomaterial">Quantity</label>
      <div class="col-xs-8"><input name="qtyDropdown" id="qtyDropdown" class="form-control" type="number" min="1" value="1"></div>
    </div>
    <div class="form-group row">
      <div class="col-xs-4"><span class="h2">£</span><span id="priceDropDown" class="h2"></span><br><span class="pricetax" id="priceDropDownTax">(inc VAT £3.45)</span></div>
      <div class="col-xs-8">
        <?php if($bespokeid > 0) { ?>
          <button type="button" id="button-cart-dropdown" data-loading-text="loading..." class="btn btn-add-cart btn-lg btn-block" data-cart="add">Add as new</button>
          <button type="button" id="button-cart-dropdown" data-loading-text="loading..." class="btn btn-add-cart btn-lg btn-block" data-cart="updateBespoke">Update this sign</button>
        <?php } else { ?>

        <button type="button" id="button-cart-dropdown" data-loading-text="loading..." class="btn btn-add-cart btn-lg btn-block" data-cart="add">Add to Cart</button>
        <?php } ?>
      </div>
    </div>


  </div>








  </div>
</div>

</div>


<script>

    $(function() {

        var preview_vars = {
            width: 500,
            height: 500,
            units: 'px',
            drawObj : '#bespokesigndiv'
        };

        var sign_section_layout = {
            sectionCount: 1,
            sectionSpacing: 5,
            sections: [
                {
                    id: '1',
                    orientation: 0,
                    ratio: 1,
                }
            ],
        };

        var sign_sections = [];
        sign_sections[0] = {
            sectionID: '1',
            sectionOrientation: 0,
            symbolOrientation: 0,
           /*backgroundColour: 'red',
            sectionBorder: {
                colour: 'none',
                borderSize: 0, borderRadius: 10},
            */
           symbols : [
                {symbolPath: 'symbols/svg/p001.svg', symbolWidth: 100, symbolHeight: 100}
            ],
            textPanels: [
                {
                    colour: 'red',
                    baseTextColour: 'white',
                    panelRadius: 0,
                    panelCorner: [0,0,0,0],
                    sizeRatio: 100,
                    textLines: [
                        {
                            text: 'this is section 1',
                            colour: 'white',
                            weight: 'bold',
                            size: 20,
                            anchor: 'middle',
                            id: 0,
                            x: 100,
                            y: 200,
                            xOffset: 0,
                            yOffset: 0,
                            leading: 1.5,
                        }
                    ]
                }
            ]
        }


        var sign_layout = {
            //  autosize: true,
            orientation: 0,   //0 - portrait, 1 - landscape
            width: 300,
            height: 400,
            backgroundColour: 'yellow',
            //signBorder: {colour: 'black', borderSize: 10, borderRadius: 5},      //outer border for the entire sign
            //signPanel: {colour: 'white', padding: {top: 0, right: 0, bottom: 0, left: 0} },   //sign panel for the complete sign
            section_layout : sign_section_layout,
            section_data : sign_sections

        };


        var sign_autos = {
          //  borderSize : false,
           // borderRadius : false,
           // panelSize: false
           // sectionBlockSpacing : false
        }



        var bespokesigns = new BespokeSign(preview_vars, sign_layout, sign_autos);

        let new_section = {
             orientation: 0,
            ratio: 1,
            sectionsign: []
        }

//        bespokesigns.addSection('',new_section)



    });




    var signSections = [];
    signSections[0] = {
        sectionID: '1',
        sectionOrientation: 0,
        symbolOrientation: 0,
        backgroundColour: 'red',
        sectionBorder: {
            colour: '#000000',
            borderSize: 10, borderRadius: 0},
        symbols : [
            {symbolPath: 'symbols/svg/p001.svg', symbolWidth: 100, symbolHeight: 100}
        ],
        textPanels: [
            {
                colour: 'red',
                baseTextColour: 'white',
                panelRadius: 0,
                panelCorner: [0,0,0,0],
                sizeRatio: 100,
                textLines: [
                    {
                        text: 'this is section 1',
                        colour: 'white',
                        weight: 'bold',
                        size: 20,
                        anchor: 'middle',
                        id: 0,
                        x: 100,
                        y: 200,
                        xOffset: 0,
                        yOffset: 0,
                        leading: 1.5,
                    }
                ]
            }
        ]
    }
    /*
    signSections[0] = {
      sectionID: '2',
      sectionOrientation: 0,
      symbolOrientation: 0,
        backgroundColour: '#ff0f23',
        sectionBorder: {
            colour: '#000000',
            borderSize: 0, borderRadius: 0},
      symbols : [
{symbolPath: 'symbols/svg/p002.svg', symbolWidth: 100, symbolHeight: 100}
  ],
  textPanels: [
    {
      colour: 'red',
      baseTextColour: 'white',
      panelRadius: 0,
      panelCorner: [0,0,0,0],
      sizeRatio: 100,
      textLines: [
        {
          text: 'this is section 2',
          colour: 'white',
          weight: 'bold',
          size: 20,
          anchor: 'middle',
          id: 0,
          x: 100,
          y: 200,
          xOffset: 0,
          yOffset: 0,
          leading: 1.5,
        }
      ]
    }
  ]
}

signSections[1] = {
    sectionID: '1_1',
    sectionOrientation: 0,
    symbolOrientation: 0,
    backgroundColour: '#2546ff',
    sectionBorder: {
        colour: '#000000',
        borderSize: 0, borderRadius: 0},
    symbols : [
        {symbolPath: 'symbols/svg/p003.svg', symbolWidth: 100, symbolHeight: 100}
    ],
    textPanels: [
        {
            colour: 'blue',
            baseTextColour: 'white',
            panelRadius: 0,
            panelCorner: [0,0,0,0],
            sizeRatio: 100,
            textLines: [
                {
                    text: 'this is section 1_1',
                    colour: 'white',
                    weight: 'bold',
                    size: 20,
                    anchor: 'middle',
                    id: 0,
                    x: 100,
                    y: 200,
                    xOffset: 0,
                    yOffset: 0,
                    leading: 1.5,
                }
            ]
        }
    ]
}

signSections[2] = {
    sectionID: '1_2',
    sectionOrientation: 0,
    symbolOrientation: 0,
    backgroundColour: '#51ff19',
    sectionBorder: {
        colour: '#000000',
        borderSize: 0, borderRadius: 0},
    symbols : [
        {symbolPath: 'symbols/svg/p004.svg', symbolWidth: 100, symbolHeight: 100}
    ],
    textPanels: [
        {
            colour: 'green',
            baseTextColour: 'white',
            panelRadius: 0,
            panelCorner: [0,0,0,0],
            sizeRatio: 100,
            textLines: [
                {
                    text: 'this is section 1_2',
                    colour: 'white',
                    weight: 'bold',
                    size: 20,
                    anchor: 'middle',
                    id: 0,
                    x: 100,
                    y: 200,
                    xOffset: 0,
                    yOffset: 0,
                    leading: 1.5,
                }
            ]
        }
    ]
}
*/




</script>
