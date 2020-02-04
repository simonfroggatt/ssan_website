<div class="row"> <!-- start standard product -->
  <div class="col-sm-12">
      <h1><?php echo $heading_title; ?></h1>
    <div class="row">
      <div class="col-sm-4">
        <?php if ($thumb || $images) { ?>
        <ul class="thumbnails">
          <?php if ($thumb) { ?>
          <li><a class="thumbnail" id="productImagePopup" href="<?php echo $popup; ?>" title="<?php echo $heading_title; ?>"><img src="<?php echo $thumb; ?>" title="<?php echo $heading_title; ?>" alt="<?php echo $heading_title; ?>" id="productImage" /></a></li>
          <?php } ?>
          <?php if ($images) { ?>
          <?php foreach ($images as $image) { ?>
          <li class="image-additional"><a class="thumbnail" href="<?php echo $image['popup']; ?>" title="<?php echo $heading_title; ?>"> <img src="<?php echo $image['thumb']; ?>" title="<?php echo $heading_title; ?>" alt="<?php echo $heading_title; ?>"/></a></li>
          <?php } ?>
          <?php } ?>
        </ul>
        <?php } ?>
      </div>
      <div class="col-sm-8">
        <div class="row">
          <div class="col-sm-6">

              <h2 class="product-desc"><?php echo $description;?></h2>
              <dl>
                <dt>Model Code:<dt><dd id="pcodetitle"></dd>
                <dt>Size:<dt><dd id="product_size"></dd>
                <dt>Orientation:<dt> <dd id="product_size_or"></dd>
                <dt>Material:<dt> <dd id="product_material"></dd>
              </dl>
          </div>

          <!-- start of options drop down -->
          <div class="col-sm-6 options_grey">
            <!-- start product block -->
            <div id="product" >
          <?php echo $prod_var_dropdown; ?>
          <?php if ($options) { ?>
          <hr>
          <h3><?php echo $text_option; ?></h3>
          <?php foreach ($options as $option) { ?>
          <?php if ($option['type'] == 'select') { ?>
          <div class="form-group<?php echo ($option['required'] ? ' required' : ''); ?>">
            <label class="control-label" for="input-option<?php echo $option['product_option_id']; ?>"><?php echo $option['name']; ?></label>
            <select name="option[<?php echo $option['product_option_id']; ?>]" id="input-option<?php echo $option['product_option_id']; ?>" class="form-control">
              <option value=""><?php echo $text_select; ?></option>
              <?php foreach ($option['product_option_value'] as $option_value) { ?>
              <option value="<?php echo $option_value['product_option_value_id']; ?>"><?php echo $option_value['name']; ?>
              <?php if ($option_value['price']) { ?>
              (<?php echo $option_value['price_prefix']; ?><?php echo $option_value['price']; ?>)
              <?php } ?>
              </option>
              <?php } ?>
            </select>
          </div>
          <?php } ?>
          <?php if ($option['type'] == 'radio') { ?>
          <div class="form-group<?php echo ($option['required'] ? ' required' : ''); ?>">
            <label class="control-label"><?php echo $option['name']; ?></label>
            <div id="input-option<?php echo $option['product_option_id']; ?>">
              <?php foreach ($option['product_option_value'] as $option_value) { ?>
              <div class="radio">
                <label>
                  <input type="radio" name="option[<?php echo $option['product_option_id']; ?>]" value="<?php echo $option_value['product_option_value_id']; ?>" />
                  <?php if ($option_value['image']) { ?>
                  <img src="<?php echo $option_value['image']; ?>" alt="<?php echo $option_value['name'] . ($option_value['price'] ? ' ' . $option_value['price_prefix'] . $option_value['price'] : ''); ?>" class="img-thumbnail" />
                  <?php } ?>
                  <?php echo $option_value['name']; ?>
                  <?php if ($option_value['price']) { ?>
                  (<?php echo $option_value['price_prefix']; ?><?php echo $option_value['price']; ?>)
                  <?php } ?>
                </label>
              </div>
              <?php } ?>
            </div>
          </div>
          <?php } ?>
          <?php if ($option['type'] == 'checkbox') { ?>
          <div class="form-group<?php echo ($option['required'] ? ' required' : ''); ?>">
            <label class="control-label"><?php echo $option['name']; ?></label>
            <div id="input-option<?php echo $option['product_option_id']; ?>">
              <?php foreach ($option['product_option_value'] as $option_value) { ?>
              <div class="checkbox">
                <label>
                  <input type="checkbox" name="option[<?php echo $option['product_option_id']; ?>][]" value="<?php echo $option_value['product_option_value_id']; ?>" />
                  <?php if ($option_value['image']) { ?>
                  <img src="<?php echo $option_value['image']; ?>" alt="<?php echo $option_value['name'] . ($option_value['price'] ? ' ' . $option_value['price_prefix'] . $option_value['price'] : ''); ?>" class="img-thumbnail" />
                  <?php } ?>
                  <?php echo $option_value['name']; ?>
                  <?php if ($option_value['price']) { ?>
                  (<?php echo $option_value['price_prefix']; ?><?php echo $option_value['price']; ?>)
                  <?php } ?>
                </label>
              </div>
              <?php } ?>
            </div>
          </div>
          <?php } ?>
          <?php if ($option['type'] == 'text') { ?>
          <div class="form-group<?php echo ($option['required'] ? ' required' : ''); ?>">
            <label class="control-label" for="input-option<?php echo $option['product_option_id']; ?>"><?php echo $option['name']; ?></label>
            <input type="text" name="option[<?php echo $option['product_option_id']; ?>]" value="<?php echo $option['value']; ?>" placeholder="<?php echo $option['name']; ?>" id="input-option<?php echo $option['product_option_id']; ?>" class="form-control" />
          </div>
          <?php } ?>
          <?php if ($option['type'] == 'textarea') { ?>
          <div class="form-group<?php echo ($option['required'] ? ' required' : ''); ?>">
            <label class="control-label" for="input-option<?php echo $option['product_option_id']; ?>"><?php echo $option['name']; ?></label>
            <textarea name="option[<?php echo $option['product_option_id']; ?>]" rows="5" placeholder="<?php echo $option['name']; ?>" id="input-option<?php echo $option['product_option_id']; ?>" class="form-control"><?php echo $option['value']; ?></textarea>
          </div>
          <?php } ?>
          <?php if ($option['type'] == 'file') { ?>
          <div class="form-group<?php echo ($option['required'] ? ' required' : ''); ?>">
            <label class="control-label"><?php echo $option['name']; ?></label>
            <button type="button" id="button-upload<?php echo $option['product_option_id']; ?>" data-loading-text="<?php echo $text_loading; ?>" class="btn btn-default btn-block"><i class="fa fa-upload"></i> <?php echo $button_upload; ?></button>
            <input type="hidden" name="option[<?php echo $option['product_option_id']; ?>]" value="" id="input-option<?php echo $option['product_option_id']; ?>" />
          </div>
          <?php } ?>
          <?php if ($option['type'] == 'date') { ?>
          <div class="form-group<?php echo ($option['required'] ? ' required' : ''); ?>">
            <label class="control-label" for="input-option<?php echo $option['product_option_id']; ?>"><?php echo $option['name']; ?></label>
            <div class="input-group date">
              <input type="text" name="option[<?php echo $option['product_option_id']; ?>]" value="<?php echo $option['value']; ?>" data-date-format="YYYY-MM-DD" id="input-option<?php echo $option['product_option_id']; ?>" class="form-control" />
              <span class="input-group-btn">
              <button class="btn btn-default" type="button"><i class="fa fa-calendar"></i></button>
            </span>
            </div>
          </div>
          <?php } ?>
          <?php if ($option['type'] == 'datetime') { ?>
          <div class="form-group<?php echo ($option['required'] ? ' required' : ''); ?>">
            <label class="control-label" for="input-option<?php echo $option['product_option_id']; ?>"><?php echo $option['name']; ?></label>
            <div class="input-group datetime">
              <input type="text" name="option[<?php echo $option['product_option_id']; ?>]" value="<?php echo $option['value']; ?>" data-date-format="YYYY-MM-DD HH:mm" id="input-option<?php echo $option['product_option_id']; ?>" class="form-control" />
              <span class="input-group-btn">
              <button type="button" class="btn btn-default"><i class="fa fa-calendar"></i></button>
              </span></div>
          </div>
          <?php } ?>
          <?php if ($option['type'] == 'time') { ?>
          <div class="form-group<?php echo ($option['required'] ? ' required' : ''); ?>">
            <label class="control-label" for="input-option<?php echo $option['product_option_id']; ?>"><?php echo $option['name']; ?></label>
            <div class="input-group time">
              <input type="text" name="option[<?php echo $option['product_option_id']; ?>]" value="<?php echo $option['value']; ?>" data-date-format="HH:mm" id="input-option<?php echo $option['product_option_id']; ?>" class="form-control" />
              <span class="input-group-btn">
              <button type="button" class="btn btn-default"><i class="fa fa-calendar"></i></button>
              </span></div>
          </div>
          <?php } ?>
          <?php } ?>
          <?php } ?>
        </div>
        <!-- end product block -->
         </div>
       <!-- end of options drop down -->

        <!-- start of review block -->
         <?php if ($review_status) { ?>
         <div class="rating">
           <p>
             <?php for ($i = 1; $i <= 5; $i++) { ?>
             <?php if ($rating < $i) { ?>
             <span class="fa fa-stack"><i class="fa fa-star-o fa-stack-1x"></i></span>
             <?php } else { ?>
             <span class="fa fa-stack"><i class="fa fa-star fa-stack-1x"></i><i class="fa fa-star-o fa-stack-1x"></i></span>
             <?php } ?>
             <?php } ?>
             <a href="" onclick="$('a[href=\'#tab-review\']').trigger('click'); return false;"><?php echo $reviews; ?></a> / <a href="" onclick="$('a[href=\'#tab-review\']').trigger('click'); return false;"><?php echo $text_write; ?></a></p>
           <hr>
           <!-- AddThis Button BEGIN -->
           <div class="addthis_toolbox addthis_default_style" data-url="<?php echo $share; ?>"><a class="addthis_button_facebook_like" fb:like:layout="button_count"></a> <a class="addthis_button_tweet"></a> <a class="addthis_button_pinterest_pinit"></a> <a class="addthis_counter addthis_pill_style"></a></div>
           <script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-515eeaf54693130e"></script>
           <!-- AddThis Button END -->
         </div>
         <?php } ?>
         <!-- start of review block -->
          </div>
        </div>
      </div>
    </div>
  </div> <!-- start standard product -->
