<?php
class ControllerExtensionFeedAmazonSeller extends Controller
{
    public function index()
    {
        $fp = fopen('amazon_upload.csv', 'w');

        $this->load->model('catalog/category');
        $this->load->model('catalog/product');
        $this->load->model('tool/image');

        $this->load->model('extension/feed/google_merchant_ssan');
        $this->load->model('ssan/amazon_seller');


        $csv_line = 'feed_product_type1,item_sku';
        $csv_line .= ',brand_name';
        $csv_line .= ',external_product_id';
        $csv_line .= ',external_product_id_type';
        $csv_line .= ',item_name';
        $csv_line .= ',manufacturer';
        $csv_line .= ',recommended_browse_nodes';
        $csv_line .= ',standard_price';
        $csv_line .= ',quantity';
        $csv_line .= ',main_image_url';
        $csv_line .= ',parent_child';
        $csv_line .= ',parent_sku';
        $csv_line .= ',variation_theme';
        $csv_line .= ',relationship_type';
        $csv_line .= ',part_number';
        $csv_line .= ',product_description';
        $csv_line .= ',short_product_description';
        $csv_line .= ',size_name';
        $csv_line .= ',material_type';
        $csv_line .= ',catalog_number';
        $csv_line .= ',generic_keywords';
        $csv_line .= ',bullet_point1';
        $csv_line .= ',bullet_point2';
        $csv_line .= ',bullet_point3';
        $csv_line .= ',bullet_point4';
        $csv_line .= ',bullet_point5';
        $csv_line .= ',target_audience_keywords1';
        $csv_line .= ',target_audience_keywords2';
        $csv_line .= ',target_audience_keywords3';
        $csv_line .= ',target_audience_keywords4';
        $csv_line .= ',target_audience_keywords5';
        $csv_line .= ',item_shape';
        $csv_line .= ',fulfillment_latency';
        $csv_line .= ',condition_type';
       // $csv_line .= ',merchant_shipping_group_name' ;
        $csv_line .= PHP_EOL;

       // $csv_arr = explode(',', $csv_line);

        //fputcsv($fp, $csv_arr);
       // fwrite($fp,$csv_line);

        $products = $this->model_ssan_amazon_seller->getAvailableProducts();


        foreach ($products as $product) {

            $variant_data = $this->model_ssan_amazon_seller->getProductVariantData((int)$product['product_id']);
            $product = $this->model_catalog_product->getProduct((int)$product['product_id']);


            if ($variant_data['variant_type'] == 'material-size') {  //size and material variant

                $csv_line = $this->multiVariant($product, $variant_data);

              //  $csv_arr = explode(',', $csv_line);
            //    fputcsv($fp, $csv_arr);
                fwrite($fp,$csv_line);
            } elseif ($variant_data['variant_type'] == 'Material') {  //material only variant
                $csv_line = $this->singleVariant($product, $variant_data);

                fwrite($fp,$csv_line);
            } else { //no variants at all
                $csv_line = $this->noVariant($product, $variant_data);

                //  $csv_arr = explode(',', $csv_line);
                //    fputcsv($fp, $csv_arr);
                fwrite($fp,$csv_line);
            }

        }
        fclose($fp);
    }


