<?php
/**
 * Created by PhpStorm.
 * User: simonfroggatt
 * Date: 06/06/2017
 * Time: 10:41
 */

namespace ssan;


class ProductDetailedInformation
{

    private $productID;
    private $arrayOfMaterials;
    private $arrayOfSpecifications;
    private $isBespoke = false;

    public function __construct($db, $productID = null)
    {
        $this->db = $db;

        if (!is_null($productID)) {
            $this->productID = $productID;
            $this->LoadAllProductInfomation();

        }
    }

    public function GetAllMaterials(): Array
    {
        return $this->arrayOfMaterials;
    }

    public function GetProductSpecifications(): Array
    {
        return $ths->arrayOfSpecifications;
    }

    public function SetProductID($productID): Int
    {
        $this->productID = $productID;
    }

    public function LoadAllProductInfomation()
    {
        $this->LoadAllMaterials();
        $this->LoadAllProductSpecifications();
        $this->isProductBespoke();
    }

    public function GetIsBespoke()
    {
      return $this->isBespoke;
    }

    private function LoadAllMaterials()
    {
        $sql = "SELECT DISTINCT ssan_product_material.*
                FROM ssan_product_variants INNER JOIN ssan_size_material_comb ON ssan_product_variants.size_material_id = ssan_size_material_comb.id
	            INNER JOIN ssan_product_material ON ssan_size_material_comb.product_material_id = ssan_product_material.id
                WHERE ssan_product_variants.product_id = ?";

        $params = array($this->productID);
        $results = $this->db->query($sql,$params);

        $this->arrayOfMaterials =  $results->rows;
    }

    private function LoadAllProductSpecifications()
    {

    }

    private function isProductBespoke(){
      $sql = "SELECT  oc_product.is_bespoke FROM oc_product WHERE oc_product.product_id = ?";

      $params = array($this->productID);

      $results = $this->db->query($sql,[$this->productID]);
      if($results->num_rows == 1){
          $this->isBespoke =  $results->row['is_bespoke'];
        }
      }





}
