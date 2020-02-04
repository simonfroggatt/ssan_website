
<hr class="red">
<h3><?php echo $heading_title; ?></h3>
<div id="recent-slideshow" class="owl-carousel">
  <?php foreach ($products as $product) { ?>
    <div  class="product-thumb">
      <div class="image"><a href="<?php echo $product['href']; ?>"><img src="<?php echo $product['thumb']; ?>" alt="<?php echo $product['name']; ?>" title="<?php echo $product['name']; ?>" class="img-responsive" /></a></div>
      <div class="caption">
        <h5><a href="<?php echo $product['href']; ?>"><?php echo $product['name']; ?></a></h5>
      </div>
    </div>

  <?php } ?>
</div>

<script type="text/javascript"><!--
$(document).ready(function(){
  $('#recent-slideshow').owlCarousel({
  	items: 6,
    nav: true,
    loop: true,
    pagination: false,
    smartSpeed :900,
    navSpeed: 200,
    navText: ['<i class="fa fa-chevron-left fa-5x"></i>', '<i class="fa fa-chevron-right fa-5x"></i>'],
    responsiveClass:true,
    responsive:{
        0:{
            items:2,
            slideBy: 2,
            nav:true
        },
        600:{
            items:4,
            slideBy: 4,
            nav:true
        },
        800:{
            items:4,
            slideBy: 4,
            nav:true
        },
        1000:{
            items:6,
            slideBy: 6,
            nav:true
        }
    }
  });
})
--></script>
