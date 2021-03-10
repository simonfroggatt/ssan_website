<?php
/**
 * Created by PhpStorm.
 * User: simonfroggatt
 * Date: 08/06/2017
 * Time: 12:04
 */

class ModelSsanProductSpecification extends Model {

    public function getProductMaterialSpecs($product_id)
    {

        $product_variants = new ssan\ProductDetailedInformation($this->registry->get('db'), $product_id);

        $ssan_product_details = new ssan\ProductDetailedInformation($this->registry->get('db'), $product_id);
        //$data['product_detailed_information'] = $ssan_product_details;
        $data['material_specs'] = $ssan_product_details->GetAllMaterials();

        return $data;
    }



}
