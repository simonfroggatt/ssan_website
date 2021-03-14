<?php echo $header; ?>

<?php print_r($productMarkUp); ?>


<div class="container">
  <ul class="breadcrumb">
    <?php foreach ($breadcrumbs as $breadcrumb) { ?>
    <li><a href="<?php echo $breadcrumb['href']; ?>"><?php echo $breadcrumb['text']; ?></a></li>
    <?php } ?>
  </ul>
  <div class="row"><?php echo $column_left; ?>
    <?php if ($column_left && $column_right) { ?>
    <?php $class = 'col-sm-6'; ?>
    <?php } elseif ($column_left || $column_right) { ?>
    <?php $class = 'col-sm-9'; ?>
    <?php } else { ?>
    <?php $class = 'col-sm-12'; ?>
    <?php } ?>
    <div id="content" class="<?php echo $class; ?>"><?php echo $content_top; ?>


      <?php if($is_bespoke == 1) { ?>
        <?php require("catalog/view/theme/safetysignsandnotices/template/product/product_bespoke.tpl"); ?>
      <?php } else { ?>
        <?php require("catalog/view/theme/safetysignsandnotices/template/product/product_normal.tpl"); ?>
        <?php } ?>



      <div class="row">
        <div class="col-sm-12">
          <ul class="nav nav-tabs">
            <li class="active"><a href="#tab-related-products" data-toggle="tab"><i class="fa fa-link"> Related Products</i></a></li>
            <li><a href="#tab-also-sold" data-toggle="tab"><i class="fa fa-cart-arrow-down"> Customers Also Bought</i></a></li>
          </ul>
            <div class="tab-content">
              <div class="tab-pane active" id="tab-related-products">
                <?php require("catalog/view/theme/safetysignsandnotices/template/product/product_related.tpl"); ?>
              </div>
              <div class="tab-pane" id="tab-also-sold">
              <h2>Please wait whilst we find other great selling products</h2>
             <!--   <?php /* require("catalog/view/theme/safetysignsandnotices/template/product/product_also_sold.tpl"); */ ?>  -->
              </div>
            </div>

        </div>
      </div>

        <hr>

      <!-- this is the tabs at the bottom -->
      <div class="row">
        <div class="col-sm-12">
          <ul class="nav nav-tabs">
            <li class="active"><a href="#tab-material-sizes" data-toggle="tab"><i class="fa fa-table"> Size, Materials & Bulk Pricing</i></a></li>
            <li><a href="#tab-description" data-toggle="tab"><i class="fa fa-info"> <?php echo $tab_description; ?></i></a></li>

          <!--   <li><a href="#tab-sign-specs" data-toggle="tab"><i class="fa fa-list-ul"> Specifications</i></a></li>
            <li><a href="#tab-material-info" data-toggle="tab"><i class="fa fa-flask"> Material Information</i></a></li> -->

            <li><a href="#tab-similar-signs" data-toggle="tab"><i class="fa fa-picture-o "> Similar Signs</i></a></li>

            <?php if ($attribute_groups) { ?>
            <li><a href="#tab-specification" data-toggle="tab"><?php echo $tab_attribute; ?></a></li>
            <?php } ?>
            <?php if ($review_status) { ?>
            <li><a href="#tab-review" data-toggle="tab"><?php echo $tab_review; ?></a></li>
            <?php } ?>
          </ul>
          <div class="tab-content">
            <div class="tab-pane active" id="tab-material-sizes"><?php echo $prod_var_table; ?></div>
            <div class="tab-pane" id="tab-description"><?php echo $long_description; ?></div>
            <div class="tab-pane" id="tab-sign-specs">Specs in here</div>
        <!--    <div class="tab-pane" id="tab-material-info"><?php /*echo $product_material_spec;*/ ?></div> -->
            <div class="tab-pane" id="tab-similar-signs">Similar signs by image</div>
            <?php if ($attribute_groups) { ?>
            <div class="tab-pane" id="tab-specification">
              <table class="table table-bordered">
                <?php foreach ($attribute_groups as $attribute_group) { ?>
                <thead>
                <tr>
                  <td colspan="2"><strong><?php echo $attribute_group['name']; ?></strong></td>
                </tr>
                </thead>
                <tbody>
                <?php foreach ($attribute_group['attribute'] as $attribute) { ?>
                <tr>
                  <td><?php echo $attribute['name']; ?></td>
                  <td><?php echo $attribute['text']; ?></td>
                </tr>
                <?php } ?>
                </tbody>
                <?php } ?>
              </table>
            </div>
            <?php } ?>
            <?php if ($review_status) { ?>
            <div class="tab-pane" id="tab-review">
              <form class="form-horizontal" id="form-review">
                <div id="review"></div>
                <h2><?php echo $text_write; ?></h2>
                <?php if ($review_guest) { ?>
                <div class="form-group required">
                  <div class="col-sm-12">
                    <label class="control-label" for="input-name"><?php echo $entry_name; ?></label>
                    <input type="text" name="name" value="<?php echo $customer_name; ?>" id="input-name" class="form-control" />
                  </div>
                </div>
                <div class="form-group required">
                  <div class="col-sm-12">
                    <label class="control-label" for="input-review"><?php echo $entry_review; ?></label>
                    <textarea name="text" rows="5" id="input-review" class="form-control"></textarea>
                    <div class="help-block"><?php echo $text_note; ?></div>
                  </div>
                </div>
                <div class="form-group required">
                  <div class="col-sm-12">
                    <label class="control-label"><?php echo $entry_rating; ?></label>
                    &nbsp;&nbsp;&nbsp; <?php echo $entry_bad; ?>&nbsp;
                    <input type="radio" name="rating" value="1" />
                    &nbsp;
                    <input type="radio" name="rating" value="2" />
                    &nbsp;
                    <input type="radio" name="rating" value="3" />
                    &nbsp;
                    <input type="radio" name="rating" value="4" />
                    &nbsp;
                    <input type="radio" name="rating" value="5" />
                    &nbsp;<?php echo $entry_good; ?></div>
                </div>
                <?php echo $captcha; ?>
                <div class="buttons clearfix">
                  <div class="pull-right">
                    <button type="button" id="button-review" data-loading-text="<?php echo $text_loading; ?>" class="btn btn-primary"><?php echo $button_continue; ?></button>
                  </div>
                </div>
                <?php } else { ?>
                <?php echo $text_login; ?>
                <?php } ?>
              </form>
            </div>
            <?php } ?>
          </div>
        </div>
      </div>   <!-- end of the tabs at the bottom -->

      <?php if ($tags) { ?>
      <p><?php echo $text_tags; ?>
        <?php for ($i = 0; $i < count($tags); $i++) { ?>
        <?php if ($i < (count($tags) - 1)) { ?>
        <a href="<?php echo $tags[$i]['href']; ?>"><?php echo $tags[$i]['tag']; ?></a>,
        <?php } else { ?>
        <a href="<?php echo $tags[$i]['href']; ?>"><?php echo $tags[$i]['tag']; ?></a>
        <?php } ?>
        <?php } ?>
      </p>
      <?php } ?>

      <?php echo $content_bottom; ?></div>
    <?php echo $column_right; ?></div>
