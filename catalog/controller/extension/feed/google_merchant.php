<?php
class ControllerExtensionFeedGoogleMerchant extends Controller {
	public function index() {
		$counter = 0;
		$varcount = 0;
		if ($this->config->get('google_base_status')) {
			$output  = '<?xml version="1.0" encoding="UTF-8" ?>';
			$output .= '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">';
			$output .= '  <channel>';
			$output .= '  <title>' . $this->config->get('config_name') . '</title>';
			$output .= '  <description>' . $this->config->get('config_meta_description') . '</description>';
			$output .= '  <link>' . $this->config->get('config_url') . '</link>';

		//	$this->load->model('extension/feed/google_merchant');
			$this->load->model('catalog/category');
			$this->load->model('catalog/product');
				$this->load->model('extension/feed/google_merchant_ssan');
			$this->load->model('ssan/google_product_markup');

			$this->load->model('tool/image');

		//	$this->load->model('catalog/url_alias');

			//	$prodData = $this->model_ssan_google_product_markup->getProductVariantDetails(20);

		//	$this->loag->model('')
	//		$output =  getCategories(249);
	if (isset($this->request->get['prodid'])) {
			$products[0]['product_id'] = $this->request->get['prodid'];
	}
	else{
		$products = $this->model_extension_feed_google_merchant_ssan->GetAllAvailableProducts();
	}

			foreach($products as $productID) {
				/*if($counter > 1000){
					break;
				}*/
				$product = $this->model_catalog_product->getProduct((int)$productID['product_id']);
				$prodDataArr = $this->model_ssan_google_product_markup->getProductVariantDetails($product['product_id']);
				$categories = $this->model_catalog_product->getCategories($product['product_id']);
				$tmp = '';
				$outputCat = '';
				/*if(sizeof($categories) > 1){
					$outputCat .= "<g:custom_label_0>multicats</g:custom_label_0>";
				}*/
				$googleCat = $this->model_ssan_google_product_markup->getGoogleCategory($categories[0]['category_id']);

				foreach ($categories as $cat_key_id => $category) {
					$path = $this->getPath($category['category_id']);

					if ($path) {
						$string = '';

						foreach (explode('_', $path) as $path_id) {
							$category_info = $this->model_catalog_category->getCategory($path_id);

							if ($category_info) {
								$cleancatname = str_replace('&', 'and', $category_info['adwords_name']);
								//$cleandesc = str_replace('-', '', $cleandesc);
								//$cleandesc = str_replace('/', '', $cleandesc);

								if (!$string) {

									$string = strip_tags(html_entity_decode($cleancatname, ENT_QUOTES, 'UTF-8'));
								} else {
									$string .= ' &gt; ' . strip_tags(html_entity_decode($cleancatname, ENT_QUOTES, 'UTF-8'));
								}
							}
						}

						$outputCat .= '<g:product_type><![CDATA[' . $string . ']]></g:product_type>';
						//$outputCat .= "<g:custom_label_".($cat_key_id+1)."><![CDATA[$string]]></g:custom_label_".($cat_key_id+1).">";
					//		$output .= '<g:product_type>' . $string . '</g:product_type>';
					//	  $output .= "<g:custom_label_".($cat_key_id+1).">". $string . "</g:custom_label_".($cat_key_id+1).">";
					}
				}
			//	print_r($prodDataArr);
				foreach($prodDataArr as $prodData) {
					$cleanname = str_replace('&', 'and', $product['name']);
					$cleanname = str_replace('-', '', $cleanname);
					$cleanname = str_replace('/', '', $cleanname);

					$cleandesc = str_replace('&', 'and', $product['description']);
					$cleandesc = str_replace('-', '', $cleandesc);
					$cleandesc = str_replace('/', '', $cleandesc);
					$cleandesc = str_replace("\n", '<br>', $cleandesc);
					$cleandesc = str_replace("\r", '<br>', $cleandesc);

					$materialID = $prodData['product_material_id'];
					$strpos = -1;
					if($materialID == 1) {  //self adhesive
						$strpos = stripos($cleanname, "sticker");
						if($strpos <= 0){
							$cleanname = str_ireplace(" sign", '', $cleanname);
							$cleanname .= ' Sign Sticker';
						}

					}
					elseif( ($materialID == 8) || ($materialID == 122) || ($materialID == 126) || ($materialID == 127) || ($materialID == 128) || ($materialID == 129) || ($materialID == 130) ) {  //self adhesive
                        $strpos = stripos($cleanname, "sticker");
                        if($strpos <= 0){
                            //$cleanname = str_ireplace(" sign", '', $cleanname);
                            $cleanname .= ' Sticker';
                        }

                    }
					else{
						$strpos = stripos($cleanname, "sign");
						if($strpos <= 0){
							$cleanname = str_ireplace(" sticker", '', $cleanname);
							$cleanname .= ' Sign';
						}

					}

					$materialName = $prodData['material_name'];

					$sizeName = $prodData['size_name'];
					$mmCount = substr_count($sizeName, 'mm');
					if($mmCount > 1){
						$sizeName = $this->str_replace_first('mm', '', $sizeName);
					}
					$sizeOrientation = $prodData['size_orientation'];
					$productImageOut = $product['image'];

					if($prodData['alternative_image'] != null){
						$productImageOut = $prodData['alternative_image'];
					}
					//look for & in image and skip it

					$output .= '<item>';

					$titleTmp = strip_tags(html_entity_decode($cleanname, ENT_QUOTES, 'UTF-8'));
					$titleSizeMaterial = ' - '. $sizeName.' - '.$materialName. ' - '.$sizeOrientation;

					$titleTmp = (strlen($titleTmp) + strlen($titleSizeMaterial) ) > 150 ? substr($titleTmp,0,145 - strlen($titleSizeMaterial)).'...'. $titleSizeMaterial: $titleTmp . $titleSizeMaterial;

					$output .= '<title><![CDATA[' .$titleTmp.']]></title>';
					$tmp = $this->url->link('product/product', 'product_id=' . $product['product_id']).'?variantid='. $prodData['id'];
					$output .= '<link>' . $this->url->link('product/product', 'product_id=' . $product['product_id']).'&amp;variantid='. $prodData['id']. '</link>';
					$output .= '<description><![CDATA[' . (html_entity_decode($cleandesc, ENT_QUOTES, 'UTF-8')) . ']]></description>';
					$output .= '<g:brand><![CDATA[Safety Signs and Notices]]></g:brand>';
					$output .= '<g:condition>new</g:condition>';
					$output .= '<g:id>' . $prodData['id'] . 'v20</g:id>';   //rec_var.prod_var_id+"v20
					$output .= '<g:item_group_id>' . $product['product_id'] . '</g:item_group_id>';   //rec_var.prod_var_id+"v20

					$output .= $outputCat;


					if ($product['image']) {
						$output .= '<g:image_link>' . $this->model_tool_image->resize($productImageOut, 500, 500) . '</g:image_link>';
					} else {
						$output .= '<g:image_link></g:image_link>';
					}

				//	$output .= '  <g:model_number>' . $product['model'] . '</g:model_number>';

					if ($prodData['gtin']) {
						$output .= '<g:gtin><![CDATA[' . $prodData['gtin'] . ']]></g:gtin>' ;
					} else {
						$output .= '<g:identifier_exists>false</g:identifier_exists>';
					}


					$currencies = array(
						'USD',
						'EUR',
						'GBP'
					);

					if (in_array($this->session->data['currency'], $currencies)) {
						$currency_code = $this->session->data['currency'];
						$currency_value = $this->currency->getValue($this->session->data['currency']);
					} else {
						$currency_code = 'USD';
						$currency_value = $this->currency->getValue('USD');
					}


					$output .= '<g:price>' . $this->currency->format($this->tax->calculate($prodData['variant_price'], $product['tax_class_id']), $currency_code, $currency_value, false) . '  GBP</g:price>';
					$priceout = $this->currency->format($this->tax->calculate($prodData['variant_price'], $product['tax_class_id']), $currency_code, $currency_value, false);

					$output .= '<g:google_product_category>' . $googleCat . '</g:google_product_category>';
					$output .= '<g:size>' . $sizeName . '</g:size>';
					$output .= '<g:material>' . $materialName . '</g:material>';
                    $output .= "<g:custom_label_0>".$materialName."</g:custom_label_0>";
                    $output .= "<g:custom_label_1>".$sizeName."</g:custom_label_1>";
					$output .= '<g:availability><![CDATA[' . ($product['quantity'] ? 'in stock' : 'out of stock') . ']]></g:availability>';


					$output .= '</item>';
					$output .= "\r\n";
					$varcount++;
				}
				$counter++;
			}


			$output .= '  </channel>';
			$output .= '</rss>';
		//	$output .= $varcount;

			$this->response->addHeader('Content-Type: application/rss+xml');
			$this->response->setOutput($output);
		}
	}


