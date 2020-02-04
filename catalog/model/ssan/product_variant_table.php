<?php
/**
 * Created by PhpStorm.
 * User: simonfroggatt
 * Date: 08/06/2017
 * Time: 12:04
 */

class ModelSsanProductVariantTable extends Model {

    public function getVariantTableInfo($product_id)
    {
        $variant_table_info = [];

        $product_bulk_prices = new ssan\ProductBulkDiscount($this->registry->get('db'), $product_id);
        $data['bulk_discount_group_titles'] = $product_bulk_prices->GetDiscountTitles();
        $data['bulk_discount_group_ranges'] = $product_bulk_prices->GetDiscountRanges();
        $data['bulk_discount_price_count'] = $product_bulk_prices->GetBulkDiscountCount();

        $product_variants = new ssan\ProductVariants($this->registry->get('db'), $product_id);

        $product_variants->CreateVariantBulkPrices($product_bulk_prices->GetArrayOfDiscounts());
        $data['product_table_data'] = $product_variants->GetVariantArray();

        $ssan_product_details = new ssan\ProductDetailedInformation($this->registry->get('db'), $product_id);
        //$data['product_detailed_information'] = $ssan_product_details;
        $data['is_bespoke'] = $ssan_product_details->GetIsBespoke();

        return $data;
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
