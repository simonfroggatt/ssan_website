<?php

namespace Ssan;

require_once(dirname(__FILE__,4).  '/vendor/autoload.php');

use PHPJasper\PHPJasper;

class JasperInvoice
{

    private $db,
        $order_id,
        $order_totals;

    public function __construct($db) {
      $this->db = $db;
    }

    /**
     * @param $order_id
     */
    public function createInvoice($order_id) {
        $this->order_id = $order_id;

        $data['totals'] = array();
        $this->getOrderTotals();
        $this->generateInvoice();

        return '';

    }

    /**
     *
     */
    private function getOrderTotals() {

        $this->order_totals = [];

        $sql = "SELECT oc_order_total.code, oc_order_total.value FROM oc_order_total  WHERE oc_order_total.order_id = ?";

        $results = $this->db->query($sql,[$this->order_id]);

        $all_rows = $results->rows;
        $this->order_totals = array_column($all_rows, 'value', 'code');
    }

    private function generateInvoice() {

        $input = '/Applications/MAMP/htdocs/safetysignsandnotices/upload/vendor/geekcom/phpjasper/examples/invoice.jasper';
        $output = '/Applications/MAMP/htdocs/safetysignsandnotices/upload/vendor/geekcom/phpjasper/examples/invoice_'.$this->order_id;

        $input = __DIR__ . '/reports/invoice.jasper';
        $output = dirname(__FILE__,3). '/storage/reports/invoice_'.$this->order_id;
        $locale = 'en_GB';

        $options = [
            'format' => ['pdf'],
            'locale' => 'en_GB',

            'params' => [
                'p_orderid' => $this->order_id ,
                'p_subtotal' =>  number_format($this->order_totals['sub_total'], 2) ,
                'p_discount' =>  number_format((array_key_exists('discount', $this->order_totals) ? $this->order_totals['discount'] : 0.00),2) ,
                'p_shipping' => number_format($this->order_totals['shipping'],2) ,
                'p_tax_total' =>  number_format($this->order_totals['tax'],2) ,
                'p_total' =>     number_format($this->order_totals['total'],2)
            ],

        /*    'db_connection' => [
                'driver' => 'mysql', //mysql, ....
                'username' => 'root',
                'password' => 'root',
                'host' => 'localhost',
                'database' => 'safetysigns_opencart_core',
                'port' => '3306'
            ]*/

              'db_connection' => [
                'driver' => 'mysql', //mysql, ....
                'username' => 'ssan_jasper',
                'password' => '6gBdQ2hFAgrzx56R',
                'host' => 'localhost',
                'database' => 'safetysigns_opencart_core',
                'port' => '3306'
            ]


        ];

        $jasper = new PHPJasper;

        $jasper->process(
            $input,
            $output,
            $options
        )->execute();


    }



}
