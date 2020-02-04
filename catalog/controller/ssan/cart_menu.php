<?php
/**
 * Created by PhpStorm.
 * User: simonfroggatt
 * Date: 08/06/2017
 * Time: 12:13
 */

class ControllerSsanCartMenu extends Controller {
    public function index() {

      /*  $this->load->language('ssan/product_variant_table');

        $this->load->model('ssan/product_variant_table');  //SSANw

        $productID = $this->request->get['product_id'];

        $prodData = $this->model_ssan_product_variant_table->getVariantTableInfo($productID);
        $prodData['product_id'] = $productID;
*/
      $prodData['cart_total']  = number_format($this->cart->getTotal(),2);
      $cart_layouts['md'] = '';
      $cart_layouts['sm'] = '';
      $cart_layouts['xs'] = '';

      $cart_count = $this->cart->countProducts();
      if($cart_count == 0)
      {
        $cart_layouts['cart_class'] = '';
        $prodData['cart_count'] = 'empty';
      }
    //  elseif ($cart_count > 99) {
    //    $prodData['cart_count'] = '99+';
    //  }
      else {
        $prodData['cart_count'] = $cart_count. ' items';
        $cart_layouts['cart_class'] = 'full';
      }

      //  $prodData['cart_count'] = 3;
      $cart_layouts['md'] = $this->load->view('ssan/cart_menu', $prodData);
      $cart_layouts['sm'] = $this->load->view('ssan/cart_menu_sm', $prodData);
      $cart_layouts['xs'] = $this->load->view('ssan/cart_menu_xs', $prodData);

        return $cart_layouts;
    }
}
