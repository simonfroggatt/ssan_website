<?php


class ModelSsanProductCustomerAlsoBought extends Model
{


    public function getAlsoSold($product_id){
        $sql = "SELECT " . DB_PREFIX . "order_product.product_id, COUNT( " . DB_PREFIX . "order_product.order_id ) AS num_sold ".
            "FROM " . DB_PREFIX . "order_product INNER JOIN " . DB_PREFIX . "product_description ON " . DB_PREFIX . "order_product.product_id = " . DB_PREFIX . "product_description.product_id ".
            "WHERE " . DB_PREFIX . "order_product.order_id IN (".
            "( SELECT " . DB_PREFIX . "order.order_id ".
            " FROM " . DB_PREFIX . "order INNER JOIN " . DB_PREFIX . "order_product ON " . DB_PREFIX . "order.order_id = " . DB_PREFIX . "order_product.order_id ".
            " WHERE " . DB_PREFIX . "order_product.product_id = ".$product_id." )) GROUP BY ". DB_PREFIX . "order_product.product_id ORDER BY num_sold DESC LIMIT 1,8";

        $product_data = [];
        $query = $this->db->query($sql);

         $this->load->model('catalog/product');

        foreach ($query->rows as $result) {
            if($result['num_sold'] < 5)  //we only want items that have sold more than 5 times
                break;
            $proddata = $this->model_catalog_product->getProduct($result['product_id']);
            if($proddata)
                 $product_data[$result['product_id']] = $proddata;

        }

        return $product_data;

    }

    private function _getAlsoSold2(){
        //SSAN - get also sold products - change to ASYNC is looks worthwhile
        $data['also_sold_products'] = null;
        $also_sold  = $this->model_catalog_product->GetAlsoSoldProducts($this->request->get['product_id']);
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

    }

}
