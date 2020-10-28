<?php
/**
 * Created by PhpStorm.
 * User: simonfroggatt
 * Date: 05/06/2017
 * Time: 13:38
 */

namespace ssan;

class ProductVariants
{
    private $resellerID;
    private $productVariants;
    private $numberOfVariants;
    private $productID;
    private $productSizes;
    private $sizeMaterialIDs;
    private $productMaterials;
    private $cheapestVariant;

    public function __construct($db, $productID = null, $resellerID = 0)
    {
        $this->db = $db;
        $this->resellerID = $resellerID;

        if(!is_null($productID)) {
            $this->productID = $productID;
            $this->LoadAllVariants($productID);

        }
    }

    public function LoadAllVariants($productID)
    {
        $sql = "SELECT
                ssan_product_variants.id,
                ssan_product_variants.variant_code,
                ssan_product_variants.stock_amount,
                ssan_product_variants.stock_days,
                IF(ssan_product_variants.variant_overide_price > 0, ssan_product_variants.variant_overide_price ,ssan_size_material_comb.size_material_comb_price) AS variant_price,
                ssan_size_material_comb.id as size_material_id,
                ssan_size_material_comb.product_size_id,
                ssan_size_material_comb.product_material_id,
                ssan_product_material.material_name,
                ssan_product_sizes.size_name,
                ssan_product_sizes.size_orientation,
                ssan_product_variants.alternative_image,
                ssan_product_variants.exclude_fpnp,
                ssan_product_variants.gtin";

        $sql .= " FROM ssan_size_material_comb INNER JOIN ssan_product_sizes ON ssan_size_material_comb.product_size_id = ssan_product_sizes.id";

        $sql .= " INNER JOIN ssan_product_material ON ssan_size_material_comb.product_material_id = ssan_product_material.id";
        $sql .= " INNER JOIN ssan_product_variants ON ssan_product_variants.size_material_id = ssan_size_material_comb.id";

        $sql_where = " WHERE ssan_product_variants.product_id = ?";

        $sql_sort = " ORDER BY variant_price ASC";

        $results = $this->db->query($sql . $sql_where . $sql_sort,[$productID]);

        $this->numberOfVariants = $results->num_rows;
        $this->productVariants =  $results->rows;

        if($this->numberOfVariants > 0){
          $this->cheapestVariant = $this->productVariants[0]['id'];
        }
        else {
          $this->cheapestVariant = 0;
        }

        if($this->resellerID > 0) {
            foreach($this->productVariants as $key => $variantData) {
                $reseller_vars = $this->getResellerVariantInfo($variantData['id'], $this->resellerID);
                $this->productVariants[$key]['reseller_variant'] = $reseller_vars;
                if(array_key_exists('price',$reseller_vars)){
                    $this->productVariants[$key]['variant_price'] = $reseller_vars['price'];
                }
            }

        }

      //  echo ($sql . $sql_where . $sql_sort);
        //need to do some checking in here to make sure we are getting infomation back
    }

    public function CreateVariantBulkPrices($arroyOfDiscounts)
    {
        foreach ($this->productVariants as $index => $item) {
            $bulkArray = $this->GetBulkPriceArray($item['variant_price'], $arroyOfDiscounts);

            $this->productVariants[$index]['discount_array'] = $bulkArray;
       }
    }

   public function GetVariantCount()
   {
       return $this->numberOfVariants;

   }

   public function GetVariantArray()
   {
       return $this->productVariants;
   }

   public function GetVariantPrice($variantID)
   {
       $key = array_search($variantID, array_column($this->productVariants, 'id'));
       if(!is_null($key))
           return number_format($this->productVariants[$key]['variant_price'],2);
   }


   public function GetVariantInfoByID($variantID = null, $product_id = null)
   {
     $returnArray = [];

     if(is_null($product_id) || ($product_id != $this->productID))
     {
        $this->LoadAllVariants($product_id);
     }

      foreach ($this->productVariants as $key => $variantData) {
          if($variantData['id'] == $variantID)
          {
              $returnArray['size_id'] = $variantData['product_size_id'];
              $returnArray['size_name'] = $variantData['size_name'];
              $returnArray['size_orientation'] = $variantData['size_orientation'];
              $returnArray['material_id'] = $variantData['product_material_id'];
              $returnArray['material_name'] = $variantData['material_name'];
              $returnArray['variant_price'] = $variantData['variant_price'];
              $returnArray['variant_image'] = $variantData['alternative_image'];
              $returnArray['variant_code'] = $variantData['variant_code'];
              $returnArray['stock_days'] = $variantData['stock_days'];
              $returnArray['stock_amount'] = $variantData['stock_amount'];
              $returnArray['exclude_fpnp'] = $variantData['exclude_fpnp'];
              $returnArray['gtin'] = $variantData['gtin'];

              break;
          }
      }
      return $returnArray;
   }

