<?php
/**
 * Created by PhpStorm.
 * User: simonfroggatt
 * Date: 08/06/2017
 * Time: 12:13
 */

class ControllerSsanProductVariantTable extends Controller {
    public function index() {

        $this->load->language('ssan/product_variant_table');

        $this->load->model('ssan/product_variant_table');

        $productID = $this->request->get['product_id'];
        $product_tax_class = $this->model_catalog_product->GetProductTaxClass($productID);

        $prodData = $this->model_ssan_product_variant_table->getVariantTableInfo($productID);


        $prodNewImages = $this->createWebsafeImaga($prodData['product_table_data']);
        $prodData['product_table_data'] = $prodNewImages;


        $prodData['product_id'] = $productID;
        $prodData['tax_multiplier'] = $this->getVATMultiplier($productID);
        $prodData['j_tax_multiplier'] = $this->tax->calculate(1, $product_tax_class, $this->config->get('config_tax'));
        

        $newProductTableData = $this->setVatValues($prodData['product_table_data'],$productID);

        $prodData['variantQuantaties'] = $this->cart->getProductVariantQty($productID);

        $prodData['cartHasProducts'] = ($prodData['variantQuantaties']) ? 1: 0;

        //check if we need to show the qty + multiple add to cart buttons

        //bespoke section - never show it
        $prodData['showBulkQtyColumn'] = $prodData['is_bespoke'] == 1 ? false: true;
      //$prodData['showBulkQtyColumn'] = true;

        return $this->load->view('ssan/product_variant_table', $prodData);
    }


    private function getVATMultiplier($productID)
    {
      $taxMultiplier = 1;

      if(isset($this->request->cookie['vatstatus']))
      {
        if($this->request->cookie['vatstatus'] == 1)
        {
          $this->load->model('catalog/product');
          $product_tax_class = $this->model_catalog_product->GetProductTaxClass($productID);
          $taxMultiplier = $this->tax->calculate(1, $product_tax_class, $this->config->get('config_tax'));
        }
      }
      else {
      //  setcookie('vatstatus', 0, time() + 60 * 60 * 24 * 30, '/', $this->request->server['HTTP_HOST']);
      }
      return $taxMultiplier;
    }

    private function setVatValues($prodData, $productID)
    {
      $newprodData = [];
      if(isset($this->request->cookie['vatstatus']))
      {
        if($this->request->cookie['vatstatus'] == 1)
        {
          $this->load->model('catalog/product');
          $product_tax_class = $this->model_catalog_product->GetProductTaxClass($productID);
          foreach($prodData as $key_bulk => $bulkRowInfo)
          {
            $newBulkRowInfo = [];
            foreach($bulkRowInfo['discount_array'] as $key => $bulkValue)
            {
              $newBulkRowInfo[$key] = $this->tax->calculate($bulkValue, $product_tax_class, $this->config->get('config_tax'));
            }
            //  echo $new_price;
            $newprodData['$key_bulk'] = $newBulkRowInfo;
          }
        //  $bulkInfo[$key] = $new_price;
        }
        else {
        $newprodData = $prodData;
        }
      }
      else {
      //  setcookie('vatstatus', 0, time() + 60 * 60 * 24 * 30, '/', $this->request->server['HTTP_HOST']);
        $newprodData = $prodData;
      }
      return $newprodData;
    }

    public function getMarkupDate()
    {
      $this->load->model('ssan/product_variant_table');

      $productID = $this->request->get['product_id'];
      $product_tax_class = $this->model_catalog_product->GetProductTaxClass($productID);

      $prodData = $this->model_ssan_product_variant_table->getVariantTableInfo($productID);
    }

    private function createWebsafeImaga($variantDataIn)
    {
      $this->load->model('tool/image');
      foreach($variantDataIn as $key => $variantData)
      {
        if($variantData['alternative_image'] != null)
        {
          $variantDataIn[$key]['alternative_image'] = $this->model_tool_image->resize($variantData['alternative_image'], $this->config->get($this->config->get('config_theme') . '_image_thumb_width'), $this->config->get($this->config->get('config_theme') . '_image_thumb_height'));
        }
      }
      return $variantDataIn;
    //  $image = $this->model_tool_image->resize($result['image'], $this->config->get($this->config->get('config_theme') . '_image_related_width'), $this->config->get($this->config->get('config_theme') . '_image_related_height'));
    }
}