    private function multiVariant($product, $variant_data)
    {
        $csv_line = 'securityelectronics';
        $csv_line .= ',' . $product['product_id']; //Seller SKU
        $csv_line .= ',Safety Signs & Notices'; //Brand
        $csv_line .= ',,';  //external_product_id, external_product_id_type
        $csv_line .= ',' . $product['name'];  //Title
        $csv_line .= ',Safety Signs & Notices'; //Manufacturer
        $csv_line .= ',1939588031'; //ecommended_browse_nodes
        $csv_line .= ',,'; //standard_price, quantity


        $csv_line .= ',https://www.safetysignsandnotices.co.uk/image/' . $this->imageHack($product['image'],600,600); //main_image_url

        $csv_line .= ',,,,,,,,,';

        //variant
        $csv_line .= ',parent,'; //parent_child,parent_sku
        $csv_line .= ',' . $variant_data['variant_type']; //variation_theme

        $csv_line .= PHP_EOL;

        $size_material_matirx = $this->model_ssan_amazon_seller->getSizeMaterialMatrix((int)$product['product_id']);


        foreach ($variant_data['variants'] as $variant) {


            $csv_line .= 'securityelectronics';
            $csv_line .= ',' . $product['product_id'] . '-' . $variant['id']; //Seller SKU
            $csv_line .= ',Safety Signs & Notices'; //Brand
            $csv_line .= ',"0' . $variant['gtin'] . '",GTIN';  //external_product_id, external_product_id_type
            $csv_line .= ',' . $product['name'] . ' ' . $variant['size_name'] . ' ' . $variant['material_name']; //Title
            $csv_line .= ',Safety Signs & Notices'; //Manufacturer
            $csv_line .= ',1939588031'; //ecommended_browse_nodes
            $csv_line .= ',' . $this->setTaxPrice($variant['variant_price']) . ',50'; //standard_price, quantity
            if ($variant['alternative_image'] != null)
                $csv_line .= ',https://www.safetysignsandnotices.co.uk/image/' . $this->imageHack($variant['alternative_image'],600,600); //main_image_url
            else
                $csv_line .= ',https://www.safetysignsandnotices.co.uk/image/' . $this->imageHack($product['image'],600,600); //main_image_url

            $csv_line .= ',,,,,,,,,';

            //variant
            $csv_line .= ',child'; //parent_child,
            $csv_line .= ','.$product['product_id'] ; //parent_sku
            $csv_line .= ',' . $variant_data['variant_type']; //variation_theme
            $csv_line .= ',Variation'; //relationship_type

            //BASIC

            $csv_line .= ',,' . $variant['variant_code'];  //part_number

            if(array_key_exists('reseller_variant',$variant ))
                $reseller_variants = $variant['reseller_variant'];
            else
                $reseller_variants = [];

          /*  if (array_key_exists('long_description', $reseller_variants))
                $csv_line .= ',' . $reseller_variants['long_description']; //product_description
            else
                $csv_line .= ',' . $product['long_description']; //product_description
          */

              if (array_key_exists('description', $reseller_variants))
                  $csv_line .= ',"' . $reseller_variants['description'] .'"'; //product_description
              else
                  $csv_line .= ',"' . $product['description'] . '"'; //product_description


            if (array_key_exists('description', $reseller_variants))
                $csv_line .= ',"' . $reseller_variants['description'] . '"'; //short_product_description
            else
                $csv_line .= ',"' . $product['description'] . '"'; //short_product_description


            //DISCOVERY
            $csv_line .= ',,,,';
            $csv_line .= ',' . $variant['size_name']; //size_name
            $csv_line .= ',' . $variant['material_name']; //material_type
            $csv_line .= ',' . $variant['id']; //catalog_number



            if (array_key_exists('meta_keyword', $reseller_variants))
                $keywords = $reseller_variants['meta_keyword'];

            else
                $keywords = $product['meta_keyword'];

            $csv_line .= ',"' . $keywords .'"'; //generic_keywords

            // TODO - add in the bullet points once medusa allows

            $csv_line .= ', Sign measures : ' . $variant['size_name']; //bullet_point1
            $csv_line .= ', Sign material : ' . $variant['material_name']; //bullet_point2
            $csv_line .= ', Sign orientation : ' . $variant['size_orientation']; //bullet_point3
            $csv_line .= ', Made and Supplied in the UK by Safety Signs and Notices'; //bullet_point4
            $csv_line .= ','; //bullet_point4

            //target_audience_keywords1
            $kwar = explode(',', $keywords);
            $kw_count = 0;
            foreach ($kwar as $keyword) {
                $csv_line .= ',' . substr($keyword,0,50) ;
                $kw_count++;
                if ($kw_count == 5)
                    break;
            }
            while ($kw_count < 5) {
                $csv_line .= ',';
                $kw_count++;
            }

            $csv_line .= ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,';
            $csv_line .= ',';// . $variant['size_orientation']; //item_shape
            $csv_line .= ',1';// fulfillment_latency 1 -2 days
            $csv_line .= ',New'; // condition_type (New)
            $csv_line .= PHP_EOL;
        }
        return $csv_line;
    }

