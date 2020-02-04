<?php

// Configuratio
include('../../../../../../config.php');

// Startup
//require_once(DIR_SYSTEM . 'startup.php');
require_once(DIR_SYSTEM . '/library/db/mpdo.php');
require_once(DIR_SYSTEM . '/library/ssan/dynamicsearch.php');

$db = new DB\mPDO(DB_HOSTNAME,  DB_USERNAME, DB_PASSWORD, DB_DATABASE);
$CdynSearch = new Ssan\DynamicSearch($db);

$query = (!empty($_GET['q'])) ? strtolower($_GET['q']) : null;

if (!isset($query)) {
die('Invalid query.');
}

$CdynSearch->getDynamicSearchByQuery($query);

$CdynSearch->GetDynamicSearchData();


$resultCategories = $CdynSearch->GetDynamicSearchCategories();
$resultProduct = $CdynSearch->GetDynamicSearchProducts();


//$resultCode =  $CdynSearch->GetDynamicSearchProductCode();
//route=product/category&path= - category
//route=product/product&path=268_544&product_id=40815  - product with category path

header('Content-Type: application/json');

echo json_encode(array(
  "status" => true,
  "error"  => null,
    "data"   => array(
        "category"      => $resultCategories ,
        "product"   => $resultProduct
    )
));


?>
