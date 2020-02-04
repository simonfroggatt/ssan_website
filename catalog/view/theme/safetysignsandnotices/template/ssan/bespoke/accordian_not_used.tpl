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
      <h4 class="panel-title"><a data-toggle="collapse" data-parent="#bespoke-accordian" href="#collapseSymbols"><?php echo $accordian_symbols; ?></a></h4>
    </div>
    <div id="collapseSymbols" class="panel-collapse collapse">  <div><?php echo $symbols; ?></div></div>
  </div>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h4 class="panel-title"><a data-toggle="collapse" data-parent="#bespoke-accordian" href="#collapseText"><?php echo $accordian_text; ?></a></h4>
    </div>
    <div id="collapseText" class="panel-collapse collapse">  <div><?php echo $textareas; ?></div></div>
  </div>
  <div class="form-group row">
    <div class="col-xs-4"><span class="h2">£</span><span id="priceDropDown" class="h2"></span></div>
    <div class="col-xs-8">
      <input type="hidden" name="product_id" id="product_id" value="<?php echo $product_id; ?>" />
      <input type="hidden" name="product_var_id" id="product_var_id" value="" />
      <input type="hidden" name="qtysource" id="qtysource" value="dropdown" />
  		<input type="hidden" name="svg_json" id="svg_json" value="" />
  		<input type="hidden" name="svg_raw" id="svg_raw" value="" />
  		<input type="hidden" name="qtyDropdown" id="qtyDropdown" value="1" />
  		<input type="hidden" name="is_bespoke" id="is_bespoke" value="1" />


  <button type="button" id="button-cart-dropdown" data-loading-text="loading..." class="btn btn-add-cart btn-lg btn-block">Add to Cart</button>
  </div>
  </div>

</div>

<script>
var prod_variants = <?php echo json_encode($variant_size_materials); ?>;
$('#button-cart-dropdown').on('click', function() {

    var tmp =  $('input[type=\'text\'], input[type=\'hidden\'], input[type=\'radio\']:checked, input[type=\'checkbox\']:checked, select, #bespokeProduct textarea, input[type=\'number\']');
    console.log(tmp);

		//need to gather the svgimage and the svgJson to redraw
		var thumbtemp = new bespokeSign('thumbdrawing');
		var svgCode = thumbtemp.exportToSVGThumb(newSign);
		var svgJSONdata = newSign.exportToJSON();


		var forminfo = $('#bespoke-product input[type=\'text\'], #bespoke-product input[type=\'hidden\'], #bespoke-product input[type=\'radio\']:checked, #bespoke-product input[type=\'checkbox\']:checked, #bespoke-product select, #bespoke-product textarea, #bespoke-product input[type=\'number\']').serializeArray();
		forminfo.push({name: "svg_raw", value: svgCode});
		forminfo.push({name: "svg_json", value: svgJSONdata});
	//	console.log(forminfo);


	//	tmpdata.push(svgData);


$.ajax({
  url: 'index.php?route=checkout/cart/add',
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

      $('#cart-totals').html(json['cart_count']);
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