    private function multiVariantMatrix($product, $variant_data)
    {
        $csv_line = 'securityelectronics';
        $csv_line .= ',' . $product['product_id']; //Seller SKU
        $csv_line .= ',Safety Signs & Notices'; //Brand
        $csv_line .= ',,';  //external_product_id, external_product_id_type
        $csv_line .= ',' . $product['name'];  //Title
        $csv_line .= ',Safety Signs & Notices'; //Manufacturer
        $csv_line .= ',1939588031'; //ecommended_browse_nodes
        $csv_line .= ',,'; //standard_price, quantity


        $csv_line .= ',https://www.safetysignsandnotices.co.uk/image/' . $this->imageHack($product['image'],600,600); //main_image_url

        $csv_line .= ',,,,,,,,,';

        //variant
        $csv_line .= ',parent,'; //parent_child,parent_sku
        $csv_line .= ',' . $variant_data['variant_type']; //variation_theme

        $csv_line .= PHP_EOL;

        $size_material_matirx = $this->model_ssan_amazon_seller->getSizeMaterialMatrix((int)$product['product_id']);

        foreach ($size_material_matirx as $variantCheck) {
       // foreach ($variant_data['variants'] as $variant) {
            $variant = [];
           // $this->sizeMaterialCheck()


            $csv_line .= 'securityelectronics';
            $csv_line .= ',' . $product['product_id'] . '-' . $variant['id']; //Seller SKU
            $csv_line .= ',Safety Signs & Notices'; //Brand
            $csv_line .= ',"0' . $variant['gtin'] . '",GTIN';  //external_product_id, external_product_id_type
            $csv_line .= ',' . $product['name'] . ' ' . $variant['size_name'] . ' ' . $variant['material_name']; //Title
            $csv_line .= ',Safety Signs & Notices'; //Manufacturer
            $csv_line .= ',1939588031'; //ecommended_browse_nodes
            $csv_line .= ',' . $this->setTaxPrice($variant['variant_price'])  . ',50'; //standard_price, quantity
            if ($variant['alternative_image'] != null)
                $csv_line .= ',https://www.safetysignsandnotices.co.uk/image/' . $this->imageHack($variant['alternative_image'],600,600); //main_image_url
            else
                $csv_line .= ',https://www.safetysignsandnotices.co.uk/image/' . $this->imageHack($product['image'],600,600); //main_image_url

            $csv_line .= ',,,,,,,,,';

            //variant
            $csv_line .= ',child'; //parent_child,
            $csv_line .= ','.$product['product_id'] ; //parent_sku
            $csv_line .= ',' . $variant_data['variant_type']; //variation_theme
            $csv_line .= ',Variation'; //relationship_type

            //BASIC

            $csv_line .= ',,' . $variant['variant_code'];  //part_number

            if(array_key_exists('reseller_variant',$variant ))
                $reseller_variants = $variant['reseller_variant'];
            else
                $reseller_variants = [];

          /*  if (array_key_exists('long_description', $reseller_variants))
                $csv_line .= ',' . $reseller_variants['long_description']; //product_description
            else
                $csv_line .= ',' . $product['long_description']; //product_description
          */

              if (array_key_exists('description', $reseller_variants))
                  $csv_line .= ',"' . $reseller_variants['description'] .'"'; //product_description
              else
                  $csv_line .= ',"' . $product['description'] . '"'; //product_description


            if (array_key_exists('description', $reseller_variants))
                $csv_line .= ',"' . $reseller_variants['description'] . '"'; //short_product_description
            else
                $csv_line .= ',"' . $product['description'] . '"'; //short_product_description


            //DISCOVERY
            $csv_line .= ',,,,';
            $csv_line .= ',' . $variant['size_name']; //size_name
            $csv_line .= ',' . $variant['material_name']; //material_type
            $csv_line .= ',' . $variant['id']; //catalog_number



            if (array_key_exists('meta_keyword', $reseller_variants))
                $keywords = $reseller_variants['meta_keyword'];

            else
                $keywords = $product['meta_keyword'];

            $csv_line .= ',"' . $keywords .'"'; //generic_keywords

            // TODO - add in the bullet points once medusa allows

            $csv_line .= ', Sign measures : ' . $variant['size_name']; //bullet_point1
            $csv_line .= ', Sign material : ' . $variant['material_name']; //bullet_point2
            $csv_line .= ', Sign orientation : ' . $variant['size_orientation']; //bullet_point3
            $csv_line .= ', Made and Supplied in the UK by Safety Signs and Notices'; //bullet_point4
            $csv_line .= ','; //bullet_point4

            //target_audience_keywords1
            $kwar = explode(',', $keywords);
            $kw_count = 0;
            foreach ($kwar as $keyword) {
                $csv_line .= ',' . substr($keyword,0,50) ;
                $kw_count++;
                if ($kw_count == 5)
                    break;
            }
            while ($kw_count < 5) {
                $csv_line .= ',';
                $kw_count++;
            }

            $csv_line .= ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,';
            $csv_line .= ',';// . $variant['size_orientation']; //item_shape
            $csv_line .= ',1';// fulfillment_latency 1 -2 days
            $csv_line .= ',New'; // condition_type (New)
            $csv_line .= PHP_EOL;
        }
        return $csv_line;
    }

