<?php

class ControllerSsanHomepageCategories extends Controller {
    public function index() {

        $this->load->language('ssan/homepage_categories');
        $this->load->model('catalog/category');
    		$this->load->model('tool/image');

        $category_info = $this->model_catalog_category->getCategories($category_id);
//        return $this->load->view('ssan/homepage_categories', $category_info);
    }
}
