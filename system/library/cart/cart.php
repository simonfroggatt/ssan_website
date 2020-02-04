<?php
namespace Cart;

// Startup
//require_once(DIR_SYSTEM . 'startup.php');
require_once(DIR_SYSTEM . '/library/ssan/productvariants.php');

class Cart extends CartOld {


    public function add($product_id, $option = array(), $recurring_id = 0, $qtyArray = array()) {

    //  if(!$qtyArray) return;
      foreach ($qtyArray as $key => $value) {
        $hasQty = $this->GetExisitingVariantQty($product_id, $option, $recurring_id, $key);
        if($hasQty)
        {
          if($value == 0)
          {
            $removeSQL = "DELETE FROM " . DB_PREFIX . "cart ";
            //$removeSQL .= " WHERE cart_id = '" . (int)$cart_id . "'";
            $removeSQL .= " WHERE api_id = '" . (isset($this->session->data['api_id']) ? (int)$this->session->data['api_id'] : 0) . "'";
            $removeSQL .= " AND customer_id = '" . (int)$this->customer->getId() . "'";
            $removeSQL .= " AND session_id = '" . $this->db->escape($this->session->getId()) . "'";
            $removeSQL .= " AND product_variant_id = '" . $key . "'";
            $this->db->query($removeSQL);
          }
          else {
          $updateSQL = "UPDATE " . DB_PREFIX . "cart SET quantity = (" . (int)$value . ") ";
          $updateSQL .= " WHERE api_id = '" . (isset($this->session->data['api_id']) ? (int)$this->session->data['api_id'] : 0). "'";
        //  $updateSQL .= " AND cart_id = '" . (int)$cart_id . "'";
          $updateSQL .= " AND customer_id = '" . (int)$this->customer->getId() . "'";
          $updateSQL .= " AND session_id = '" . $this->db->escape($this->session->getId()) . "'";
          $updateSQL .= " AND product_id = '" . (int)$product_id . "'";
          $updateSQL .= " AND recurring_id = '" . (int)$recurring_id . "'";
          $updateSQL .= " AND `option` = '" . $this->db->escape(json_encode($option)) . "'";
          $updateSQL .= " AND product_variant_id = '" . $key . "'";

          $this->db->query($updateSQL);
          }

        }
        else {
          if($value > 0)
          {
           $insertSQL = "INSERT " . DB_PREFIX . "cart SET api_id = '";
           $insertSQL .= (isset($this->session->data['api_id']) ? (int)$this->session->data['api_id'] : 0) . "'";
           $insertSQL .= ", customer_id = '" . (int)$this->customer->getId() . "'";
           $insertSQL .= ", session_id = '" . $this->db->escape($this->session->getId()) . "'";
           $insertSQL .= ", product_id = '" . (int)$product_id . "'";
           $insertSQL .= ", recurring_id = '" . (int)$recurring_id . "'";
           $insertSQL .= ", `option` = '" . $this->db->escape(json_encode($option)) . "'";
           $insertSQL .= ", product_variant_id = '" . $key . "'";
           $insertSQL .= ", quantity = '" . (int)$value . "'";
           $insertSQL .= ", date_added = NOW()";
           $this->db->query($insertSQL);
         }

        }
      }

    }

    public function addBespoke($product_id, $option = array(), $recurring_id = 0, $qtyArray = array(), $svgRaw, $svgJSON, $svgExport, $svgImages, $svgTexts) {
      //svg_raw
      //svg_json
    //  if(!$qtyArray) return;
      foreach ($qtyArray as $key => $value) {
        $hasQty = $this->GetExisitingVariantQty($product_id, $option, $recurring_id, $key, $svgJSON);
        if($hasQty)
        {
          if($value == 0)
          {
            $removeSQL = "DELETE FROM " . DB_PREFIX . "cart ";
            //$removeSQL .= " WHERE cart_id = '" . (int)$cart_id . "'";
            $removeSQL .= " WHERE api_id = '" . (isset($this->session->data['api_id']) ? (int)$this->session->data['api_id'] : 0) . "'";
            $removeSQL .= " AND customer_id = '" . (int)$this->customer->getId() . "'";
            $removeSQL .= " AND session_id = '" . $this->db->escape($this->session->getId()) . "'";
            $removeSQL .= " AND product_variant_id = '" . $key . "'";
            $this->db->query($removeSQL);
          }
          else {
          $updateSQL = "UPDATE " . DB_PREFIX . "cart SET quantity = (" . (int)$value . ") ";
          $updateSQL .= " WHERE api_id = '" . (isset($this->session->data['api_id']) ? (int)$this->session->data['api_id'] : 0). "'";
        //  $updateSQL .= " AND cart_id = '" . (int)$cart_id . "'";
          $updateSQL .= " AND customer_id = '" . (int)$this->customer->getId() . "'";
          $updateSQL .= " AND session_id = '" . $this->db->escape($this->session->getId()) . "'";
          $updateSQL .= " AND product_id = '" . (int)$product_id . "'";
          $updateSQL .= " AND recurring_id = '" . (int)$recurring_id . "'";
          $updateSQL .= " AND `option` = '" . $this->db->escape(json_encode($option)) . "'";
          $updateSQL .= " AND product_variant_id = '" . $key . "'";

          $this->db->query($updateSQL);
          }

        }
        else {
          if($value > 0)
          {
           $insertSQL = "INSERT " . DB_PREFIX . "cart SET api_id = '";
           $insertSQL .= (isset($this->session->data['api_id']) ? (int)$this->session->data['api_id'] : 0) . "'";
           $insertSQL .= ", customer_id = '" . (int)$this->customer->getId() . "'";
           $insertSQL .= ", session_id = '" . $this->db->escape($this->session->getId()) . "'";
           $insertSQL .= ", product_id = '" . (int)$product_id . "'";
           $insertSQL .= ", recurring_id = '" . (int)$recurring_id . "'";
           $insertSQL .= ", `option` = '" . $this->db->escape(json_encode($option)) . "'";
           $insertSQL .= ", product_variant_id = '" . $key . "'";
           $insertSQL .= ", quantity = '" . (int)$value . "'";
           $insertSQL .= ", date_added = NOW()";

           $insertSQL .= ", svg_raw = '". $this->db->escape($svgRaw) . "'";
           $insertSQL .= ", svg_export = '". $this->db->escape($svgExport) . "'";
           $insertSQL .= ", svg_json = '". $this->db->escape($svgJSON) . "'";
           $insertSQL .= ", svg_bespoke_images = '". $this->db->escape($svgImages) . "'";
           $insertSQL .= ", svg_bespoke_texts = '". $this->db->escape($svgTexts) . "'";

           $insertSQL .= ", is_bespoke = 1";




        //   $insertSQL .= ", svg_raw = '". $svgRaw . "'";
          // $insertSQL .= ", svg_json = '". $svgJSON . "'";

           $this->db->query($insertSQL);
         }

        }
      }

    }