    private function singleVariant($product, $variant_data){

        $csv_line = 'securityelectronics';
        $csv_line .= ',' . $product['product_id']; //Seller SKU
        $csv_line .= ',Safety Signs & Notices'; //Brand
        $csv_line .= ',,';  //external_product_id, external_product_id_type
        $csv_line .= ',' . $product['name'] . ' ' .$variant_data['variants'][0]['size_name'] ;  //Title
        $csv_line .= ',Safety Signs & Notices'; //Manufacturer
        $csv_line .= ',1939588031'; //ecommended_browse_nodes
        $csv_line .= ',,'; //standard_price, quantity
        $csv_line .= ',https://www.safetysignsandnotices.co.uk/image/' . $this->imageHack($product['image'], 600,600); //main_image_url

        $csv_line .= ',,,,,,,,,';

        //variant
        $csv_line .= ',parent,'; //parent_child,parent_sku
        $csv_line .= ',' . $variant_data['variant_type']; //variation_theme

        $csv_line .= PHP_EOL;

        foreach ($variant_data['variants'] as $variant) {
            $csv_line .= 'securityelectronics';
            $csv_line .= ',' . $product['product_id'] . '-' . $variant['id']; //Seller SKU
            $csv_line .= ',Safety Signs & Notices'; //Brand
            $csv_line .= ',"0' . $variant['gtin'] . '",GTIN';  //external_product_id, external_product_id_type
            $csv_line .= ',' . $product['name'] . ' ' . $variant['size_name'] . ' ' . $variant['material_name']; //Title
            $csv_line .= ',Safety Signs & Notices'; //Manufacturer
            $csv_line .= ',1939588031'; //ecommended_browse_nodes
            $csv_line .= ',' . $this->setTaxPrice($variant['variant_price'])  . ',50'; //standard_price, quantity
            if ($variant['alternative_image'] != null)
                $csv_line .= ',https://www.safetysignsandnotices.co.uk/image/' . $this->imageHack($variant['alternative_image'],600,600); //main_image_url
            else
                $csv_line .= ',https://www.safetysignsandnotices.co.uk/image/' . $this->imageHack($product['image'], 600,600); //main_image_url

            $csv_line .= ',,,,,,,,,';

            //variant
            $csv_line .= ',child'; //parent_child,
            $csv_line .= ','.$product['product_id'] ; //parent_sku
            $csv_line .= ',' . $variant_data['variant_type']; //variation_theme
            $csv_line .= ',Variation'; //relationship_type

            //BASIC

            $csv_line .= ',,' . $variant['variant_code'];  //part_number

            if(array_key_exists('reseller_variant',$variant ))
                $reseller_variants = $variant['reseller_variant'];
            else
                $reseller_variants = [];

            /*  if (array_key_exists('long_description', $reseller_variants))
                  $csv_line .= ',' . $reseller_variants['long_description']; //product_description
              else
                  $csv_line .= ',' . $product['long_description']; //product_description
            */

            if (array_key_exists('description', $reseller_variants))
                $csv_line .= ',"' . $reseller_variants['description'] .'"'; //product_description
            else
                $csv_line .= ',"' . $product['description'] .'"'; //product_description


            if (array_key_exists('description', $reseller_variants))
                $csv_line .= ',"' . $reseller_variants['description'] .'"'; //short_product_description
            else
                $csv_line .= ',"' . $product['description'] . '"'; //short_product_description


            //DISCOVERY
            $csv_line .= ',,,,';
            $csv_line .= ',';// . $variant['size_name']; //size_name
            $csv_line .= ',' . $variant['material_name']; //material_type
            $csv_line .= ',' . $variant['id']; //catalog_number



            if (array_key_exists('meta_keyword', $reseller_variants))
                $keywords = $reseller_variants['meta_keyword'];

            else
                $keywords = $product['meta_keyword'];

            $csv_line .= ',"' . $keywords. '"'; //generic_keywords

            // TODO - add in the bullet points once medusa allows

            $csv_line .= ', Sign measures : ' . $variant['size_name']; //bullet_point1
            $csv_line .= ', Sign material : ' . $variant['material_name']; //bullet_point2
            $csv_line .= ', Sign orientation : ' . $variant['size_orientation']; //bullet_point3
            $csv_line .= ', Made and Supplied in the UK by Safety Signs and Notices'; //bullet_point4
            $csv_line .= ','; //bullet_point4

            //target_audience_keywords1
            $kwar = explode(',', $keywords);
            $kw_count = 0;
            foreach ($kwar as $keyword) {
                $csv_line .= ',' . substr($keyword,0,50) ;
                $kw_count++;
                if ($kw_count == 5)
                    break;
            }
            while ($kw_count < 5) {
                $csv_line .= ',';
                $kw_count++;
            }

            $csv_line .= ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,';
            $csv_line .= ',';// . $variant['size_orientation']; //item_shape
            $csv_line .= ',1';// fulfillment_latency 1 -2 days
            $csv_line .= ',New'; // condition_type (New)
            $csv_line .= PHP_EOL;
        }
        return $csv_line;
    }

