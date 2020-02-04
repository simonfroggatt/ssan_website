<?php
class ControllerSsanBespokeSymbols extends Controller {
	public function index() {
    $symbolData = array();
		$ajax = 0;
		$symbolNumID = 0;


		if (isset($this->request->get['symbolNumID'])) {
			$symbolNumID = $this->request->get['symbolNumID'];
			$ajax = 1;
		}

		$productID = $this->request->get['product_id'];
		$this->load->model('ssan/bespoke/product');

		$symbolArr = $this->model_ssan_bespoke_product->GetProductSymbols($productID);
		$data['symbolData'] = $symbolArr['symbolData'];
	//	$data['symbolData'] = $symbolArr['symbolData'];
		$data['symbolSignID'] = 0;
		$data['symbolNumID'] = $symbolNumID;

		$carouselHTML = $this->load->view('ssan/bespoke/symbolcarousel.tpl', $data);
		if($ajax) {
    	echo $carouselHTML;
		}
		else {
			$data['carouselHTML'] = $carouselHTML;
	//		$data['symbolNumID'] = 2;
		//	$data['carouselHTML2'] = $this->load->view('ssan/bespoke/symbolcarousel.tpl', $data);
			return $this->load->view('ssan/bespoke/symbols.tpl', $data);
		}
  }
}
?>
