<script type="application/ld+json">
{
 "@context": "http://schema.org/",
  "@type": "Product",
  "name": "<?php echo $productMarkupInformation['name']; ?>",
  "image": [
    "https://www.safetysignsandnotices.co.uk/image/<?php echo $productMarkupInformation['image']; ?>"   ],
  "description": "<?php echo $productMarkupInformation['description']; ?>",
  "offers": [
  <?php foreach($productMarkUpData as $key => $productData ) { ?>
    <?php if($key > 0) echo ","; ?>
    {
      "@type": "Offer",
      "priceCurrency": "GBP",
      "price": "<?php echo round($productData['discount_array'][0] * 1.2,2) ; ?>",
      "itemCondition": "http://schema.org/NewCondition",
      "availability": "http://schema.org/InStock",
      "itemOffered" :
      {
        "description" : "<?php echo $productMarkupInformation['description']; ?> ",
        "name" : "<?php echo $productMarkupInformation['name']; ?> - <?php echo $productData['size_name'];?> <?php echo $productData['material_name'];?>"
      },
      "seller": {
        "@type": "Organization",
        "name": "Safety Sign and Notices"
      },

      "url" : "<?php echo $productMarkupInformation['baseurl']."?variantid=". $productData['id']?>"
    },
    {
      "@type": "AggregateOffer",
      "priceCurrency": "GBP",
      "lowPrice": "<?php echo round($productData['discount_array'][$bulkDiscountCount-1] * 1.2,2); ?>",
      "highPrice": "<?php echo round($productData['discount_array'][0] * 1.2,2); ?>",
      "itemCondition": "http://schema.org/NewCondition",
      "availability": "http://schema.org/InStock",
      "itemOffered" :
      {
        "description" : "<?php echo $productMarkupInformation['description']; ?>",
        "name" : "<?php echo $productMarkupInformation['name']; ?> - <?php echo $productData['size_name'];?> <?php echo $productData['material_name'];?>"
      },
      "seller": {
        "@type": "Organization",
        "name": "Safety Sign and Notices"
      }
    }
    <?php }?>
  ]
}
</script>