   public function getSizeOptions()
   {
       $this->loadVariantSizes();
       return $this->productSizes;
   }

   public function getMaterialOptions()
   {
       $this->loadVariantMaterais();
       return $this->productMaterials;
   }

   public function getSizeMaterials()
   {

      $this->sizeMaterialIDs();
   }

   public function createSizeMaterialData()
  {
      $sql = "SELECT DISTINCT ssan_product_sizes.id, 	ssan_product_sizes.size_name, 	ssan_product_sizes.size_code, 	ssan_product_material.id material_id, 	ssan_product_material.material_name, 	ssan_product_sizes.size_orientation, 	ssan_product_sizes.size_width, 	ssan_product_sizes.size_height, ssan_product_sizes.symbol_default_location, ssan_product_material.material_desc, ssan_product_material.material_desc_full, ssan_product_material.image";
      $sql .= " FROM ssan_product_variants INNER JOIN ssan_size_material_comb ON ssan_product_variants.size_material_id = ssan_size_material_comb.id";
	    $sql .= " INNER JOIN ssan_product_material ON ssan_size_material_comb.product_material_id = ssan_product_material.id";
	    $sql .= " INNER JOIN ssan_product_sizes ON ssan_size_material_comb.product_size_id = ssan_product_sizes.id";
      $sql .= " WHERE ssan_product_variants.product_id = ?";
      $sql .= " ORDER BY ssan_product_sizes.id, ssan_product_variants.size_material_id  ASC";

      $results = $this->db->query($sql,[$this->productID]);
      $datarows = $results->rows;

      $sizeArray = [];
      $materialArray = [];

      $currentSizeIndex = -1;
      $currentSizeArray = array('id' => -1 );

      foreach ($datarows as $key => $variantData) {
          if($currentSizeArray['id'] != $variantData['id'])
          {
          //  $currentSizeID = $variantData['id'];
            $currentSizeArray = [];
            $currentSizeArray['id'] = $variantData['id'];
            $currentSizeArray['name'] = $variantData['size_name'];
            $currentSizeArray['orientation'] = $variantData['size_orientation'];
            $currentSizeArray['width'] = $variantData['size_width'];
            $currentSizeArray['height'] = $variantData['size_height'];
            $currentSizeArray['symbol_position'] = $variantData['symbol_default_location'];
            $currentSizeArray['materials'] = [];
            $currentSizeIndex = array_push($sizeArray, $currentSizeArray) - 1;
          }
          $materialTemp = [];
          $materialTemp['id'] = $variantData['material_id'];
          $materialTemp['name'] = $variantData['material_name'];
          array_push($sizeArray[$currentSizeIndex]['materials'], $materialTemp);


      }
      return $sizeArray;


  }

  public function getProductInfo()
  {
    $sql = "SELECT oc_product_description.`name`FROM oc_product_description WHERE oc_product_description.product_id = ?";

    $results = $this->db->query($sql,[$this->productID]);
    $datarows = $results->rows;
    return $datarows[0]['name'];
  }

  public function getSizeMaterialFromVariant($variantID, $websiteID = 0)
  {
    $variantData = [];
    $sql = "SELECT ssan_size_material_comb.product_size_id, ssan_size_material_comb.product_material_id";
    $sql .= " FROM ssan_product_variants INNER JOIN ssan_size_material_comb ON ssan_product_variants.size_material_id = ssan_size_material_comb.id";
    $sql .= " WHERE ssan_product_variants.id = ?";

      $results = $this->db->query($sql,[$variantID]);
    if($results->num_rows == 1){
      $variantData = $results->rows[0];
    }
    return $variantData;
  }

  public function getCheapestID()
  {
    return $this->cheapestVariant;
  }

   private function loadVariantSizes()
   {
      $sql = "SELECT DISTINCT ssan_product_sizes.id, ssan_product_sizes.size_name, ssan_product_sizes.size_code";
      $sql .= " FROM ssan_product_variants INNER JOIN ssan_size_material_comb ON ssan_product_variants.size_material_id = ssan_size_material_comb.id INNER JOIN ssan_product_sizes ON ssan_size_material_comb.product_size_id = ssan_product_sizes.id";
      $sql_where = " WHERE ssan_product_variants.product_id = ?";

      $results = $this->db->query($sql . $sql_where ,[$this->productID]);

      $this->productSizes = $results->rows;

   }

