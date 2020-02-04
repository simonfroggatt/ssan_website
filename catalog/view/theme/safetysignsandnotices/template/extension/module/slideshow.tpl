
<div id="owl-carousel-header">
  <div class="row hidden-xs">
    <div class="col-xs-10">

      <div id="slideshow<?php echo $module; ?>" class="owl-carousel " style="opacity: 1;">
        <?php foreach ($banners as $banner) { ?>
        <div >
          <?php if ($banner['link']) { ?>
          <a href="<?php echo $banner['link']; ?>"><img src="<?php echo $banner['image']; ?>" alt="<?php echo $banner['title']; ?>" class="img-responsive" /></a>
          <?php } else { ?>
          <img src="<?php echo $banner['image']; ?>" alt="<?php echo $banner['title']; ?>" class="img-responsive" />
          <?php } ?>
        </div>
        <?php } ?>
      </div>
    </div>


    <div class="col-xs-2">
      <img src="image/catalog/banners/home_right_banner.gif" title="Free Shipping" alt="Free shipping on orders over £75" class="img-responsive " />
    </div>
  </div>
<div class="row visible-xs">
  <div class="col-xs-12 free-ship">
      <img src="image/svg/free_ship_xs.svg" title="Free Shipping" alt="Free shipping on orders over £75" class="img-responsive " />
  </div>
</div>
</div>


<script><!--


$(document).ready(function(){
  $('#slideshow<?php echo $module; ?>').owlCarousel({
  	items: 1,
  	autoplay: true,
    autoplayTimeout: 4000,
    loop: true,
  	nav: true,
    pagination: false,
    smartSpeed :1500,
    navText: ['<i class="fa fa-chevron-left fa-5x"></i>', '<i class="fa fa-chevron-right fa-5x"></i>']
  });
})
--></script>
<!--  -->
