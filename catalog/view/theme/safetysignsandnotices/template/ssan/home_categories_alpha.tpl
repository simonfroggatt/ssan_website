 <div class="row">
  <?php foreach ($categories as $category) { ?>
  <div class="col-lg-2 col-md-2 col-sm-3 col-xs-6 category-thumb">

    <div class="cat-caption" >
      <a href="<?php echo $category['href']; ?>">
        <div class=""><img width="150px" src="<?php echo $category['image']; ?>" alt="<?php echo $category['name']; ?>" title="<?php echo $category['name']; ?>" class="img-responsive" /></div>
        <div class="cat-caption-text"><?php echo $category['name']; ?>
        </div>
        </a>

    </div>

  </div>
  <?php } ?>
</div>
