<?php
/**
 * Created by PhpStorm.
 * User: simonfroggatt
 * Date: 08/06/2017
 * Time: 12:13
 */

class ControllerSsanProductMaterialTable extends Controller {
    public function index() {

        $this->load->language('ssan/product_material_table');

        $this->load->model('ssan/product_specification');

        $productID = $this->request->get['product_id'];


        $prodData = $this->model_ssan_product_specification->getProductMaterialSpecs($productID);

        return $this->load->view('ssan/product_material_table', $prodData);
    }


}
