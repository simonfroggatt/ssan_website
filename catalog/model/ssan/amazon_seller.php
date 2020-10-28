<?php


use ssan\ProductVariants;

class ModelSsanAmazonSeller extends Model
{

    private $current_variant_data;
    private $product_id;
    private $CProduct_variants;

    public function getAvailableProducts() {
        $sql = 'SELECT DISTINCT ssan_product_variants.product_id FROM ssan_product_variants WHERE ssan_product_variants.gtin IS NOT NULL';

        $result = $this->db->query($sql);
        return $result->rows;
    }

    public function getProductVariantData($product_id)
    {
        $this->product_id = $product_id;
        $variant_data = [];
        $variant_data['has_variants'] = 0;
        $variant_data['variant_type'] = '';


        $this->CProduct_variants = new ssan\ProductVariants($this->registry->get('db'), $product_id);
        $variant_data['variants'] = $this->CProduct_variants->GetVariantArray();
        $variant_count = $this->CProduct_variants->GetVariantCount();
        if($variant_count > 1) {
            $variant_data['has_variants'] = 1;
            $sizes = $this->CProduct_variants->getSizeOptions();
            if(sizeof($sizes) > 1) {
                $variant_data['variant_type'] = 'material-size';
            }
            else {
                $variant_data['variant_type'] = 'Material';
            }
        }
        else {
            $variant_data['variant_type'] = 'None';
        }

        $this->current_variant_data = $variant_data;
        return $variant_data;
    }

    public function getSizeMaterialMatrix($product_id)
    {
        if($product_id != $this->product_id){
            $this->getProductVariantData($product_id);
        }

        $sizes = $this->CProduct_variants->getSizeOptions();
        $materials = $this->CProduct_variants->getMaterialOptions();

        $size_material_matrix = [];
        foreach ($sizes as $size_id){
            foreach($materials as $material_id){
                array_push($size_material_matrix, array('size_id' => $size_id['id'], 'material_id' => $material_id['id']));
            }
        }

        return $size_material_matrix;
    }

}



