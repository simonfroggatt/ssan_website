<?php
class ControllerSsanBespokeLayout extends Controller {
	public function index() {

		$data = [];

		$this->load->language('ssan/bespoke/bespoke');

		$data['accordian_sizes'] = $this->language->get('accordian_sizes');
		$data['accordian_symbols'] = $this->language->get('accordian_symbols');
		$data['accordian_text'] = $this->language->get('accordian_text');
		$data['accordian_layout'] = $this->language->get('accordian_layout');
		$data['accordian_text_colour'] = $this->language->get('accordian_text_colour');
		$data['accordian_bg_colour'] = $this->language->get('accordian_bg_colour');

		$productID = $this->request->get['product_id'];

		$this->load->model('ssan/bespoke/product');


		$productBespokeInfo = $this->model_ssan_bespoke_product->GetProductBespokeInfo($productID);

		$data['categoryTitle'] = $productBespokeInfo['catInfo']['title'];
		$data['categoryDescription'] = $productBespokeInfo['catInfo']['description'];
		$data['categoryBaseColour'] = $productBespokeInfo['catInfo']['baseColour'];
		$data['categoryBaseTextColour'] = $productBespokeInfo['catInfo']['baseTextColour'];

		$template_name = $productBespokeInfo['template'];

		$data['prod_var_dropdown'] = $this->load->controller('ssan/bespoke/product_variant_dropdowns');
		$data['symbols'] = $this->load->controller('ssan/bespoke/symbols');
		$data['textareas'] = $this->load->controller('ssan/bespoke/text_areas');
		$data['backgroundPicker'] = $this->load->controller('ssan/bespoke/background_color');

		$data['text_only_cats'] = $this->language->get('text_only_cats');

		$this->load->model('catalog/product');

		$product_info = $this->model_catalog_product->getProduct($productID);
		$data['long_description'] = $product_info['long_description'];

		$data['bespokeid'] = 0;
		if (isset($this->request->get['bespokeid'])) {
			$cartid  = $this->request->get['bespokeid'];
			$data['bespokeid'] = $cartid;
		}


	//	print_r($data['productJSON']);

		return $this->load->view('ssan/bespoke/'.$template_name.'.tpl', $data);
  }
}
?>
