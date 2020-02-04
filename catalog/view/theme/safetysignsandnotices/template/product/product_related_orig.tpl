<!-- start of related products -->
<?php if ($products) { ?>
<h3><?php echo $text_related; ?></h3>
<div class="row">
<?php $i = 0; ?>
<?php foreach ($products as $product) { ?>
<?php if ($column_left && $column_right) { ?>
<?php $class = 'col-xs-8 col-sm-6'; ?>
<?php } elseif ($column_left || $column_right) { ?>
<?php $class = 'col-xs-6 col-md-4'; ?>
<?php } else { ?>
<?php $class = 'col-xs-6 col-sm-3'; ?>
<?php } ?>

<div class="<?php echo $class; ?>">
  <div class="product-thumb transition">
    <div class="image"><a href="<?php echo $product['href']; ?>"><img src="<?php echo $product['thumb']; ?>" alt="<?php echo $product['name']; ?>" title="<?php echo $product['name']; ?>" class="img-responsive" /></a></div>
    <div class="caption">
      <h4><a href="<?php echo $product['href']; ?>"><?php echo $product['name']; ?></a></h4>
      <p><?php echo $product['description']; ?></p>
      <?php if ($product['rating']) { ?>
      <div class="rating">
        <?php for ($j = 1; $j <= 5; $j++) { ?>
        <?php if ($product['rating'] < $j) { ?>
        <span class="fa fa-stack"><i class="fa fa-star-o fa-stack-1x"></i></span>
        <?php } else { ?>
        <span class="fa fa-stack"><i class="fa fa-star fa-stack-1x"></i><i class="fa fa-star-o fa-stack-1x"></i></span>
        <?php } ?>
        <?php } ?>
      </div>
      <?php } ?>
      <?php if ($product['price']) { ?>
      <p class="price">
        <?php if (!$product['special']) { ?>
        <?php echo $product['price']; ?>
        <?php } else { ?>
        <span class="price-new"><?php echo $product['special']; ?></span> <span class="price-old"><?php echo $product['price']; ?></span>
        <?php } ?>
        <?php if ($product['tax']) { ?>
        <span class="price-tax"><?php echo $text_tax; ?> <?php echo $product['tax']; ?></span>
        <?php } ?>
      </p>
      <?php } ?>
    </div>
    <div class="button-group">
      <button type="button" onclick="cart.add('<?php echo $product['product_id']; ?>', '<?php echo $product['minimum']; ?>');"><span class="hidden-xs hidden-sm hidden-md"><?php echo $button_cart; ?></span> <i class="fa fa-shopping-cart"></i></button>
      <button type="button" data-toggle="tooltip" title="<?php echo $button_wishlist; ?>" onclick="wishlist.add('<?php echo $product['product_id']; ?>');"><i class="fa fa-heart"></i></button>
      <button type="button" data-toggle="tooltip" title="<?php echo $button_compare; ?>" onclick="compare.add('<?php echo $product['product_id']; ?>');"><i class="fa fa-exchange"></i></button>
    </div>
  </div>
</div>
<?php if (($column_left && $column_right) && (($i+1) % 2 == 0)) { ?>
<div class="clearfix visible-md visible-sm"></div>
<?php } elseif (($column_left || $column_right) && (($i+1) % 3 == 0)) { ?>
<div class="clearfix visible-md"></div>
<?php } elseif (($i+1) % 4 == 0) { ?>
<div class="clearfix visible-md"></div>
<?php } ?>
<?php $i++; ?>
<?php } ?>
</div>
<?php } ?>
<!-- end of related products -->
