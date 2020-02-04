<?php


class ModelSsanGoogleProductMarkup extends Model {

    function getProductVariantDetails($product_id)
    {
        $product_variants = new ssan\ProductVariants($this->registry->get('db'), $product_id);

        $data = $product_variants->GetVariantArray();

        return $data;

    }

    function getGoogleCategory($catID)
    {

      $db = $this->registry->get('db');
      $googleCatID = 5892;

      $sql = 'SELECT oc_google_base_category_to_category.google_base_category_id FROM oc_google_base_category_to_category WHERE oc_google_base_category_to_category.category_id = ' . $catID ;
      $query = $this->db->query($sql);

      if($query->num_rows > 0)
      {
        $googleCatID = $query->rows[0]['google_base_category_id'];
      }

  		return $googleCatID;
    }


}

?>
