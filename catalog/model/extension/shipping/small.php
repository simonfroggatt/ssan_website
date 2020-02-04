<?php
class ModelExtensionShippingSmall extends Model {
	function getQuote($address) {
		$this->load->language('extension/shipping/small');

		$query = $this->db->query("SELECT * FROM " . DB_PREFIX . "zone_to_geo_zone WHERE geo_zone_id = '" . (int)$this->config->get('small_geo_zone_id') . "' AND country_id = '" . (int)$address['country_id'] . "' AND (zone_id = '" . (int)$address['zone_id'] . "' OR zone_id = '0')");

		if (!$this->config->get('small_geo_zone_id')) {
			$status = true;
		} elseif ($query->num_rows) {
			$status = true;
		} else {
			$status = false;
		}

		if ($this->cart->getSubTotal() > $this->config->get('small_total')) {
			$status = false;
		}

		$method_data = array();

		if ($status) {
			$quote_data = array();

			$quote_data['small'] = array(
				'code'         => 'small.small',
				'title'        => $this->language->get('text_description'),
				'cost'         => $this->config->get('small_cost'),
				'tax_class_id' => $this->config->get('small_tax_class_id'),
				'text'         => $this->currency->format($this->config->get('small_cost'), $this->session->data['currency']),
				'long_desc'		=> $this->language->get('text_long_description'),
			);

			$method_data = array(
				'code'       => 'small',
				'title'      => $this->language->get('text_title'),
				'quote'      => $quote_data,
				'sort_order' => $this->config->get('small_sort_order'),
				'error'      => false
			);
		}

		return $method_data;
	}
}