</div>



<script type="text/javascript"><!--
$('select[name=\'recurring_id\'], input[name="quantity"]').change(function(){
	$.ajax({
		url: 'index.php?route=product/product/getRecurringDescription',
		type: 'post',
		data: $('input[name=\'product_id\'], input[name=\'quantity\'], select[name=\'recurring_id\']'),
		dataType: 'json',
		beforeSend: function() {
			$('#recurring-description').html('');
		},
		success: function(json) {
			$('.alert, .text-danger').remove();

			if (json['success']) {
				$('#recurring-description').html(json['success']);
			}
		}
	});
});
//--></script>

<script type="text/javascript"><!--
$('.date').datetimepicker({
	pickTime: false
});

$('.datetime').datetimepicker({
	pickDate: true,
	pickTime: true
});

$('.time').datetimepicker({
	pickDate: false
});

$('button[id^=\'button-upload\']').on('click', function() {
	var node = this;

	$('#form-upload').remove();

	$('body').prepend('<form enctype="multipart/form-data" id="form-upload" style="display: none;"><input type="file" name="file" /></form>');

	$('#form-upload input[name=\'file\']').trigger('click');

	if (typeof timer != 'undefined') {
    	clearInterval(timer);
	}

	timer = setInterval(function() {
		if ($('#form-upload input[name=\'file\']').val() != '') {
			clearInterval(timer);

			$.ajax({
				url: 'index.php?route=tool/upload',
				type: 'post',
				dataType: 'json',
				data: new FormData($('#form-upload')[0]),
				cache: false,
				contentType: false,
				processData: false,
				beforeSend: function() {
					$(node).button('loading');
				},
				complete: function() {
					$(node).button('reset');
				},
				success: function(json) {
					$('.text-danger').remove();

					if (json['error']) {
						$(node).parent().find('input').after('<div class="text-danger">' + json['error'] + '</div>');
					}

					if (json['success']) {
						alert(json['success']);

						$(node).parent().find('input').val(json['code']);
					}
				},
				error: function(xhr, ajaxOptions, thrownError) {
					alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
				}
			});
		}
	}, 500);
});
//--></script>
<script type="text/javascript"><!--
$('#review').delegate('.pagination a', 'click', function(e) {
    e.preventDefault();

    $('#review').fadeOut('slow');

    $('#review').load(this.href);

    $('#review').fadeIn('slow');
});

