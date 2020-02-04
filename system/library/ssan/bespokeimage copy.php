<?php

namespace Ssan;
ini_set('memory_limit', '1024M');

class BespokeImage
{

    private $db;
    private $categoryID = 0;
    private $baseColour;
    private $baseTextColour; //baseTextColour
    private $productID;
    private $categorySymbol;
    private $categoryTitle;
    private $categoryDescription;
    private $bespokeTemplatePath;


    public function __construct($db) {
      $this->db = $db;
    }

    public function InitProductBespokeInfo($productID)
    {
      $this->productID = $productID;
      $this->loadCategoryFromProduct();
      $this->loadCategorySymbols();
      $this->loadCategoryDetails();
      $this->loadBespokeTemplate();

    }

    public function GetCategorySymbols()
    {
        return $this->categorySymbol;

    }

    public function GetCategoryDetails()
    {
      return array('baseColour' => $this->baseColour, 'title' => $this->categoryTitle, 'description' => $this->categoryDescription, 'baseTextColour' => $this->baseTextColour);
    }

    public function GetTemplatePath()
    {
      return $this->bespokeTemplatePath;
    }

    private function loadCategoryFromProduct()
    {

      $sql = "SELECT oc_product.bespoke_category FROM oc_product WHERE oc_product.product_id = ?";
      $results = $this->db->query($sql,[$this->productID]);
      if($results->num_rows == 1){
          $this->categoryID = $results->row['bespoke_category'];
      }
    }

    private function loadBespokeTemplate()
    {
      $sql = "SELECT ssan_bespoke_template.template_path FROM oc_product INNER JOIN ssan_bespoke_template ON oc_product.bespoke_template = ssan_bespoke_template.id WHERE oc_product.product_id = ?";
      $results = $this->db->query($sql,[$this->productID]);
      $this->bespokeTemplatePath = $results->row['template_path'];
    }

    private function loadCategorySymbols()
    {
      $sql = "SELECT * FROM ssan_symbols WHERE ssan_symbols.category = ?";
      $results = $this->db->query($sql,[$this->categoryID]);

      $symbolData = array();
      $symbolImage = array();
      foreach ($results->rows as $key => $row) {
        //'symbolPath' => 'symbols/W007.svg', 'symbolWidth' => 100, 'symbolHeight' => 88];
        $tmpImage = array();
        $tmpImage['image_path'] = $row['image_path'];
        $tmpImage['symbolPath'] = 'image/' .$row['svg_path'];
        $tmpImage['id'] = $row['id'];
        $tmpImage['symbolWidth'] = $row['image_width'];
        $tmpImage['symbolHeight'] = $row['image_height'];
        array_push($symbolImage, $tmpImage);
        array_push($symbolData, $row);
      //  print_r($row);
      }
      $this->categorySymbol = array('images' => $symbolImage, 'symbolData' => $symbolData);
    }

    private function loadCategoryDetails()
    {
      $sql = "SELECT * FROM ssan_symbol_category WHERE id = ?";
      $results = $this->db->query($sql,[$this->categoryID]);
      if($results->num_rows == 1){
          $this->baseColour = $results->row['default_colour_RGB'];
          $this->baseTextColour = $results->row['default_text_HEX'];
          $this->categoryTitle = $results->row['title'];
          $this->categoryDescription = $results->row['description'];

      }
      else {
        $this->baseColour = '255,255,255';
        $this->baseTextColour = '#FFFFFF';
      }
    }

}
