<?php
class ControllerSsanBespokeImageViewer extends Controller {
	public function index() {

		$data = [];

		$this->load->language('ssan/bespoke/viewer');
		$productID = $this->request->get['product_id'];

		$this->load->model('ssan/bespoke/product');
		$productBespokeInfo = $this->model_ssan_bespoke_product->GetProductBespokeInfo($productID);


		/*$data['prod_var_dropdown'] = $this->load->controller('ssan/bespoke/product_variant_dropdowns');
	  $data['symbols'] = $this->load->controller('ssan/bespoke/symbols');*/
	  $data['categoryTitle'] = $productBespokeInfo['title'];
		$data['categoryDescription'] = $productBespokeInfo['description'];
		$data['categoryBaseColour'] = $productBespokeInfo['baseColour'];
		$data['categoryBaseTextColour'] = $productBespokeInfo['baseTextColour'];


    return $this->load->view('ssan/bespoke/image_viewer.tpl', $data);
  }
}
?>
