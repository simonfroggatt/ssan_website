<?php
class ModelCatalogBespoke extends Model {
    function getCategoryInfo($categoryID)
    {

      $catInfo = [];
      $query = $this->db->query("SELECT * FROM ssan_symbol_category WHERE id = ?", [$categoryID]);
      if($query->num_rows > 0)
      {

        $catInfoArray =  $query->rows;
        $catInfo = $catInfoArray[0];
      }
      return $catInfo;
    }
}
?>
