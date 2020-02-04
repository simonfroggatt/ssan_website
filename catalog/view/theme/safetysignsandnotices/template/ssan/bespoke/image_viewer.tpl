<script src="catalog/view/javascript/svg/svg.js"></script>
<script src="catalog/view/javascript/svg/svg.filter.js"></script>
<script src="catalog/view/javascript/svg/bespoke.interface.js"></script>
<script src="catalog/view/javascript/svg/bespoke.construct.js"></script>
<script src="catalog/view/javascript/svg/bespoke.draw.js"></script>
<script src="catalog/view/javascript/svg/bespoke.js"></script>
<script src="catalog/view/javascript/svg/svg.screenbbox.js"></script>
{* }<script src="catalog/view/javascript/JavaScriptSpellCheck/include.js"></script> *}


<link href="catalog/view/javascript/ssan/bespoke-text-font/css/bespoke-text.css" rel="stylesheet" type="text/css" />



<div  id="drawing">
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
var newSign = new bespokeSign('drawing', {
  signWidth: 0,
  signHeight: 0,
  orientation: 0,

  autoIgnore: { borderSize: true, },

  autoSize: true,

  signBorder: {colour: 'black', borderSize: 0, borderRadius: 10},
  signBackgroundColour: 'white',
  signPanel: {colour: 'white', margin: {top: 10, right: 10, bottom: 10, left: 10} },



    symbols: [
      {symbolPath: '', symbolWidth: 0, symbolHeight: 0},
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
        margin: {top: 5, right: 5, bottom: 5, left: 5},

      textLines: [
        {
          text: '',
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