	protected function getPath($parent_id, $current_path = '') {
		$category_info = $this->model_catalog_category->getCategory($parent_id);

		if ($category_info) {
			if (!$current_path) {
				$new_path = $category_info['category_id'];
			} else {
				$new_path = $category_info['category_id'] . '_' . $current_path;
			}

			$path = $this->getPath($category_info['parent_id'], $new_path);

			if ($path) {
				return $path;
			} else {
				return $new_path;
			}
		}
	}


	protected function getCategories($parent_id, $current_path = '', $parent_cat_name = '') {
		$output = '';
		$cat_path_name = $parent_cat_name;

		$results = $this->model_catalog_category->getCategories($parent_id);
			$count = 0;
		foreach ($results as $result) {
			$count++;

			if (!$current_path) {
				$new_path = $result['category_id'];
				$cat_path_name = $result['adwords_name'];
			} else {
				$new_path = $current_path . '_' . $result['category_id'];
				$cat_path_name = $parent_cat_name ."_".$result['adwords_name'];
			}

			$googleCat = $this->model_ssan_google_product_markup->getGoogleCategory($result['category_id']);
			$products = $this->model_catalog_product->getProducts(array('filter_category_id' => $result['category_id']));

			foreach ($products as $product) {
				if($product['include_google_merchant'] != 1) {
					continue;
				}

				$prodDataArr = $this->model_ssan_google_product_markup->getProductVariantDetails($product['product_id']);
			//	print_r($prodDataArr);
				foreach($prodDataArr as $prodData) {
				$count++;
			//	$output = "";

				/*if(($product['product_id'] == 5168) && ($result['category_id'] == 567) ){
				//	$output = "";
					$tmp = str_replace('&', 'and', $product['name']);

				}*/

				$cleanname = str_replace('&', 'and', $product['name']);
				$cleanname = str_replace('-', '', $cleanname);
				$cleanname = str_replace('/', '', $cleanname);

				$cleandesc = str_replace('&', 'and', $product['description']);
				$cleandesc = str_replace('-', '', $cleandesc);
				$cleandesc = str_replace('/', '', $cleandesc);

				$tmpval = $result['category_id'].'_'.$product['product_id'];


				$materialName = $prodData['material_name'];
				$sizeName = $prodData['size_name'];
				$sizeOrientation = $prodData['size_orientation'];
				$productImageOut = $product['image'];

				if($prodData['alternative_image'] != null){
					$productImageOut = $prodData['alternative_image'];
				}


				$output .= '<item>';

				$titleTmp = strip_tags(html_entity_decode($cleanname, ENT_QUOTES, 'UTF-8'));
				$titleSizeMaterial = ' - '. $sizeName.' - '.$materialName;

				$titleTmp = (strlen($titleTmp) + strlen($titleSizeMaterial) ) > 150 ? substr($titleTmp,0,145 - strlen($titleSizeMaterial)).'...'. $titleSizeMaterial: $titleTmp . $titleSizeMaterial;

				$output .= '<title><![CDATA[' .$titleTmp.']]></title>';
				$tmp = $this->url->link('product/product', 'product_id=' . $product['product_id']).'?variantid='. $prodData['id'];
				$output .= '<link>' . $this->url->link('product/product', 'product_id=' . $product['product_id']).'?variantid='. $prodData['id']. '</link>';
				$output .= '<description><![CDATA[' . strip_tags(html_entity_decode($cleandesc, ENT_QUOTES, 'UTF-8')) . ']]></description>';
				$output .= '<g:brand><![CDATA[Safety Signs and Notices]]></g:brand>';
				$output .= '<g:condition>new</g:condition>';
				$output .= '<g:id>' . $prodData['id'] . 'v20</g:id>';   //rec_var.prod_var_id+"v20
				$output .= '<g:item_group_id>' . $product['product_id'] . '</g:item_group_id>';   //rec_var.prod_var_id+"v20
              /*      $output .= "<g:custom_label_0>".$materialName."</g:custom_label_0>";
                    $output .= "<g:custom_label_1>".$size_name."</g:custom_label_1>";
*/
				$categories = $this->model_catalog_product->getCategories($product['product_id']);
				$tmp = '';
				/*if(sizeof($categories) > 1){
					$output .= "<g:custom_label_0>multicats</g:custom_label_0>";
				}*/
/*
				foreach ($categories as $cat_key_id => $category) {
					$path = $this->getPath($category['category_id']);

					if ($path) {
						$string = '';

						foreach (explode('_', $path) as $path_id) {
							$category_info = $this->model_catalog_category->getCategory($path_id);

							if ($category_info) {
								$cleancatname = str_replace('&', 'and', $category_info['adwords_name']);
								//$cleandesc = str_replace('-', '', $cleandesc);
								//$cleandesc = str_replace('/', '', $cleandesc);

								if (!$string) {

									$string = strip_tags(html_entity_decode($cleancatname, ENT_QUOTES, 'UTF-8'));
								} else {
									$string .= ' &gt; ' . strip_tags(html_entity_decode($cleancatname, ENT_QUOTES, 'UTF-8'));
								}
							}
						}

						$output .= '<g:product_type><![CDATA[' . $string . ']]></g:product_type>';
					  $output .= "<g:custom_label_".($cat_key_id+1)."><![CDATA[$string]]></g:custom_label_".($cat_key_id+1).">";
					//		$output .= '<g:product_type>' . $string . '</g:product_type>';
					//	  $output .= "<g:custom_label_".($cat_key_id+1).">". $string . "</g:custom_label_".($cat_key_id+1).">";
					}
				}
*/

			//	$tmpimage = '<image:loc>' . $this->model_tool_image->resize($product['image'], $this->config->get($this->config->get('config_theme') . '_image_popup_width'), $this->config->get($this->config->get('config_theme') . '_image_popup_height')) . '</image:loc>';

				if ($product['image']) {
					$output .= '<g:image_link>' . $this->model_tool_image->resize($productImageOut, 500, 500) . '</g:image_link>';
				} else {
					$output .= '<g:image_link></g:image_link>';
				}

			//	$output .= '  <g:model_number>' . $product['model'] . '</g:model_number>';

				if ($product['mpn']) {
					$output .= '<g:mpn><![CDATA[' . $product['mpn'] . ']]></g:mpn>' ;
				} else {
					$output .= '<g:identifier_exists>false</g:identifier_exists>';
				}


				$currencies = array(
					'USD',
					'EUR',
					'GBP'
				);

				if (in_array($this->session->data['currency'], $currencies)) {
					$currency_code = $this->session->data['currency'];
					$currency_value = $this->currency->getValue($this->session->data['currency']);
				} else {
					$currency_code = 'USD';
					$currency_value = $this->currency->getValue('USD');
				}


				$output .= '<g:price>' . $this->currency->format($this->tax->calculate($prodData['variant_price'], $product['tax_class_id']), $currency_code, $currency_value, false) . '  GBP</g:price>';
				$priceout = $this->currency->format($this->tax->calculate($prodData['variant_price'], $product['tax_class_id']), $currency_code, $currency_value, false);
				$output .= '<g:google_product_category>' . $googleCat . '</g:google_product_category>';

				$categories = $this->model_catalog_product->getCategories($product['product_id']);


				$output .= '<g:size>' . $sizeName . '</g:size>';
				$output .= '<g:material>' . $materialName . '</g:material>';

			//	$output .= '  <g:quantity>' . $product['quantity'] . '</g:quantity>';
				//$output .= '  <g:weight>' . $this->weight->format($product['weight'], $product['weight_class_id']) . '</g:weight>';
				$output .= '<g:availability><![CDATA[' . ($product['quantity'] ? 'in stock' : 'out of stock') . ']]></g:availability>';

			/*	if(sizeof($categories) > 1)
				{
					$output .= "<g:custom_label_0>multicats</g:custom_label_0>";
				}
				*/
					//custom_​label_​0
		/*			$cat_array = explode('_', $path);
					foreach($cat_array as $cat_key => $cat_value){
						$tmpcustom = "<g:custom_label_$cat_key>$cat_value</g:custom_label_$cat_key>";
			//			$output .= "<g:custom_label_".$cat_key.">" . $cat_value . "</g:custom_label_".$cat_key.">";

						//	$output .= '  <g:customcat​'.$cat_key.'>' . $cat_value . '</g:customcat​'.$cat_key.'>';
					}
					$cat_array_name = explode('_', $cat_path_name);
								foreach($cat_array_name as $cat_key_id => $cat_value_name){
								//	$tmpcustom = "<g:custom_label_$cat_key>$cat_value</g:custom_label_$cat_key>";
									$output .= "<g:custom_label_".$cat_key_id."><![CDATA[" . $cat_value_name . "]]></g:custom_label_".$cat_key_id.">";
								//	$output .= "<g:custom_label_".$cat_key_id.">" . $cat_value_name . "</g:custom_label_".$cat_key_id.">";
							}

*/
			//	$output .= $this->getCustomLabels($product['product_id']);
				$output .= '</item>';


			}  //end each variant
		}  //end each product


	//	if($count > 1)
	//		break;
			$output .= $this->getCategories($result['category_id'], $new_path, $cat_path_name);
		}


		return $output;
	}
/*
	protected function getPath($parent_id, $current_path = '') {
		$category_info = $this->model_catalog_category->getCategory($parent_id);

		if ($category_info) {
			if (!$current_path) {
				$new_path = $category_info['category_id'];
			} else {
				$new_path = $category_info['category_id'] . '_' . $current_path;
			}

			$path = $this->getPath($category_info['parent_id'], $new_path);

			if ($path) {
				return $path;
			} else {
				return $new_path;
			}
		}
	}
*/

