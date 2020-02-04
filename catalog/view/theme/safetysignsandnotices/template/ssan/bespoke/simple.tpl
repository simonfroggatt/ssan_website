<link href="catalog/view/theme/safetysignsandnotices/stylesheet/bespoke/stylesheet.css" rel="stylesheet" type="text/css">




<div class="col-sm-6">

  <div  id="drawing"></div>
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

if(imageArray.length > 0)
{
  var symbolInfoArray = imageArray[0]
  //var symbolInfo = symbolInfoArray[0];

}
/*
if(variant_sizes.length > 0)
{
  var signWidth = variant_sizes[0].width
  var signHeight = variant_sizes[0].height
}
*/
var newSign = new bespokeSign('drawing', {
  signWidth: 0,
  signHeight: 0,
  orientation: 0,

  autoSize: true,
  autoIgnore: {
    borderSize: true,
    symbolSizing: false,
    marginSize: false,
    textBlockMargin: false
  },
  hasSymbol: 1,

  signBorder: {colour: 'none', borderSize: 0, borderRadius: 0},
  signBackgroundColour: 'white',
  signPanel: {colour: 'white', margin: {top: 0, right: 0, bottom: 0, left: 0} },

    symbols: [
      {symbolPath: symbolInfoArray['svg_path'], symbolWidth: symbolInfoArray['width'], symbolHeight: symbolInfoArray['height']},
    ],

    textContainerMargin: {top: 0, right: 0, bottom: 0, left: 0},
    textPanelSpacer: 5,
    textPanels: [
      {
        colour: 'rgb(<?php echo $categoryBaseColour; ?>)',
        baseTextColour: '<?php echo $categoryBaseTextColour; ?>',
        panelRadius: 5,
        panelCorner: [0,0,0,0],
        height: 100,
        margin: {top: 0, right: 0, bottom: 0, left: 0},

      textLines: [
        {
          text: '',
          colour: '<?php echo $categoryBaseTextColour; ?>',
          weight: 'bold',
          size: 20,
          anchor: 'middle',
          id: 0,
          x: 100,
          y: 200,
          xOffset: 0,
          yOffset: 0,
          leading: 1.5,
        }/*]
        {
          text: 'BBBB',
          colour: '<?php echo $categoryBaseTextColour; ?>',
          weight: 'Bold',
          size: '0',
          anchor: 'middle',
          id: 0,
          x: 0,
          y: 0,
          xOffset: 0,
          yOffset: 0,
          leading: 1.5,
        }*/]
      }/*,
      {
        colour: 'green',
        baseTextColour: '<?php echo $categoryBaseTextColour; ?>',
        panelRadius: 5,
        panelCorner: [0,0,1,1],
        height: 200,
        margin: {top: 5, right: 5, bottom: 5, left: 5},

        textLines: [
          {
            text: 'AAAA AA',
            colour: '<?php echo $categoryBaseTextColour; ?>',
            weight: 'Bold',
            size: 20,
            anchor: 'middle',
            id: 0,
            x: 100,
            y: 200,
            xOffset: 0,
            yOffset: 0,
            leading: 1.5,
          }]
        }
        */
      ]


});

//bespokeSign.drawSign(200,200)



</script>
