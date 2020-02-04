<link href="catalog/view/theme/safetysignsandnotices/stylesheet/bespoke/stylesheet.css" rel="stylesheet" type="text/css">


<div class="col-sm-6 col-md-6">

  <div  id="drawing">
  </div>
  <div  id="thumbdrawing" ></div>

</div>
<div class="col-sm-6 col-md-6">
  <div class="row">

<!-- start accordian -->
    <div class="panel-group" id="bespoke-accordian">

      <div class="panel panel-default">
        <div class="panel-heading">
          <h4 class="panel-title"><a data-toggle="collapse" data-parent="#bespoke-accordian" href="#collapseSizeMaterial"><?php echo $accordian_sizes; ?></a></h4>
        </div>
        <div id="collapseSizeMaterial" class="panel-collapse collapse in">
          <div class="panel-body">  <?php echo $prod_var_dropdown; ?></div>
        </div>
      </div>

      <div class="panel panel-default">
        <div class="panel-heading">
          <h4 class="panel-title"><a data-toggle="collapse" data-parent="#bespoke-accordian" href="#collapseBackground"><?php echo $accordian_bg_colour; ?></a></h4>
        </div>
        <div id="collapseBackground" class="panel-collapse collapse">
          <div class="panel-body"> <?php echo $backgroundPicker; ?></div>
        </div>
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
/*
if(imageArray.length > 0)
{
  var symbolInfoArray = imageArray[0]
  var symbolInfo = symbolInfoArray[0];

}
if(variant_sizes.length > 0)
{
  var signWidth = variant_sizes[0].width
  var signHeight = variant_sizes[0].height
}
*/

/*<?php foreach($text_only_cats as $colorDefs) { ?>
  <?php print_r($colorDefs); ?>
<?php } ?>
*/

var blankSignColours = [
  <?php foreach($text_only_cats as $colorDefs ) { ?>
      {name: '<?php echo $colorDefs['name']; ?>',   color: '<?php echo $colorDefs['color']; ?>',   textcolor: '<?php echo $colorDefs['textcolor']; ?>',   border: '<?php echo $colorDefs['border']; ?>',  borderColor: '<?php echo $colorDefs['borderColor']; ?>'} ,
  <?php } ?>
];

var newSign = new bespokeSign('drawing', {
  signWidth: 0,
  signHeight: 0,
  orientation: 0,
  hasSymbol: 0,

  autoIgnore: { borderSize: false, },
  hasBorder: blankSignColours[0]['border'],

  autoSize: true,

  signBorder: {colour: blankSignColours[0]['borderColor'], borderSize: 0, borderRadius: 10},
  signColour: blankSignColours[0]['color'],
  signPanel: {colour: blankSignColours[0]['color'], margin: {top: 10, right: 10, bottom: 10, left: 10} },



    textContainerMargin: {top: 0, right: 0, bottom: 0, left: 0},
    textPanelSpacer: 5,
    textPanels: [
      {
        colour: 'none',
        baseTextColour: blankSignColours[0]['textcolor'],
        /*colour: 'rgb(<?php echo $categoryBaseColour; ?>)',
        baseTextColour: '<?php echo $categoryBaseTextColour; ?>',*/
        panelRadius: 5,
        panelCorner: [0,0,0,0],
        height: 100,
        margin: {top: 5, right: 5, bottom: 5, left: 5},

      textLines: [
        {
          text: '',
        //  colour: blankSignColours[0]['textcolor'],
          weight: 'bold',
          size: '0',
          anchor: 'middle',
          id: 0,
          x: 0,
          y: 0,
          xOffset: 0,
          yOffset: 0,
          leading: 1.5,
        },


        ]
    },
    /*{
      colour: 'rgb(<?php echo $categoryBaseColour; ?>)',
      panelRadius: 5,
      panelCorner: [0,0,0,0],
      height: 100,
      margin: {top: 5, right: 5, bottom: 5, left: 5},
    textLines: [
      {
        text: '',
        colour: '<?php echo $categoryBaseTextColour; ?>',
        weight: 'Bold',
        size: '0',
        anchor: 'middle'
      }
      ]
  }*/
]


})

//bespokeSign.drawSign(200,200)



</script>
