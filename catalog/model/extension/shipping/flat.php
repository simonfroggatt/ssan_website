<?php
class ModelExtensionShippingFlat extends Model {
	function getQuote($address) {
		$this->load->language('extension/shipping/flat');

		$query = $this->db->query("SELECT * FROM " . DB_PREFIX . "zone_to_geo_zone WHERE geo_zone_id = '" . (int)$this->config->get('flat_geo_zone_id') . "' AND country_id = '" . (int)$address['country_id'] . "' AND (zone_id = '" . (int)$address['zone_id'] . "' OR zone_id = '0')");

		if (!$this->config->get('flat_geo_zone_id')) {
			$status = true;
		} elseif ($query->num_rows) {
			$status = true;
		} else {
			$status = false;
		}

		$method_data = array();
		$shipping_cost_extra = 0.00;
		$final_shipping_cost = 0.00;
		$shipping_desc = $this->language->get('text_long_description');

        foreach ($this->cart->getProducts() as $product) {
            $shipping_var_cost = $this->GetExtraShipping($product['product_variant_id']);
                if($shipping_var_cost > $shipping_cost_extra) {
                    $shipping_cost_extra = $shipping_var_cost;
                }
        }

        if($shipping_cost_extra > $this->config->get('flat_cost')){
            $final_shipping_cost = $shipping_cost_extra;
            $shipping_desc = $this->language->get('text_long_description_extra');
        }
        else {
            $final_shipping_cost = $this->config->get('flat_cost');
        }

		if ($status) {
			$quote_data = array();

			$quote_data['flat'] = array(
				'code'         => 'flat.flat',
				'title'        => $this->language->get('text_description'),
				'cost'         => $final_shipping_cost,
				'tax_class_id' => $this->config->get('flat_tax_class_id'),
				'text'         => $this->currency->format($final_shipping_cost, $this->session->data['currency']),
                'long_desc'		=> $shipping_desc,
				//'text'         => $this->currency->format($this->tax->calculate($this->config->get('flat_cost'), $this->config->get('flat_tax_class_id'), $this->config->get('config_tax')), $this->session->data['currency'])
			);

			$method_data = array(
				'code'       => 'flat',
				'title'      => $this->language->get('text_title'),
				'quote'      => $quote_data,
				'sort_order' => $this->config->get('flat_sort_order'),
				'error'      => false
			);
		}

		return $method_data;
	}

    private function GetExtraShipping($prod_variant_id){
        $sql = "SELECT shipping_cost FROM ".SSAN_DB_PREFIX ."product_variants WHERE id='" . $prod_variant_id . "'";
        $query = $this->db->query($sql);
        return $query->row['shipping_cost'];
    }
}
