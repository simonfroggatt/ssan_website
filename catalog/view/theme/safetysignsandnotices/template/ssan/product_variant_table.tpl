
    <table id="product_variant_table"
    data-toggle="table"
    data-classes="table table-condensed table-no-bordered table-hover product-variant"
    data-filter-control="false"
    data-filter-show-clear="false"
    data-row-style="rowStyle"
    >
<!--    <colgroup span="3"></colgroup>
    <colgroup span="<?php echo $bulk_discount_price_count;?>"></colgroup>
    <col class=""> -->

      <tbody>
        <?php $hidestyle = $showBulkQtyColumn ? 'bulk-column-show' : 'bulk-column-hide'; ?>
        <?php foreach ($product_table_data as $product_variant_data) { ?>
          <tr id="<?php echo $product_variant_data['id']; ?>" data-uniqueid="<?php echo $product_variant_data['id']; ?>">
            <td class="product-variant">
              <?php echo $product_variant_data['variant_code']; ?>
            </td>
            <td class="product-variant">
              <?php echo $product_variant_data['size_name']; ?>
            </td>
            <td class="product-variant">
              <?php echo $product_variant_data['material_name']; ?>
            </td>
            <?php foreach($product_variant_data['discount_array'] as $index => $discount_value){ ?>
              <td class="col-md-1 bulkcell_<?php echo $product_variant_data['id'];?> product-variant" data-variant-bulk-id="<?php echo $product_variant_data['id']?>_<?php echo $index; ?>">
                <?php echo number_format($discount_value * $tax_multiplier,2);?><br><span class="tabletax">
                <?php if($tax_multiplier == 1) { ?>
                    (inc VAT
                <?php echo number_format($discount_value * $j_tax_multiplier,2); } else { ?>
                    (ex VAT
                <?php echo number_format($discount_value / $j_tax_multiplier,2); } ?>
                )<span>
              </td>
              <?php } ?>
                <td class="col-md-1 <?php echo $hidestyle; ?>">
                  <?php
                  $variantQtyInCart = 0;
                  foreach($variantQuantaties as $index => $varData)
                  {
                    if($varData['product_variant_id'] == $product_variant_data['id'])
                    {
                      $variantQtyInCart = $varData['quantity'];
                      break;
                    }
                  }  ?>
                  <input name="variantQty[<?php echo $product_variant_data['id']; ?>]" id="<?php echo $product_variant_data['id']; ?>" class="form-control orderqty" type="number" data-qty-variant-id="<?php echo $product_variant_data['id']; ?>" min="0" value="<?php echo $variantQtyInCart; ?>">
                </td>
          </tr>
          <?php } ?>
      </tbody>
      <thead>

        <tr>
          <th colspan="3"><span class="prices-tax-text">How would you like to see the prices?</span>
            <input id="toggle-vat" type="checkbox" data-toggle="toggle" data-size="small" data-onstyle="warning" data-width="100" data-height="20" data-on="Including VAT" data-off="Excluding VAT"></th>
          <th colspan="<?php echo ($bulk_discount_price_count + 1);?>" data-halign="center">Quantity/Price Each</th>
        </tr>

        <tr>
          <th data-field="id" data-sortable="false" data-halign="center" data-align="center" >Code</th>
          <th data-field="size" data-filter-control="select" data-sortable="false" data-halign="center" data-align="center" >Size</th>
          <th data-field="material" data-filter-control="select" data-sortable="false" data-halign="center" data-align="center">Material</th>

          <?php foreach($bulk_discount_group_titles as $key => $bulk_discount_data) { ?>
            <th data-field="bulk_price[<?php echo $key; ?>]" data-sortable="false" data-halign="center" data-align="center">
              <?php echo $bulk_discount_data['discount_title']; ?>
            </th>
            <?php } ?>
              <th data-field="qty" data-sortable="false" data-halign="center" data-align="center" class="<?php echo $hidestyle; ?>">QTY</th>
        </tr>
      </thead>
      <tfoot>

        <tr>
          <td colspan="<?php echo ($bulk_discount_price_count + 2);?>"><span id="vat-status-text"></span></td>
          <td colspan="2">
            <div class="form-group">
                <input type="hidden" name="product_id" id="product_id" value="<?php echo $product_id; ?>" />
                <input type="hidden" name="qtysource" id="qtysource" value="table" />
            <button type="button" id="button-cart-table" data-loading-text="loading..." class="btn btn-add-cart btn-lg btn-block <?php echo $hidestyle; ?>"><?php
              if($cartHasProducts == 1){
                echo 'Update Cart';
              }
              else {
                echo 'Add to Cart';
              }
               ?></button>
          </div>
          </td>
        </tr>
      </tfoot>
    </table>

  <script>
    var bulkQtyBreaks = <?php echo json_encode($bulk_discount_group_ranges); ?>;
    var productVariantInfomationArray = <?php echo json_encode($product_table_data); ?>;

    var $table = $('#product_variant_table').bootstrapTable({
       striped: true,
      onPostBody: function(data){
        setCurrentQtySelected();
      }
    });


    var $toggleVat = $('#toggle-vat').bootstrapToggle();
    var tax_multiplier = <?php echo $j_tax_multiplier; ?>;
    var bulkDiscountCount = <?php echo $bulk_discount_price_count; ?>;

    initToggle();
    setToggling();

var bulkRawValues;

    $('#button-cart-table').on('click', function() {

      $.ajax({
    		url: 'index.php?route=checkout/cart/add',
    		type: 'post',
    		data: $('#product input[type=\'text\'], #product input[type=\'hidden\'], #product input[type=\'radio\']:checked, #product input[type=\'checkbox\']:checked, #product select, #product textarea, #product_variant_table input[type=\'hidden\'], #product_variant_table input[type=\'number\']'),
    		dataType: 'json',
    		beforeSend: function() {
    			$('#button-cart-table').button('loading');
    		},
    		complete: function() {
    			$('#button-cart-table').button('reset');
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
            $('#cart-class').addClass(json['cartclass']);
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
