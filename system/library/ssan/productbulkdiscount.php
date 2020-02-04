<?php
/**
 * Created by PhpStorm.
 * User: simonfroggatt
 * Date: 06/06/2017
 * Time: 10:44
 */

namespace Ssan;


class ProductBulkDiscount
{

    private $arrayOfDiscounts;
    private $productID;
    private $bulkGroupID;
    private $bulkGroupName;
    private $bulkGroupdiscountCount;


    public function __construct($db, $productID = null) {
        $this->db = $db;

        if(!is_null($productID)) {
            $this->productID = $productID;
            $this->LoadDiscountPriceGroup();
        }

    }

    public function GetDiscountedPrices($price)
    {
        $singlePriceArray = [];
        foreach ($this->arrayOfDiscounts as $item) {
            $discountPerc = 1 - ($item['discount']/100);
            $singlePriceArray[] = number_format($price * $discountPerc,2);
        }

        return $singlePriceArray;

    }

    public function GetArrayOfDiscounts()
    {
        return $this->arrayOfDiscounts;
    }

    public function GetBulkDiscountCount()
    {
        return $this->bulkGroupdiscountCount;
    }

    public function GetDiscountTitles()
    {
        $discountTitles;
        foreach ($this->arrayOfDiscounts as $item) {
            $discountTitles[]['discount_title']  = $item['columnTitle'];
        }

        return $discountTitles;
    }

    public function GetDiscountRanges()
    {

        return $this->arrayOfDiscounts;
    }

    public function SetProductID($productID)
    {
      $this->productID = $productID;
    }

    public function GetProductID()
    {
      return $this->productID;
    }

    public function GetProductDiscountPrice($productID, $price, $qty)
    {
      $discountPrice = $price;
      if($productID != $this->productID)
      {
        $this->SetProductID($productID);
        $this->LoadDiscountPriceGroup();
      }

      foreach ($this->arrayOfDiscounts as $key => $discountGroup) {
        if(($discountGroup['minqty'] <= $qty) && ($qty <= $discountGroup['maxqty']))
        {
          $discountPrice = number_format($price * (1-($discountGroup['discount']/100)),2);
          break;
        }
        elseif (($discountGroup['minqty'] <= $qty) && ($discountGroup['maxqty'] == -1)) {
          $discountPrice = number_format($price * (1-($discountGroup['discount']/100)),2);
          break;
        }
      }
      return $discountPrice;

    }

    private function LoadDiscountPriceGroup()
    {

      /*  $sql = "SELECT ssan_builkdiscount_breaks.qty_range_min, ssan_builkdiscount_breaks.discount_percent
                FROM ssan_product_to_bulk_discounts INNER JOIN ssan_bulkdiscount_groups ON ssan_product_to_bulk_discounts.bulk_discount_group_id = ssan_bulkdiscount_groups.id
                INNER JOIN ssan_bulkdiscount_group_values ON ssan_bulkdiscount_groups.id = ssan_bulkdiscount_group_values.bulk_discount_group_id
                INNER JOIN ssan_builkdiscount_breaks ON ssan_bulkdiscount_group_values.discount_break_id = ssan_builkdiscount_breaks.id
                WHERE ssan_bulkdiscount_groups.is_active = 1
                AND ssan_product_to_bulk_discounts.product_id = ?
                ORDER BY ssan_builkdiscount_breaks.qty_range_min ASC";
*/
        $sql = "SELECT ssan_builkdiscount_group_breaks.qty_range_min, ssan_builkdiscount_group_breaks.discount_percent
                FROM ssan_product_to_bulk_discounts INNER JOIN ssan_bulkdiscount_groups ON ssan_product_to_bulk_discounts.bulk_discount_group_id = ssan_bulkdiscount_groups.id
	              INNER JOIN ssan_builkdiscount_group_breaks ON ssan_bulkdiscount_groups.id = ssan_builkdiscount_group_breaks.bulk_discount_group_id
                WHERE ssan_product_to_bulk_discounts.product_id = ?
                AND ssan_bulkdiscount_groups.is_active = 1
                ORDER BY ssan_builkdiscount_group_breaks.qty_range_min ASC";

      //    echo $sql;

        $results = $this->db->query($sql,[$this->productID]);

        $bulkRawData = $results->rows;

        $discountBlock = [];

        foreach ($bulkRawData as $index => $bulkRawDatum) {
            $discountBlock[$index]['minqty'] = intval($bulkRawDatum['qty_range_min']);
            $discountBlock[$index]['maxqty'] = -1;
            $discountBlock[$index]['columnTitle'] = $bulkRawDatum['qty_range_min']. '+';
            $discountBlock[$index]['discount'] = $bulkRawDatum['discount_percent'];

            if($index >= 1)
            {
                $discountBlock[$index-1]['maxqty'] = $bulkRawDatum['qty_range_min'] - 1;
                if($discountBlock[$index-1]['minqty'] == ($bulkRawDatum['qty_range_min'] - 1)) {
                    $discountBlock[$index - 1]['columnTitle'] = $discountBlock[$index - 1]['minqty'];
                }
                else
                {
                    $discountBlock[$index - 1]['columnTitle'] = $discountBlock[$index - 1]['minqty'] . ' - ' . ($bulkRawDatum['qty_range_min'] - 1);
                }
            }
        }

        $this->arrayOfDiscounts = $discountBlock;
        $this->bulkGroupdiscountCount = sizeof($discountBlock);
    }

    
    public function getMinMaxPrice()
    {
      $minMaxPrice = [];

      $minMaxPrice['min'] = 1.00;
      $minMaxPrice['max'] = 3.00;

      return $minMaxPrice;
    }

}
