<?php

class ControllerSsanProductCustomerAlsoBought extends Controller{

    public function index(){
        $also_sold_products = [];
        $data = [];
        $data['also_sold_products'] = [];

        $this->load->model('ssan/product_customer_also_bought');
        $this->load->model('tool/image');

        $productID = $this->request->get['product_id'];

        $also_sold = $this->model_ssan_product_customer_also_bought->getAlsoSold($productID);

        foreach ($also_sold as $result) {
            if ($result['image']) {
                $image = $this->model_tool_image->resize($result['image'], $this->config->get($this->config->get('config_theme') . '_image_related_width'), $this->config->get($this->config->get('config_theme') . '_image_related_height'));
            } else {
                $image = $this->model_tool_image->resize('placeholder.png', $this->config->get($this->config->get('config_theme') . '_image_related_width'), $this->config->get($this->config->get('config_theme') . '_image_related_height'));
            }

            if ($this->customer->isLogged() || !$this->config->get('config_customer_price')) {
                $price = $this->currency->format($this->tax->calculate($result['price'], $result['tax_class_id'], $this->config->get('config_tax')), $this->session->data['currency']);
            } else {
                $price = false;
            }

            if ((float)$result['special']) {
                $special = $this->currency->format($this->tax->calculate($result['special'], $result['tax_class_id'], $this->config->get('config_tax')), $this->session->data['currency']);
            } else {
                $special = false;
            }

            if ($this->config->get('config_tax')) {
                $tax = $this->currency->format((float)$result['special'] ? $result['special'] : $result['price'], $this->session->data['currency']);
            } else {
                $tax = false;
            }

            if ($this->config->get('config_review_status')) {
                $rating = (int)$result['rating'];
            } else {
                $rating = false;
            }

            $data['also_sold_products'][] = array(
                'product_id'  => $result['product_id'],
                'thumb'       => $image,
                'name'        => $result['name'],
                'description' => utf8_substr(strip_tags(html_entity_decode($result['description'], ENT_QUOTES, 'UTF-8')), 0, $this->config->get($this->config->get('config_theme') . '_product_description_length')) . '..',
                'price'       => $price,
                'special'     => $special,
                'tax'         => $tax,
                'minimum'     => $result['minimum'] > 0 ? $result['minimum'] : 1,
                'rating'      => $rating,
                'href'        => $this->url->link('product/product', 'product_id=' . $result['product_id'].'&selfref=also')
            );
        }

        $output= $this->load->view('ssan/product_also_sold', $data);

        $this->response->setOutput($output);


    }

    public function temp() {

        $this->load->language('ssan/product_material_table');

        $this->load->model('ssan/product_specification');

        $productID = $this->request->get['product_id'];


        $prodData = $this->model_ssan_product_specification->getProductMaterialSpecs($productID);

        return $this->load->view('ssan/product_material_table', $prodData);
    }

}
