<?php
class ControllerSsanBespokeTextAreas extends Controller {
	public function index() {
    $textAreas = array();

		//$productID = $this->request->get['product_id'];
		//$this->load->model('ssan/bespoke/product');

	//	$symbolData = $this->model_ssan_bespoke_product->GetProductSymbols($productID);
		//print_r($symbolData);
		$textBox['panel'] = 0;
		$textBox['box'] = 0;
		$textAreas[0] = $this->load->view('ssan/bespoke/textbox.tpl',$textBox);

	//	$textBox['box'] = 1;
	//	$textAreas[1] = $this->load->view('ssan/bespoke/textbox.tpl',$textBox);
		$data['textAreas'] = $textAreas;
		$data['panel'] = 0;

    return $this->load->view('ssan/bespoke/textareas.tpl', $data);
	//	return $this->load->view('ssan/bespoke/textbox.tpl', $textAreas);
  }
}
?>
