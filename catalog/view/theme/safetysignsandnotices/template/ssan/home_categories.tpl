<div class="row">
  <?php foreach ($categories as $category) { ?>
  <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12 category-thumb">
    <div class="cat-caption" >
      <a href="<?php echo $category['href']; ?>">
        <div class="">
        <img src="<?php echo $category['image']; ?>" alt="<?php echo $category['name']; ?>" title="<?php echo $category['name']; ?>" class="img-responsive" />
        </div>
        <div class="cat-caption-text"><?php echo $category['name']; ?></div>
      </a>
    </div>
  </div>
  <?php } ?>
</div>
