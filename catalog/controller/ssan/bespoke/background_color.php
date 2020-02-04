<?php
class ControllerSsanBespokeBackgroundColor extends Controller {
	public function index() {

	$this->load->language('ssan/bespoke/bespoke');
	$data['text_only_cats'] = $this->language->get('text_only_cats');

  return $this->load->view('ssan/bespoke/colorpicker.tpl', $data);
	//	return $this->load->view('ssan/bespoke/textbox.tpl', $textAreas);
  }
}
?>
