<?php
class ControllerExtensionModulePayPalSmartButton extends Controller {
	private $error = array();
	
	public function index() {
		$this->load->language('extension/module/paypal_smart_button');

		$this->load->model('extension/module/paypal_smart_button');
		$this->load->model('setting/setting');

		$this->document->setTitle($this->language->get('heading_title'));

		if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
			$this->model_setting_setting->editSetting('paypal_smart_button', $this->request->post);

			$this->session->data['success'] = $this->language->get('success_save');

			$this->response->redirect($this->url->link('extension/extension', 'token=' . $this->session->data['token'] . '&type=module', true));
		}

		if (isset($this->error['warning'])) {
			$data['error_warning'] = $this->error['warning'];
		} else {
			$data['error_warning'] = '';
		}
		
		$data['heading_title'] = $this->language->get('heading_title');
		
		$data['text_edit'] = $this->language->get('text_edit');
		$data['text_enabled'] = $this->language->get('text_enabled');
		$data['text_disabled'] = $this->language->get('text_disabled');
		$data['text_all_zones'] = $this->language->get('text_all_zones');
		$data['text_yes'] = $this->language->get('text_yes');
		$data['text_no'] = $this->language->get('text_no');
		$data['text_general'] = $this->language->get('text_general');
		$data['text_product_page'] = $this->language->get('text_product_page');
		$data['text_cart_page'] = $this->language->get('text_cart_page');
		$data['text_insert_prepend'] = $this->language->get('text_insert_prepend');
		$data['text_insert_append'] = $this->language->get('text_insert_append');
		$data['text_insert_before'] = $this->language->get('text_insert_before');
		$data['text_insert_after'] = $this->language->get('text_insert_after');
		$data['text_align_left'] = $this->language->get('text_align_left');
		$data['text_align_center'] = $this->language->get('text_align_center');
		$data['text_align_right'] = $this->language->get('text_align_right');
		$data['text_small'] = $this->language->get('text_small');
		$data['text_medium'] = $this->language->get('text_medium');
		$data['text_large'] = $this->language->get('text_large');
		$data['text_responsive'] = $this->language->get('text_responsive');
		$data['text_gold'] = $this->language->get('text_gold');
		$data['text_blue'] = $this->language->get('text_blue');
		$data['text_silver'] = $this->language->get('text_silver');
		$data['text_white'] = $this->language->get('text_white');
		$data['text_black'] = $this->language->get('text_black');
		$data['text_pill'] = $this->language->get('text_pill');
		$data['text_rect'] = $this->language->get('text_rect');
		$data['text_checkout'] = $this->language->get('text_checkout');
		$data['text_pay'] = $this->language->get('text_pay');
		$data['text_buy_now'] = $this->language->get('text_buy_now');
		$data['text_pay_pal'] = $this->language->get('text_pay_pal');
		$data['text_installment'] = $this->language->get('text_installment');
		$data['text_text'] = $this->language->get('text_text');
		$data['text_flex'] = $this->language->get('text_flex');
		$data['text_yes'] = $this->language->get('text_yes');
		$data['text_no'] = $this->language->get('text_no');
		
		$data['entry_status'] = $this->language->get('entry_status');
		$data['entry_product_page_status'] = $this->language->get('entry_product_page_status');
		$data['entry_cart_page_status'] = $this->language->get('entry_cart_page_status');
		$data['entry_insert_tag'] = $this->language->get('entry_insert_tag');
		$data['entry_insert_type'] = $this->language->get('entry_insert_type');
		$data['entry_button_align'] = $this->language->get('entry_button_align');
		$data['entry_button_size'] = $this->language->get('entry_button_size');
		$data['entry_button_color'] = $this->language->get('entry_button_color');
		$data['entry_button_shape'] = $this->language->get('entry_button_shape');
		$data['entry_button_label'] = $this->language->get('entry_button_label');
		$data['entry_button_tagline'] = $this->language->get('entry_button_tagline');
		$data['entry_message_status'] = $this->language->get('entry_message_status');
		$data['entry_message_align'] = $this->language->get('entry_message_align');
		$data['entry_message_size'] = $this->language->get('entry_message_size');
		$data['entry_message_layout'] = $this->language->get('entry_message_layout');
		$data['entry_message_text_color'] = $this->language->get('entry_message_text_color');
		$data['entry_message_text_size'] = $this->language->get('entry_message_text_size');
		$data['entry_message_flex_color'] = $this->language->get('entry_message_flex_color');
		$data['entry_message_flex_ratio'] = $this->language->get('entry_message_flex_ratio');
		
		$data['help_checkout_message_status'] = $this->language->get('help_checkout_message_status');
		
		$data['button_save'] = $this->language->get('button_save');
		$data['button_cancel'] = $this->language->get('button_cancel');

		$data['breadcrumbs'] = array();

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_home'),
			'href' => $this->url->link('common/dashboard', 'token=' . $this->session->data['token'], true)
		);

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_extensions'),
			'href' => $this->url->link('extension/extension', 'token=' . $this->session->data['token'] . '&type=module', true)
		);

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('heading_title'),
			'href' => $this->url->link('extension/module/paypal_smart_button', 'token=' . $this->session->data['token'], true)
		);

		$data['action'] = $this->url->link('extension/module/paypal_smart_button', 'token=' . $this->session->data['token'], true);
		$data['cancel'] = $this->url->link('extension/extension', 'token=' . $this->session->data['token'] . '&type=module', true);
						
		if (isset($this->request->post['paypal_smart_button_status'])) {
			$data['status'] = $this->request->post['paypal_smart_button_status'];
		} else {
			$data['status'] = $this->config->get('paypal_smart_button_status');
		}
		
		// Setting 		
		$_config = new Config();
		$_config->load('paypal_smart_button');
		
		$data['setting'] = $_config->get('paypal_smart_button_setting');
		
		if (isset($this->request->post['paypal_smart_button_setting'])) {
			$data['setting'] = array_replace_recursive((array)$data['setting'], (array)$this->request->post['paypal_smart_button_setting']);
		} else {
			$data['setting'] = array_replace_recursive((array)$data['setting'], (array)$this->config->get('paypal_smart_button_setting'));
		}
				
		$data['header'] = $this->load->controller('common/header');
		$data['column_left'] = $this->load->controller('common/column_left');
		$data['footer'] = $this->load->controller('common/footer');

		$this->response->setOutput($this->load->view('extension/module/paypal_smart_button', $data));
	}

	public function install() {
		$this->load->model('extension/module/paypal_smart_button');
		$this->load->model('setting/setting');

		$this->model_extension_module_paypal_smart_button->install();
		
		$setting['module_paypal_smart_button_status'] = 0;
		
		$this->model_setting_setting->editSetting('module_paypal_smart_button', $setting);
	}

	protected function validate() {
		if (!$this->user->hasPermission('modify', 'extension/module/paypal_smart_button')) {
			$this->error['warning'] = $this->language->get('error_permission');
		}

		return !$this->error;
	}
}
