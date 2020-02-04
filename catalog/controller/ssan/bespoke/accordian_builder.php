<?php
class ControllerSsanBespokeAccordianBuilder extends Controller {
	public function index() {

		$this->load->language('ssan/bespoke/bespoke');

		$data['accordian_sizes'] = $this->language->get('accordian_sizes');
		$data['accordian_symbols'] = $this->language->get('accordian_symbols');
		$data['accordian_text'] = $this->language->get('accordian_text');
		$data['accordian_layout'] = $this->language->get('accordian_layout');

		$data['prod_var_dropdown'] = $this->load->controller('ssan/bespoke/product_variant_dropdowns');
	  $data['symbols'] = $this->load->controller('ssan/bespoke/symbols');
		$data['textareas'] = $this->load->controller('ssan/bespoke/text_areas');
		$data['bespokeLayout'] = $this->load->controller('ssan/bespoke/layout');


    return $this->load->view('ssan/bespoke/accordian.tpl', $data);
  }
}
?>