$('#review').load('index.php?route=product/product/review&product_id=<?php echo $product_id; ?>');


$('#button-review').on('click', function() {
	$.ajax({
		url: 'index.php?route=product/product/write&product_id=<?php echo $product_id; ?>',
		type: 'post',
		dataType: 'json',
		data: $("#form-review").serialize(),
		beforeSend: function() {
			$('#button-review').button('loading');
		},
		complete: function() {
			$('#button-review').button('reset');
		},
		success: function(json) {
			$('.alert-success, .alert-danger').remove();

			if (json['error']) {
				$('#review').after('<div class="alert alert-danger"><i class="fa fa-exclamation-circle"></i> ' + json['error'] + '</div>');
			}

			if (json['success']) {
				$('#review').after('<div class="alert alert-success"><i class="fa fa-check-circle"></i> ' + json['success'] + '</div>');

				$('input[name=\'name\']').val('');
				$('textarea[name=\'text\']').val('');
				$('input[name=\'rating\']:checked').prop('checked', false);
			}
		}
	});
});

var defaultProductImage = $('#productImage').attr('src');

$(document).ready(function() {
	$('.thumbnails').magnificPopup({
		type:'image',
		delegate: 'a',
		gallery: {
			enabled:true
		}
	});

  $.get("/index.php?route=ssan/product_customer_also_bought&product_id=<?php echo $product_id; ?>" )
          .done(function( data ) {
            targ = $('#tab-also-sold');
            $(targ).html(data);
       //     alert( "Data Loaded: " + data );

          });

<?php if($is_bespoke == 1) { ?>
    $('#posize').trigger('change');
  <?php } else { ?>
          $('#posize').trigger('change');

          <?php if($preselect_variant > 0) { ?>
          setPreloadedVariantID(<?php echo $preselect_variant; ?>);
          <?php } ?>

<?php } ?>


});

//--></script>

<script>
<!-- GTM - enhanced commerce trackign -->
dataLayer.push({
  'event': 'SSANProductViewed',
   'ecommerce': {
      'detail': {
       'products': [{
         'id':'<?php echo $product_id; ?>',
         'name':'<?php echo $heading_title; ?>'
        }]
    }
  }
});



</script>

<?php echo $footer; ?>
