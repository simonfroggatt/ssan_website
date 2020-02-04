<div class="form-group row">
  <label class="col-sm-3 col-md-2 col-form-label" for="posize"><?php echo $text_productsize ?></label>
  <div class="col-sm-9 col-md-10 "><select name="posize" id="posize" class="form-control selectpicker">
  
              <?php foreach ($variant_sizes as $sizeval) { ?>
              <option value="<?php echo $sizeval['id']; ?>"><?php echo $sizeval['size_name']; ?>
                <?php } ?>
            </select>
  </div>
</div>
<div class="form-group row">
  <label class="col-sm-3 col-md-2 col-form-label" for="pomaterial"><?php echo $text_productmaterial ?></label>
  <div class="col-sm-9 col-md-10 "><select name="pomaterial" id="pomaterial" class="form-control selectpicker">
              <?php foreach ($variant_materials as $materialval) { ?>
              <option value="<?php echo $materialval['id']; ?>"><?php echo $materialval['material_name']; ?>
                <?php } ?>
            </select>
  </div>
</div>
<div class="form-group row">
  <label class="col-sm-3 col-md-2 col-form-label" for="pomaterial">Quantity</label>
  <div class="col-sm-9 col-md-10 "><input name="qtyDropdown" id="qtyDropdown" class="form-control" type="number" min="1" value="1"></div>
</div>
<div class="form-group row">
  <div class="col-xs-4"><span class="h2">£</span><span id="priceDropDown" class="h2"></span></div>
  <div class="col-xs-8">
    <input type="hidden" name="product_id" id="product_id" value="<?php echo $product_id; ?>" />
    <input type="hidden" name="product_var_id" id="product_var_id" value="" />
    <input type="hidden" name="qtysource" id="qtysource" value="dropdown" />
    <input type="hidden" name="is-bespoke" id="is-bespoke" value="0" />
    <button type="button" id="button-cart-dropdown" data-loading-text="loading..." class="btn btn-add-cart btn-lg btn-block">Add to Cart</button>
  </div>
</div>

<script>
  var prod_variants = <?php echo json_encode($variant_size_materials); ?>;

  $('#button-cart-dropdown').on('click', function() {

    var tmp = $('#product input[type=\'text\'], #product input[type=\'hidden\'], #product input[type=\'radio\']:checked, #product input[type=\'checkbox\']:checked, #product select, #product textarea, #product input[type=\'number\']');
    console.log(tmp);
    $.ajax({
      url: 'index.php?route=checkout/cart/add',
      type: 'post',
      data: $('#product input[type=\'text\'], #product input[type=\'hidden\'], #product input[type=\'radio\']:checked, #product input[type=\'checkbox\']:checked, #product select, #product textarea, #product input[type=\'number\']'),
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
          console.log(json);
          //$('#cart > button').html('<span id="cart-total"><i class="fa fa-shopping-cart"></i> ' + json['total'] + '</span>');

          $('html, body').animate({
            scrollTop: 0
          }, 'slow');

          $('#cart > ul').load('index.php?route=common/cart/info ul li');
        }
      },
      error: function(xhr, ajaxOptions, thrownError) {
        alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
      }
    });
  });

  $('#button-cart-dropdown-test').on('click', function() {

    var tmp = $('#product input[type=\'text\'], #product input[type=\'hidden\'], #product input[type=\'radio\']:checked, #product input[type=\'checkbox\']:checked, #product select, #product textarea, #product input[type=\'number\']');

    var EEid = $('#product_var_id').val();
    var EEproductQuantity = $('#qtyDropdown').val();
    var EEproductName = '<?php echo $variant_product_name; ?>';

    var EEvariableInfo = findProductVariantInfoData(EEid);

    var EEproductPrice = getBulkPricingValue(EEvariableInfo.discount_array, EEproductQuantity);
    var EEproductVariant = EEvariableInfo['size_name'] + ' - ' + EEvariableInfo['material_name'];



    console.log("EEid: "+EEid);
    console.log("EEproductQuantity: "+EEproductQuantity);
    console.log("EEproductName: "+EEproductName);
    console.log("EEproductPrice: "+EEproductPrice);
    console.log("EEproductVariant: "+EEproductVariant);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'registrationComplete'
    });



    /* $.ajax({
      url: 'index.php?route=checkout/cart/add',
      type: 'post',
      data: $('#product input[type=\'text\'], #product input[type=\'hidden\'], #product input[type=\'radio\']:checked, #product input[type=\'checkbox\']:checked, #product select, #product textarea, #product input[type=\'number\']'),
      dataType: 'json',

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

        }
      },
          error: function(xhr, ajaxOptions, thrownError) {
              alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
          }
    });*/
  });


</script>
