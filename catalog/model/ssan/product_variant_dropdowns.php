
<?php

class ModelSsanProductVariantDropdowns extends Model
{
    public function getVariantDopdownInfo($product_id)
    {
        /*  $variant_table_info = [];


          $product_bulk_prices = new ssan\ProductBulkDiscount($this->registry->get('db'), $product_id);
          $data['bulk_discount_group_titles'] = $product_bulk_prices->GetDiscountTitles();
          $data['bulk_discount_group_ranges'] = $product_bulk_prices->GetDiscountRanges();
          $data['bulk_discount_price_count'] = $product_bulk_prices->GetBulkDiscountCount();



          $product_variants->CreateVariantBulkPrices($product_bulk_prices->GetArrayOfDiscounts());
          $data['product_table_data'] = $product_variants->GetVariantArray();

          $ssan_product_details = new ssan\ProductDetailedInformation($this->registry->get('db'), $product_id);
          $data['product_detailed_information'] = $ssan_product_details;

          return $data;*/


        $product_variants = new ssan\ProductVariants($this->registry->get('db'), $product_id);

        $data['variant_size_materials'] = $product_variants->createSizeMaterialData();


        $data['variant_data'] = $product_variants->GetVariantArray();
        $data['variant_sizes'] = $product_variants->getSizeOptions();
        //  $data['variant_size_materials'] = $product_variants->getSizeMaterials();
        $data['variant_materials'] = $product_variants->getMaterialOptions();

        $data['product_name'] = $product_variants->getProductInfo();

        $data['cheapest_variant'] = $product_variants->getCheapestID();

        //see if we linking from the cart - if so get the size / matieral id and set this
        $variantid = 0;
        if (isset($this->request->get['variantid'])) {
            $variantid  = $this->request->get['variantid'];
            $data['cart_product_variant'] = $product_variants->getSizeMaterialFromVariant($variantid);
        }


        //$data['cart_product_variant_id'] =


        //print_r($data['variant_size_materials']);
        return $data;
    }

    /*
    $data['variants'] = array();
            $data['variants'] = $this->model_catalog_product->getProductVariants($this->request->get['product_id']);

            $data['vSizes'] = array();
            $data['vSizes'] = $this->model_catalog_product->getVSizes($this->request->get['product_id']);


            $data['vMaterials'] = array();
            $data['vMaterials'] =  $this->model_catalog_product->getVMaterials($this->request->get['product_id']);

            $data['vOptionClasses'] = array();
            $data['vOptionClasses'] = $this->model_catalog_product->getVariantOptionClasses($this->request->get['product_id']);

            $data['vSizeMatClasses'] = array();
            $data['vSizeMatClasses'] = $this->model_catalog_product->getVariantSizeMatClasses($this->request->get['product_id']);

            $data['vOptClassesValues'] = array();
            $data['vOptClassesValues'] = $this->model_catalog_product->getOptionClassValues($this->request->get['product_id']);

            $data['MaterialsDesc'] = array();
            $data['MaterialsDesc'] =  $this->model_catalog_product->getMaterialDescriptions($this->request->get['product_id']);


            $data['vCurrency'] = $this->session->data['currency'];


            $data['vProdTaxRate'] = $this->tax->getRates(100, $product_info['tax_class_id']);

            $data['vAllVariants'] = array();
            $data['vAllVariants'] = $this->model_catalog_product->getProductVariantList($this->request->get['product_id']);
      */
}
