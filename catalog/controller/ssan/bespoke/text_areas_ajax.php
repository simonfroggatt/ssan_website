<?php
class ControllerSsanBespokeTextAreasAjax extends Controller {
	public function index() {
    $textAreas = array();

		$panel = $this->request->get['panel'];
		$box = $this->request->get['box'];
		//$this->load->model('ssan/bespoke/product');

	//	$symbolData = $this->model_ssan_bespoke_product->GetProductSymbols($productID);
		//print_r($symbolData);
		$textBox['panel'] = $panel;
		$textBox['box'] = $box;
		echo $this->load->view('ssan/bespoke/textbox.tpl',$textBox);
  }
}
?>
