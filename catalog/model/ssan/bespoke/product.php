<?php

class ModelSsanBespokeProduct extends Model {

  public function GetProductBespokeInfo($productID)
  {

      $data = [];

      $bespokeInfo = new ssan\BespokeImage($this->registry->get('db'));
      $bespokeInfo->InitProductBespokeInfo($productID);
      $data['catInfo'] =  $bespokeInfo->GetCategoryDetails();
      $data['template'] = $bespokeInfo->GetTemplatePath();

      return $data;

  }

  public function GetProductSymbols($productID)
  {
    $bespokeSign = new ssan\BespokeImage($this->registry->get('db'));
    $bespokeSign->InitProductBespokeInfo($productID);
    $categorySymbols = $bespokeSign->GetCategorySymbols();
    return $categorySymbols;
  }

}


?>
