<?php
/**
 * Created by PhpStorm.
 * User: simonfroggatt
 * Date: 08/06/2017
 * Time: 12:04
 */

class ModelSsanJasperInvoice extends Model {

    public function getVariantTableInfo($product_id)
    {

        $product_bulk_prices = new ssan\ProductBulkDiscount($this->registry->get('db'), $product_id);


        //return $data;
    }

    public function getVariantMarkupInfo($product_id)
    {
        $productMarkUp = [];
        $product_bulk_prices = new ssan\ProductBulkDiscount($this->registry->get('db'), $product_id);
        $product_variants = new ssan\ProductVariants($this->registry->get('db'), $product_id);

        $product_variants->CreateVariantBulkPrices($product_bulk_prices->GetArrayOfDiscounts());

        $productMarkUp['productMarkUpData'] = $product_variants->GetVariantArray();
        $productMarkUp['bulkDiscountCount'] = $product_bulk_prices->GetBulkDiscountCount();

        /*$minMax = $product_bulk_prices->getMinMaxPrice();

        $productMarkUp['minmax'] = $minMax;
*/
        return $productMarkUp;

    }

    private function getVariantMinMaxPrices()
    {

    }


}
