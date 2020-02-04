<div class="row"> <!-- start standard product -->
  <div class="col-sm-12">
      <h1><?php echo $heading_title; ?></h1>
    <div class="row">
      <div class="col-sm-6">
        <?php if ($thumb || $images) { ?>
        <ul class="thumbnails">
          <?php if ($thumb) { ?>
          <li><a class="thumbnail" id="productImagePopup" href="<?php echo $popup; ?>" title="<?php echo $heading_title; ?>"><img src="<?php echo $thumb; ?>" title="<?php echo $heading_title; ?>" alt="<?php echo $heading_title; ?>" id="productImage" class="imageSVG"/></a></li>
          <?php } ?>
          <?php if ($images) { ?>
          <?php foreach ($images as $image) { ?>
          <li class="image-additional"><a class="thumbnail" href="<?php echo $image['popup']; ?>" title="<?php echo $heading_title; ?>"> <img src="<?php echo $image['thumb']; ?>" title="<?php echo $heading_title; ?>" alt="<?php echo $heading_title; ?>"/></a></li>
          <?php } ?>
          <?php } ?>
        </ul>
        <?php } ?>
      </div>
      <div class="col-sm-6">
        <div class="row">


          <!-- start of options drop down -->
          <div class="col-sm-12 options_grey">
            <!-- start product block -->
            <div id="product" >
          <?php echo $prod_var_bespoke_dropdown; ?>

            </div>
        <!-- end product block -->
          </div>
       <!-- end of options drop down -->


          </div>
        </div>
      </div>
    </div>
  </div> <!-- start standard product -->
