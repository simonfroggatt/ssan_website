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

    public function loadSVGDataByID($svgID){
        $svgData = [];
        $svgCode = '';
        $nodeTypes = array('g','path','rect','circle', 'ellipse','line', 'polygon', 'polyline','path',  'text', 'title' );
        $sql = "SELECT * FROM ssan_symbols WHERE ssan_symbols.id = ?";
        $results = $this->db->query($sql,[$svgID]);

        if($results->num_rows === 1){
            $svg_path = 'image/' .$results->row['svg_path'];
            $svg_file = file_get_contents($svg_path);
            $svg_xml_file = simplexml_load_file($svg_path);
            $svg_xml_file->registerXPathNamespace('svg', 'http://www.w3.org/2000/svg');


            $width = isset($svg_xml_file['width']) ? (float)$svg_xml_file['width'] : null;
            $height = isset($svg_xml_file['height']) ? (float)$svg_xml_file['height'] : null;
            $viewbox = isset($svg_xml_file['viewBox']) ? preg_split('/\s+/',$svg_xml_file['viewBox']) : null;

            foreach($svg_xml_file as $key => $value){
                if(in_array($key, $nodeTypes) ){
                    $svgCode .=$value->asXML();
                   // $svgCode .= str_replace(array("\n", "\r"), '', $value->asXML());
                }

               // echo $value;
            }
          //  echo $height;
        }

        $svgData['svgCode'] = $svgCode;
        $svgData['width'] = $width;
        $svgData['height'] = $height;
        $svgData['viewBox'] = $viewbox;


        return $svgData;
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