	protected function getFullPath($parent_id, $current_path = '')
	{
		$category_info = $this->model_catalog_category->getCategory($parent_id);
		$new_path = $current_path;
		if ($category_info) {
			if (!$current_path) {
				$new_path = $category_info['adwords_name'];
			} else {
				$new_path = $category_info['adwords_name'] . '_'.$current_path;
			}

			$path = $this->getFullPath($category_info['parent_id'], $new_path);

			if ($path) {
				return $path;
			} else {
				return $new_path;
			}
		}
	}

	protected function getCustomLabels($product_id) {
		$customOut = '';
		$customout = '';
		$categories = $this->model_catalog_product->getCategories($product_id);
		foreach ($categories as $category_key => $category) {
			$path = $this->getFullPath($category['category_id']);
			$string = '';
			foreach (explode('_', $path) as $cat_key_id => $path_name) {
					$cat_value_name = str_replace('&', 'and', $path_name);
					$cat_value_name = str_replace('-', '', $cat_value_name);
					$cat_value_name = str_replace('/', '', $cat_value_name);

					if($cat_key_id > 0){
						 $string .= ' &gt; ';
					}
					$string .= strip_tags(html_entity_decode($cat_value_name, ENT_QUOTES, 'UTF-8'));
					$customOut .= '<g:product_type><![CDATA[' . $string . ']]></g:product_type>';
			}
	/*		if($category_key > 0){
				$labelsout .= ", ".$string;
			}
			else{
				$labelsout = $string;
			}
*/

		}
	//	$customOut = '<g:product_type><![CDATA[' . $labelsout . ']]></g:product_type>';
		return $customOut;
	}

	protected function str_replace_first($search, $replace, $subject) {
    $pos = strpos($subject, $search);
    if ($pos !== false) {
        return substr_replace($subject, $replace, $pos, strlen($search));
    }
    return $subject;
}

}
