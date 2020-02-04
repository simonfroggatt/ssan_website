<?php
class ModelExtensionFeedGoogleMerchantSsan extends Model {
    public function getActiveProducts(){
  				$query = $this->db->query("SELECT * FROM " . DB_PREFIX . "product WHERE status = 1 ORDER BY sort_order ASC");
  				return $query->rows;
        }


    public function GetAllAvailableProducts()
    {
        $sql = "SELECT DISTINCT " . SSAN_DB_PREFIX . "product_variants.product_id";
        $sql .= " FROM " . DB_PREFIX . "product INNER JOIN " . SSAN_DB_PREFIX . "product_variants ON " . DB_PREFIX . "product.product_id = " . SSAN_DB_PREFIX . "product_variants.product_id";
    	 $sql .= " INNER JOIN " . DB_PREFIX . "product_to_category ON " . DB_PREFIX . "product.product_id = " . DB_PREFIX . "product_to_category.product_id";
    	 $sql .= " INNER JOIN " . DB_PREFIX . "category ON " . DB_PREFIX . "product_to_category.category_id = " . DB_PREFIX . "category.category_id";
       $sql .= " WHERE " . DB_PREFIX . "category.`status` = 1 AND " . DB_PREFIX . "product.`status` = 1 AND " . DB_PREFIX . "product.include_google_merchant = 1";
       $sql .= " ORDER BY " . SSAN_DB_PREFIX . "product_variants.id";

       $query = $this->db->query($sql);
       return $query->rows;
     }
}
