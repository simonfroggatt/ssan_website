<?php
/**
 * Created by PhpStorm.
 * User: simonfroggatt
 * Date: 08/06/2017
 * Time: 12:13
 */

class ControllerSsanJasperInvoice extends Controller {
    public function index() {

        $this->load->model('ssan/jasper_invoice');

    /*    $productID = $this->request->get['product_id'];
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

        return $this->load->view('ssan/product_variant_table', $prodData);*/
    }

}