    private function noVariant($product, $variant_data){
        $csv_line = 'securityelectronics';
        $csv_line .= ',' . $product['product_id'] . '-' . $variant_data['variants'][0]['id']; //Seller SKU
        $csv_line .= ',Safety Signs & Notices'; //Brand
        $csv_line .= ',"0'.$variant_data['variants'][0]['gtin'].'",GTIN';  //external_product_id, external_product_id_type
        $csv_line .= ',' . $product['name'] .' '. $variant_data['variants'][0]['size_name'] . ' ' . $variant_data['variants'][0]['material_name'];; //Title
        $csv_line .= ',Safety Signs & Notices'; //Manufacturer
        $csv_line .= ',1939588031'; //ecommended_browse_nodes


        foreach ($variant_data['variants'] as $variant) {
            $csv_line .= ',' . $this->setTaxPrice($variant['variant_price'])  . ',50'; //standard_price, quantity
            if ($variant['alternative_image'] != null)
                $csv_line .= ',https://www.safetysignsandnotices.co.uk/image/' . $this->imageHack($variant['alternative_image'],600,600); //main_image_url
            else
                $csv_line .= ',https://www.safetysignsandnotices.co.uk/image/' . $this->imageHack($product['image'],600,600); //main_image_url

            //variant
            $csv_line .= ',,,,,,,,,,';
            $csv_line .= ',,'; //parent_child,parent_sku
            $csv_line .= ','; //variation_theme
            $csv_line .= ','; //relationship_type

            //BASIC
            $csv_line .= ',' . $variant['variant_code'];  //part_number

            if(array_key_exists('reseller_variant',$variant ))
                $reseller_variants = $variant['reseller_variant'];
            else
                $reseller_variants = [];

            if (array_key_exists('description', $reseller_variants))
                $csv_line .= ',"' . $reseller_variants['description'] . '"'; //product_description
            else
                $csv_line .= ',"' . $product['description'] .'"'; //product_description

            /*
             * if (array_key_exists('long_description', $reseller_variants))
                $csv_line .= ',' . $reseller_variants['long_description']; //product_description
            else
                $csv_line .= ',' . $product['long_description']; //product_description
             */
            if (array_key_exists('description', $reseller_variants))
                $csv_line .= ',"' . $reseller_variants['description'] .'"'; //short_product_description
            else
                $csv_line .= ',"' . $product['description'].'"'; //short_product_description


            //DISCOVERY
            $csv_line .= ',,,,';
            $csv_line .= ',';//size_name
            $csv_line .= ','; //material_type
            $csv_line .= ',' . $variant['id']; //catalog_number



            if (array_key_exists('meta_keyword', $reseller_variants))
                $keywords = $reseller_variants['meta_keyword'];

            else
                $keywords = $product['meta_keyword'];

            $csv_line .= ',"' . $keywords .'"'; //generic_keywords

            // TODO - add in the bullet points once medusa allows

            $csv_line .= ', Sign measures : ' . $variant['size_name']; //bullet_point1
            $csv_line .= ', Sign material : ' . $variant['material_name']; //bullet_point2
            $csv_line .= ', Sign orientation : ' . $variant['size_orientation']; //bullet_point3
            $csv_line .= ', Made and Supplied in the UK by Safety Signs and Notices'; //bullet_point4
            $csv_line .= ','; //bullet_point4

            //target_audience_keywords1
            $kwar = explode(',', $keywords);
            $kw_count = 0;
            foreach ($kwar as $keyword) {
                $csv_line .= ',' . substr($keyword,0,50) ;
                $kw_count++;
                if ($kw_count == 5)
                    break;
            }
            while ($kw_count < 5) {
                $csv_line .= ',';
                $kw_count++;
            }

            $csv_line .= ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,';
            $csv_line .= ',';// . $variant['size_orientation']; //item_shape
            $csv_line .= ',1';// fulfillment_latency 1 -2 days
            $csv_line .= ',New'; // condition_type (New)
            $csv_line .= PHP_EOL;
        }
        return $csv_line;
    }

    private function imageHack($filename, $width, $height)
    {
        $extension = pathinfo($filename, PATHINFO_EXTENSION);


        $image_old = $filename;
        $image_new = 'cache/' . utf8_substr($filename, 0, utf8_strrpos($filename, '.')) . '-' . (int)$width . 'x' . (int)$height . '.' . $extension;

        $this->load->model('tool/image');
        $this->model_tool_image->resize($filename, $width, $height);

        return $image_new;
    }

    private function sizeMaterialCheck($size_material_matrix, $size_id, $material_id)
    {
        foreach ($size_material_matrix as $size_mat_tuple){
            if( ($size_mat_tuple['size_id'] == $size_id) && ($size_mat_tuple['material_id'] == $material_id) )
                return true;
        }
        return false;
    }

    private function setTaxPrice($price){
        return  round($price * 1.2, 2);
    }

}

//=IF(D1 <> "",CONCATENATE(0,D1),"")