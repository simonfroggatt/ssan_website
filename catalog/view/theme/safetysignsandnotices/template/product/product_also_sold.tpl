<!-- start of related products -->
<?php if ($also_sold_products) { ?>
<div id="also-sold-slideshow" class="owl-carousel">
  <?php foreach ($also_sold_products as $product) { ?>
    <div  class="product-thumb">
      <div class="image"><a href="<?php echo $product['href']; ?>"><img src="<?php echo $product['thumb']; ?>" alt="<?php echo $product['name']; ?>" title="<?php echo $product['name']; ?>" class="img-responsive" /></a></div>
      
    </div>

  <?php } ?>

<?php $product_count = (sizeof($products) <= 6) ? sizeof($products): 6; ?>

</div>

<script type="text/javascript"><!--
$(document).ready(function(){
  $('#also-sold-slideshow').owlCarousel({
  	items: <?php echo $product_count; ?>,
    nav: true,
    loop: false,
    pagination: false,
    smartSpeed :900,
    navSpeed: 200,
    navText: ['<i class="fa fa-chevron-left fa-5x"></i>', '<i class="fa fa-chevron-right fa-5x"></i>'],
    responsiveClass:true,
    responsive:{
        0:{
            items:2,
            slideBy: 2,
            nav:true,
            loop:( $('.item').length > 2 )
        },
        600:{
            items: 4,
            slideBy: 4,
            nav:true,
            loop:( $('.item').length > 4 )
        },
        800:{
            items: 4,
            slideBy: 4,
            nav:true,
            loop:( $('.item').length > 4 )
        },
        1000:{
            items: 8,
            slideBy: 6,
            nav:true,
            loop:( $('.item').length > 6 )
        }
    }
  });
})
--></script>

<?php } ?>
