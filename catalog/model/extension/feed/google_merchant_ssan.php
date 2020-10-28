<?php
class ModelExtensionFeedGoogleMerchantSsan extends Model {
    public function getActiveProducts(){
  				$query = $this->db->query("SELECT * FROM " . DB_PREFIX . "product WHERE status = 1 ORDER BY sort_order ASC");
  				return $query->rows;
        }


    public function GetAllAvailableProducts()
    {

        $sql = "SELECT DISTINCT " . DB_PREFIX . "product.product_id FROM " .
                DB_PREFIX . "product JOIN " . SSAN_DB_PREFIX . "product_variants " .
               "ON " . DB_PREFIX . "product.product_id=" . SSAN_DB_PREFIX . "product_variants.product_id " .
               "WHERE " . DB_PREFIX . "product.`status`=1 AND " . SSAN_DB_PREFIX . "product_variants.gtin " .
               "IS NOT NULL ORDER BY " . DB_PREFIX . "product.product_id ASC";

       $query = $this->db->query($sql);
       return $query->rows;
     }
}
