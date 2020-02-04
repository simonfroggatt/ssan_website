<?php
header('Content-Type: application/json');

//$product_bulk_prices = new ssan\ProductBulkDiscount($this->registry->get('db'), $product_id);


echo json_encode(array(
    "status"    => true,
    "error"     => null,
    "data"      => array(
        "category"   => array(
                "prohition", "construction", "fire exit"
            ),
        "product"   => array(
            "it is against the law to smoke in this vehicle", "danger keep out", "do not pass", "no smoking"
        )
    )
));
/*
//Safety Signs - index.php?route=product/category&path=3
//No Smoking - index.php?route=product/category&path=3_2
//Prohibition - index.php?route=product/category&path=3_1

//No Smoking - index.php?route=product/product&path=3_1&product_id=1
*/
?>
