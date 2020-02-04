<?php

namespace Ssan;
ini_set('memory_limit', '1024M');

class DynamicSearch
{

    private $db;
    private $queryin;
    private $rawCategoryData;
    private $rawProductData;

    private $dynSearchCatData;
    private $dynSearchProductData;
    private $dynSearchProductCode;

    public function __construct($db) {
      $this->db = $db;
      //$this->GetCategoryInfo();
      //$this->GetProductInfomation();
    }

    public function getDynamicSearchByQuery($query)
    {
        $this->queryin = $this->prepareInputQuery($query);
        $this->GetCategoryInfoByQuery();
        $this->GetProductInfomationByQuery();

    }

    private function prepareInputQuery($query)
    {
      $tmp = "%".str_replace(' ', '%', $query)."%";
      return $tmp;
    }

    public function GetDynamicSearchData()
    {
        $this->CreateDynSearchCategoryInfo();
        $this->CreateDynSearchProductInfo();

    }

    public function GetDynamicSearchCategories()
    {
        return $this->dynSearchCatData;
    }

    public function GetDynamicSearchProducts()
    {
      return $this->dynSearchProductData;
    }

    public function GetDynamicSearchProductCode()
    {
      return $this->dynSearchProductCode;
    }

    private function GetCategoryInfoByQuery()
    {
      $sql = "SELECT DISTINCT oc_category.category_id, oc_category.parent_id, oc_category_description.`name`, oc_category.image";
      $sql .= " FROM oc_category INNER JOIN oc_category_description ON oc_category.category_id = oc_category_description.category_id";
      $sql .= " WHERE oc_category.`status` = 1";
      $sql .= " AND oc_category_description.`name` LIKE ?";
      $sql .= " LIMIT 20";

      $results = $this->db->query($sql,[$this->queryin]);
      $this->rawCategoryData = $results->rows;
    }

    private function GetCategoryInfo()
    {

        $sql = "SELECT DISTINCT oc_category.category_id, oc_category.parent_id, oc_category_description.`name`, oc_category_description.description";
        $sql .= " FROM oc_category INNER JOIN oc_category_description ON oc_category.category_id = oc_category_description.category_id";
        $sql .= " WHERE oc_category.`status` = 1";

        $results = $this->db->query($sql);
        $this->rawCategoryData = $results->rows;
    }

    private function GetProductInfomationByQuery()
    {
        $sql = "SELECT DISTINCT oc_product.product_id, oc_product.image, oc_product_description.`name`, oc_product_description.description, oc_product_description.meta_keyword , oc_category.category_id, oc_category.parent_id, ssan_product_variants.variant_code, REPLACE(ssan_product_variants.variant_code, ' ', '') as codestripped, oc_product.price";
      //$sql = "SELECT DISTINCT oc_product.product_id, oc_product.image, oc_product_description.`name`,  ssan_product_variants.variant_code, REPLACE(ssan_product_variants.variant_code, ' ', '') as codestripped";

        $sql .= " FROM oc_product INNER JOIN oc_product_description ON oc_product.product_id = oc_product_description.product_id";
	    $sql .= " INNER JOIN oc_product_to_category ON oc_product.product_id = oc_product_to_category.product_id";
	    $sql .= " INNER JOIN ssan_product_variants ON oc_product.product_id = ssan_product_variants.product_id";
        $sql .= " INNER JOIN oc_category ON oc_product_to_category.category_id = oc_category.category_id";
        $sql .= " WHERE (oc_product_description.`name`  LIKE ? OR oc_product_description.description LIKE ? OR oc_product_description.meta_keyword LIKE ? OR REPLACE(ssan_product_variants.variant_code, ' ', '') LIKE ? )";
        $sql .= " AND ( oc_category.`status` = 1 ) AND (oc_product.status = 1) GROUP BY oc_product.product_id ";
        $sql .= 'ORDER BY oc_product.price ASC';
        if(strlen($this->queryin) < 8) {
          $sql .= " LIMIT 20";
        }
        else {
          $sql .= " LIMIT 100";
        }

        $results = $this->db->query($sql,[$this->queryin,$this->queryin, $this->queryin, $this->queryin]);
        $this->rawProductData = $results->rows;

    }

    private function GetProductInfomation()
    {
        $sql = "SELECT DISTINCT oc_product.product_id, oc_product.image, oc_product_description.`name`, oc_category.category_id, oc_category.parent_id, ssan_product_variants.variant_code, ";
        $sql .= " FROM oc_product INNER JOIN oc_product_description ON oc_product.product_id = oc_product_description.product_id";
	    $sql .= " INNER JOIN oc_product_to_category ON oc_product.product_id = oc_product_to_category.product_id";
	    $sql .= " INNER JOIN ssan_product_variants ON oc_product.product_id = ssan_product_variants.product_id";
        $sql .= " INNER JOIN oc_category ON oc_product_to_category.category_id = oc_category.category_id";

        $results = $this->db->query($sql);
        $this->rawProductData = $results->rows;

    }


    private function CreateDynSearchCategoryInfo()
    {
        $this->dynSearchCatData = [];
        foreach ($this->rawCategoryData as $rawCat) {
            $tempCatData = [];
            $tempCatData['title'] = $rawCat['name'];
            $tempCatData['path'] = $rawCat['category_id'];
            $tempCatData['image'] = $rawCat['image'];
            if($rawCat['parent_id'] > 0)
            {
              $tempCatData['path'] = $rawCat['parent_id'] . '_'.$rawCat['category_id'];
            //  $tempCatData['path'] .= '_'.$rawCat['parent_id'];
            }
            $this->dynSearchCatData[] = $tempCatData;
        }
    }



    private function CreateDynSearchProductInfo()
    {
        $this->dynSearchProductData = [];
        foreach ($this->rawProductData as $rawProduct) {
            $tempProductData = [];
            $tempProductData['title'] = mb_strimwidth($rawProduct['name'],0,70,"...") . ' - '.$rawProduct['variant_code'];
            $tempProductData['path'] = $rawProduct['product_id'];
            $tempProductData['image'] = $rawProduct['image'];
            $tempProductData['category_path'] = $rawProduct['category_id'];
            $tempProductData['code'] = $rawProduct['codestripped'];
            $tempProductData['desc'] = $rawProduct['description'];
            $tempProductData['keywords'] = $rawProduct['meta_keyword'];
            $tempProductData['price'] = sprintf("%.2f",$rawProduct['price']);
            if($rawProduct['parent_id'] > 0)
            {
              $tempProductData['category_path'] .= '_'.$rawProduct['parent_id'];

            }
            $this->dynSearchProductData[] = $tempProductData;
        }

    }


}

?>