   private function loadVariantMaterais()
   {

     $sql = "SELECT DISTINCT ssan_product_material.material_name, ssan_product_material.id, ssan_product_material.`code`, ssan_product_material.material_desc, ssan_product_material.material_desc_full, ssan_product_material.image";
     $sql .= " FROM ssan_product_variants INNER JOIN ssan_size_material_comb ON ssan_product_variants.size_material_id = ssan_size_material_comb.id  INNER JOIN ssan_product_material ON ssan_size_material_comb.product_material_id = ssan_product_material.id";
     $sql_where = " WHERE ssan_product_variants.product_id = ?";

     $results = $this->db->query($sql . $sql_where ,[$this->productID]);
     $this->productMaterials = $results->rows;
   }


    private function GetBulkPriceArray($price, $bulkArray)
    {
        $singlePriceArray = [];

        foreach ($bulkArray as $item) {
            $discountPerc = 1 - ($item['discount']/100);
            $singlePriceArray[] = number_format($price * $discountPerc,2);
        }

        return $singlePriceArray;
    }

    private function getResellerVariantInfo($variantID, $resellerID)
    {
        $variant_reseller_info = [];

        $reseller_desc = $this->getVariantResellerDescriptions($variantID, $resellerID);

        if(sizeof($reseller_desc) > 0) {
            foreach ($reseller_desc as $key => $data) {
                if($data != null)
                    $variant_reseller_info[$key] = $data;
            }
        }

        $reseller_size_material_price = $this->getVariantResellerSizeMaterialComb($variantID, $resellerID);
        if(sizeof($reseller_size_material_price) > 0){
            $variant_reseller_info['price'] = $reseller_size_material_price['price'];
        }

        $reseller_price_overide = $this->getVariantResellerPriceOverride($variantID, $resellerID);
        if(sizeof($reseller_price_overide) > 0){
            $variant_reseller_info['price'] = $reseller_price_overide['variant_overide_price'];
        }

        return $variant_reseller_info;
    }


    private function getVariantResellerPriceOverride($variantID, $resellerID)
    {
         $sql = "SELECT ssan_reseller_product_variants.variant_code,ssan_reseller_product_variants.variant_overide_price,".
         "ssan_reseller_product_variants.exclude_fpnp FROM ssan_reseller_product_variants WHERE ".
         "ssan_reseller_product_variants.id=? AND ssan_reseller_product_variants.reseller_id=?";
        
        $results = $this->db->query($sql ,[$variantID,$resellerID]);
        if($results->num_rows > 0)
            return $results->rows[0];
        else
            return [];

    }


    private function getVariantResellerSizeMaterialComb($variantID, $resellerID)
    {
        $sql = "SELECT ssan_reseller_sm_combo_price.price FROM ".
                "ssan_product_variants JOIN ssan_reseller_sm_combo_price ON ".
                "ssan_product_variants.size_material_id=ssan_reseller_sm_combo_price.id ".
                "WHERE ssan_product_variants.id=? AND ".
                "ssan_reseller_sm_combo_price.reseller_id=?";
        
        $results = $this->db->query($sql ,[$variantID,$resellerID]);
        if($results->num_rows > 0)
            return $results->rows[0];
        else
            return [];
    }


    private function getVariantResellerDescriptions($variantID, $resellerID)
    {
        $sql = "SELECT ssan_product_variant_description.`name`,ssan_product_variant_description.description,".
                "ssan_product_variant_description.tag,ssan_product_variant_description.meta_title,".
                "ssan_product_variant_description.meta_description,ssan_product_variant_description.meta_keyword,".
                "ssan_product_variant_description.long_description,ssan_product_variant_description.bullet_1,".
                "ssan_product_variant_description.bullet_2,ssan_product_variant_description.bullet_3,".
                "ssan_product_variant_description.bullet_4,ssan_product_variant_description.bullet_5 ".
                "FROM ssan_product_variant_description WHERE ".
                "ssan_product_variant_description.variant_id=? AND ssan_product_variant_description.reseller_id=?";

        $results = $this->db->query($sql ,[$variantID,$resellerID]);
        if($results->num_rows > 0)
            return $results->rows[0];
        else
            return [];
    }







}