    public function updateBespoke($cart_id, $quantity, $option = array(), $svgRaw, $svgJSON, $svgExport, $svgImages, $svgTexts) {
      $this->db->query("UPDATE " . DB_PREFIX . "cart SET quantity = '" . (int)$quantity . "', svg_raw = '". $this->db->escape($svgRaw) . "', svg_export = '". $this->db->escape($svgExport) . "' , svg_json = '". $this->db->escape($svgJSON) . "' , svg_bespoke_images = '". $this->db->escape($svgImages) . "' , svg_bespoke_texts = '" . $this->db->escape($svgTexts) .  "' WHERE cart_id = '" . (int)$cart_id . "' AND api_id = '" . (isset($this->session->data['api_id']) ? (int)$this->session->data['api_id'] : 0) . "' AND customer_id = '" . (int)$this->customer->getId() . "' AND session_id = '" . $this->db->escape($this->session->getId()) . "'");
    }


    private function GetFormatedCartCount()
  	{
      $cart_count = parent::countProducts();
  		$cart_return = '';
  		if($cart_count == 0)
  		{
  			$$cart_return = '';
  		}
  		elseif ($cart_count > 99) {
  			$cart_return = '99+';
  		}
  		else {
  			$cart_return = ''.$cart_count.'';
  		}
  		return $cart_return;
  	}

    private function GetExisitingVariantQty($product_id, $option = array(), $recurring_id = 0, $product_var_id, $json_svg = null)
    {
      $sql = "SELECT COUNT(*) AS total FROM " . DB_PREFIX . "cart";
      $sql .= " WHERE api_id = '" . (isset($this->session->data['api_id']) ? (int)$this->session->data['api_id'] : 0)."'";
      $sql .= " AND customer_id = '" . (int)$this->customer->getId()."'";
      $sql .= " AND session_id = '" . $this->db->escape($this->session->getId())."'";
      $sql .= " AND product_id = '" . (int)$product_id."'";
      $sql .= " AND recurring_id = '" . (int)$recurring_id."'";
      $sql .= " AND `option` = '" . $this->db->escape(json_encode($option)) . "'";
      //$sql = .= "' AND `ssan_options` = '" . $this->db->escape(json_encode($option)) . "'");
      $sql .= " AND product_variant_id = '".$product_var_id."'";
      if($json_svg != null) {
        $sql .= " AND svg_json = '" .$this->db->escape(json_encode($json_svg)) . "'";
      }

      $query = $this->db->query($sql);
      return ($query->row['total']);

    }


    public function getProductVariantQty($product_id)
    {
        $currentCartContents = parent::getProducts();
        $productVariantQty = [];
        foreach ($currentCartContents as $key => $cartProduct) {
            if($cartProduct['product_id'] == $product_id)
            {
              $productVariantQty[] = array('product_variant_id' => $cartProduct['product_variant_id'], 'quantity' => $cartProduct['quantity']);
            }
        }
        return $productVariantQty;
    }

    public function getBespokeProductJSON($cartid)
    {
      $currentCartContents = parent::getProducts();
      $svgJSON = null;
      foreach ($currentCartContents as $key => $cartProduct) {
          if($cartProduct['cart_id'] == $cartid)
          {
            $svgJSON = $cartProduct['svg_json'];
          }
      }
      return $svgJSON;
    }

    public function getProductVariantInfo($cartid)
    {
      $variantData = [];
      $sql = "SELECT oc_cart.product_variant_id, ssan_size_material_comb.product_size_id, 	ssan_size_material_comb.product_material_id";
      $sql .= " FROM oc_cart INNER JOIN ssan_product_variants ON oc_cart.product_variant_id = ssan_product_variants.id";
      $sql .= " INNER JOIN ssan_size_material_comb ON ssan_product_variants.size_material_id = ssan_size_material_comb.id";
      $sql .= " WHERE oc_cart.cart_id = ?";

      $results = $this->db->query($sql,[$cartid]);
      if($results->num_rows == 0){
        $variantData = $results->rows[0];
      }
      return $variantData;
    }

    public function getBespokeProductData($cartid){

    }

}
