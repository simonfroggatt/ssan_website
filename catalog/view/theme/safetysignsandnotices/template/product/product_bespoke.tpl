<!-- <script src="catalog/view/javascript/svg/svg.js"></script>
<script src="catalog/view/javascript/svg/svg.filter.js"></script>
<script src="catalog/view/javascript/svg/bespoke.js"></script>
<script src="catalog/view/javascript/svg/bespoke.interface.js"></script>
<script src="catalog/view/javascript/svg/bespoke.construct.js"></script>
<script src="catalog/view/javascript/svg/bespoke.draw.js"></script>
<script src="catalog/view/javascript/svg/svg.screenbbox.js"></script>
<script src="catalog/view/javascript/colorpicker/js/bootstrap-colorpicker.min.js"></script>
-->



<link href="catalog/view/javascript/ssan/bespoke-text-font/css/bespoke-text.css" rel="stylesheet" type="text/css" />
<link href="catalog/view/javascript/colorpicker/css/bootstrap-colorpicker.css" rel="stylesheet" type="text/css" />

<div class="row"> <!-- start standard product -->
  <div class="col-sm-12">
      <h1><?php echo $heading_title; ?></h1>
    <div class="row" id="bespoke-product">
      <?php echo $bespokeImageCenter ;?>
    </div>
  </div> <!-- start standard product -->
</div>

<script type="text/javascript">
$(document).ready(function() {
//  InitialiseBespoke();
/*
  <?php if($bespokeid > 0) { ?>
    <?php if($productJSON != null) { ?>
      setPreloadedBespoke(<?php echo $productJSON; ?>)
      <?php if($preselect_variant > 0) { ?>
       setPreloadedVariantID(<?php echo $preselect_variant; ?>);
     <?php } ?>
    <?php } else { ?>
      InitialiseBespoke();
    <?php } ?>
   //setPreloadedVariantID(<?php echo $preselect_variant; ?>);
  <?php } else { ?>
      InitialiseBespoke();
  <?php } ?>
*/

});


$('.btn-add-cart').on('click', function() {

    var tmp =  $('input[type=\'text\'], input[type=\'hidden\'], input[type=\'radio\']:checked, input[type=\'checkbox\']:checked, select, #bespokeProduct textarea, input[type=\'number\']');
    console.log(tmp);

		//need to gather the svgimage and the svgJson to redraw
		var thumbtemp = new bespokeSign('thumbdrawing');
		var svgCode = thumbtemp.exportToSVGThumb(newSign);
    var svgExport = thumbtemp.exportToSVG(newSign);
		var svgJSONdata = newSign.exportToJSON();
    var svgTexts = newSign.getTexts();
    var svgImages = newSign.getImagesUsed();

		var forminfo = $('#bespoke-product input[type=\'text\'], #bespoke-product input[type=\'hidden\'], #bespoke-product input[type=\'radio\']:checked, #bespoke-product input[type=\'checkbox\']:checked, #bespoke-product select, #bespoke-product textarea, #bespoke-product input[type=\'number\']').serializeArray();
		forminfo.push({name: "svg_raw", value: svgCode});
		forminfo.push({name: "svg_json", value: svgJSONdata});
    forminfo.push({name: "svg_export", value: svgExport});
    forminfo.push({name: "svg_bespoke_texts", value: svgTexts});
    forminfo.push({name: "svg_bespoke_images", value: svgImages});

  //	console.log(forminfo);
  var postURL = 'index.php?route=checkout/cart/';
  postURL += $(this).data("cart");


	//	tmpdata.push(svgData);


$.ajax({
  url: postURL,
  type: 'post',
  data: forminfo,//$('#bespoke-product input[type=\'text\'], #bespoke-product input[type=\'hidden\'], #bespoke-product input[type=\'radio\']:checked, #bespoke-product input[type=\'checkbox\']:checked, #bespoke-product select, #bespoke-product textarea, #bespoke-product input[type=\'number\']'),
//	data: $('#product input[type=\'text\'], #product input[type=\'hidden\'], #product input[type=\'radio\']:checked, #product input[type=\'checkbox\']:checked, #product select, #product textarea, #product input[type=\'number\']'),
  dataType: 'json',
  beforeSend: function() {
    $('#button-cart-dropdown').button('loading');
  },
  complete: function() {
    $('#button-cart-dropdown').button('reset');
  },
  success: function(json) {
    $('.alert, .text-danger').remove();
    $('.form-group').removeClass('has-error');

    if (json['error']) {
      if (json['error']['option']) {
        for (i in json['error']['option']) {
          var element = $('#input-option' + i.replace('_', '-'));

          if (element.parent().hasClass('input-group')) {
            element.parent().after('<div class="text-danger">' + json['error']['option'][i] + '</div>');
          } else {
            element.after('<div class="text-danger">' + json['error']['option'][i] + '</div>');
          }
        }
      }

      if (json['error']['recurring']) {
        $('select[name=\'recurring_id\']').after('<div class="text-danger">' + json['error']['recurring'] + '</div>');
      }

      // Highlight any found errors
      $('.text-danger').parent().addClass('has-error');
    }

    if (json['success']) {
      $('.breadcrumb').after('<div class="alert alert-success">' + json['success'] + '<button type="button" class="close" data-dismiss="alert">&times;</button></div>');

      $('#cart-totals').html(json['cart_count']['md']);
      $('#cart-totals-xs').html(json['cart_count']['xs']);
      //$('#cart > button').html('<span id="cart-total"><i class="fa fa-shopping-cart"></i> ' + json['total'] + '</span>');

      $('html, body').animate({ scrollTop: 0 }, 'slow');

      $('#cart > ul').load('index.php?route=common/cart/info ul li');
    }
  },
      error: function(xhr, ajaxOptions, thrownError) {
          alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
      }
});
  });



</script>
