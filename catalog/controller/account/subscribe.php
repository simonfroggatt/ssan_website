<?php
class ControllerAccountSubscribe extends Controller {
	public function index() {



		$this->document->setTitle('Your contact consent');

	/*	if ($this->request->server['REQUEST_METHOD'] == 'GET') {
			$this->load->model('account/customer');

			$this->model_account_customer->editNewsletter($this->request->post['newsletter']);

			$this->session->data['success'] = $this->language->get('text_success');

			$this->response->redirect($this->url->link('account/account', '', true));
		}
*/
		/*$data['breadcrumbs'] = array();

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_home'),
			'href' => $this->url->link('common/home')
		);

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_account'),
			'href' => $this->url->link('account/account', '', true)
		);

		$data['breadcrumbs'][] = array(
			'text' => $this->language->get('text_newsletter'),
			'href' => $this->url->link('account/newsletter', '', true)
		);

		$data['heading_title'] = $this->language->get('heading_title');

		$data['text_yes'] = $this->language->get('text_yes');
		$data['text_no'] = $this->language->get('text_no');

		$data['entry_newsletter'] = $this->language->get('entry_newsletter');

		$data['button_continue'] = $this->language->get('button_continue');
		$data['button_back'] = $this->language->get('button_back');

		$data['action'] = $this->url->link('account/newsletter', '', true);

		$data['newsletter'] = $this->customer->getNewsletter();

		$data['back'] = $this->url->link('account/account', '', true);
*/

		$emailtoken = $this->request->get['emailtoken'];
		$subtype = $this->request->get['subtype'];
		$data['subtypetext'] = "";
		switch(strtoupper($subtype))
		{
			case 'Y': $data['subtypetext'] = "That's great...we're pleased you're sticking around"; break;
			default: $data['subtypetext'] = "We will miss you!!!"; break;
		}


		$this->load->model('account/subscribe');
		$isvalid = $this->model_account_subscribe->checkValid($emailtoken, $subtype);
		if($isvalid == false)
		{
			$data['heading_title'] = 'OOPs';
			$data['subtypetext'] = '';
			$data['update_status'] = 'Sorry something went wrong, we could not find you...please try again';
		}
		else {
			$data['heading_title'] = 'Thank you for taking the time to update your email contact preferences';
			$updated = 	$this->model_account_subscribe->updateSubs($emailtoken, $subtype);
			if($updated)	{
				$data['update_status'] = '...thats all updated.';
			}
			else {
				$data['update_status'] = 'Oops...something went wrong. Please try again';
			}
		}




		$data['token'] = $emailtoken;
		$data['subtype'] = $subtype;

		$data['breadcrumbs'] = array();

		$data['breadcrumbs'][] = array(
			'text' => 'Home',
			'href' => $this->url->link('common/home')
		);

		$data['column_left'] = $this->load->controller('common/column_left');
		$data['column_right'] = $this->load->controller('common/column_right');
		$data['content_top'] = $this->load->controller('common/content_top');
		$data['content_bottom'] = $this->load->controller('common/content_bottom');
		$data['footer'] = $this->load->controller('common/footer');
		$data['header'] = $this->load->controller('common/header');

		$this->response->setOutput($this->load->view('account/subscribe', $data));
	}
}
