<?php $idStr = "_".$symbolSignID.'_'.$symbolNumID;?>

  <div id="symbol-slideshow<?php echo $idStr;?>" class="owl-carousel">
  <?php foreach ($symbolData as $symbolInfo) { ?>
    <?php $symbolIDRef = $symbolNumID."_".$symbolInfo['id']; ?>
    <div  class="symbol-thumb">
      <div class="image"><img id="symbol_0_<?php echo $symbolInfo['id']; ?>" src="image/<?php echo $symbolInfo['image_path']; ?>" alt="<?php echo $symbolInfo['refenceno']; ?>" title="<?php echo $symbolInfo['referent']; ?>" class="img-responsive bespokeSymbol" /></div>
      <div class="caption" id="caption_0_<?php echo $symbolInfo['id']; ?>">
        <h5><?php echo $symbolInfo['refenceno']; ?></h5>
      </div>
    </div>


  <?php } ?>

</div>
<div class="row">
  <div class="col-md-12">
    <div class="form-group row symbolSliderRow">
    <label class="col-sm-2 col-md-2 col-form-label" for="symbolSlider">Symbol Size</label>
      <div class="col-sm-10 col-md-10 "><input
          type="range"
          min="75"                    // default 0
          max="100"                  // default 100
          step="2.5"                   // default 1
          value="90"                 // default min + (max-min)/2
          id="symbolSlider"
          >
      </div>
    </div>
  </div>
</div>


<script type="text/javascript"><!--

$(document).ready(function(){
  $('#symbol-slideshow<?php echo $idStr;?>').owlCarousel({
  	//items: 12,
    nav: true,
    loop: false,
    pagination: true,
    smartSpeed :900,
    navSpeed: 200,
    margin: 10,
    autoWidth: true,
    navText: ['<i class="fa fa-chevron-left fa-2x"></i>', '<i class="fa fa-chevron-right fa-2x"></i>'],
    responsiveClass:true,
    responsive:{
        0:{
      //      items:4,
            slideBy: 4,
          //  nav:true
        },
        600:{
      //      items:8,
            slideBy: 8,
          //  nav:true
        },
        800:{
    //        items:8,
            slideBy: 8,
          //  nav:true
        },
        1000:{
      //      items:12,
            slideBy: 12,
          //  nav:true,
            pagination: true,
        }
    }
  });
})

--></script>
