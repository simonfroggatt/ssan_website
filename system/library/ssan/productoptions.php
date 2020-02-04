<?php
/**
 * Created by PhpStorm.
 * User: simonfroggatt
 * Date: 06/06/2017
 * Time: 10:40
 */

namespace ssan;


class ProductOptions
{

    public function __construct($db, $productID = null) {
       $this->db = $db;
    }

}