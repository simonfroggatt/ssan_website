<?php
/**
 * Created by PhpStorm.
 * User: simonfroggatt
 * Date: 08/06/2017
 * Time: 12:13
 */

class ControllerSsanBespokeProductVariantDropdowns extends Controller {
    public function index() {

        $this->load->language('ssan/bespoke/product_variant_dropdowns');

        $data['text_productsize'] = $this->language->get('text_productsize');
        $data['text_productmaterial'] = $this->language->get('text_productmaterial');

        $this->load->model('ssan/product_variant_dropdowns');

      /*  $productID = $this->request->get['product_id'];
        $product_tax_class = $this->model_catalog_product->GetProductTaxClass($productID);

        $prodData = $this->model_ssan_product_variant_table->getVariantTableInfo($productID);
        $prodData['product_id'] = $productID;
        $prodData['tax_multiplier'] = $this->getVATMultiplier($productID);
        $prodData['j_tax_multiplier'] = $this->tax->calculate(1, $product_tax_class, $this->config->get('config_tax'));

        $newProductTableData = $this->setVatValues($prodData['product_table_data'],$productID);

        $prodData['variantQuantaties'] = $this->cart->getProductVariantQty($productID);

        $prodData['cartHasProducts'] = ($prodData['variantQuantaties']) ? 1: 0;
*/

        $productID = $this->request->get['product_id'];
        $variant = $this->model_ssan_product_variant_dropdowns->getVariantDopdownInfo($productID);
        $data['variant_sizes'] = $variant['variant_sizes'];
        $data['variant_materials'] = $variant['variant_materials'];
        $data['product_id'] = $productID;
        $data['variant_size_materials'] = $variant['variant_size_materials'];
        if (isset($this->request->get['bespokeid'])) {
					$data['bespokeid'] = $this->request->get['bespokeid'];
				}
				else {
					$data['bespokeid'] = 0;
				}
      //  $data['variant_size'] = $variant['variant_size_materials'];;

        return $this->load->view('ssan/bespoke/product_variant_dropdowns', $data);

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
    //    setcookie('vatstatus', 0, time() + 60 * 60 * 24 * 30, '/', $this->request->server['HTTP_HOST']);
      }
      return $taxMultiplier;
    }

    private function setVatValues($prodData, $productID)
    {
      $newprodData = [];
      $googleVAT = 0;
      if (isset($this->request->get['vat']))	{
        if($this->request->get['vat']==='true'){
            $googleVAT = 1;
        }
      }

      if(isset($this->request->cookie['vatstatus']))
      {
        if( ($this->request->cookie['vatstatus'] == 1) || ($googleVAT == 1) )
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
    //    setcookie('vatstatus', 0, time() + 60 * 60 * 24 * 30, '/', $this->request->server['HTTP_HOST']);
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
}
