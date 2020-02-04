<?php

class ControllerSsanDynamicSearch extends Controller
{
    public function index()
    {
        /*$product_variants = new ssan\ProductVariants($this->registry->get('db'), $product_id);*/
        $data = [];
        return $this->load->view('ssan/dynamic_search', $data);
    }
}


?>
