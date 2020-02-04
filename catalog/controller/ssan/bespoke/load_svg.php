<?php

use Ssan\BespokeImage;

class ControllerSsanBespokeLoadSvg extends Controller {
	public function index() {

    	if (isset($this->request->get['symbolNumID'])) {
			$symbolNumID = $this->request->get['symbolNumID'];
			$bespokeInfo = new ssan\BespokeImage($this->registry->get('db'));
			$data =  $bespokeInfo->loadSVGDataByID($symbolNumID);
			echo json_encode($data);
			//return $this->load->view('ssan/bespoke/symbols.tpl', $data);
		} else {
			echo '';
		}



  }
}
?>
