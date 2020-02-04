<?php

use Ssan\JasperInvoice;

class ControllerAccountInvoice extends Controller {

	public function index()
    {

        if (isset($this->request->get['order_id'])) {
            $order_id = $this->request->get['order_id'];
        } else {
            $order_id = 0;
        }

        if (!$this->customer->isLogged()) {
            $this->session->data['redirect'] = $this->url->link('account/order/info', 'order_id=' . $order_id, true);

            $this->response->redirect($this->url->link('account/login', '', true));
        }

        $this->load->model('account/order');

        $order_info = $this->model_account_order->getOrder($order_id);

        if ($order_info) {

        $p_invoice = new ssan\JasperInvoice($this->registry->get('db'), $this);
        $data = [];

            $p_invoice->createInvoice($order_id);
            $data['pdffile'] = DIR_SYSTEM . '/storage/reports/invoice_'.$order_id.'.pdf';
            $data['filename'] = $order_id.'.pdf';

            // $invoice_path = DIR_SYSTEM . '/storage/reports/invoice_'.$order_id.'.pdf';
           // $this->response->redirect($invoice_path);
            $this->response->addHeader('Content-Type: application/pdf');
            $this->response->addHeader('Content-Disposition: inline; filename="' . $data['filename'] . '"');
            $this->response->addHeader('Content-Transfer-Encoding: binary');
            $this->response->addHeader('Accept-Ranges: bytes');
            
            $this->response->setOutput($this->load->view('account/invoice', $data));
		} else {
            $this->session->data['redirect'] = $this->url->link('account/order/info', 'order_id=' . $order_id, true);
            $this->response->redirect($this->url->link('account/order/info', 'order_id=' . $order_id, true));
		}
// add it requiremetns to not be logged in or not


	}


}
