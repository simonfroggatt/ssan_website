<?php
class ControllerExtensionFeedProductCats extends Controller {
	public function index() {


		$this->load->model('catalog/category');
		$this->load->model('catalog/product');

			$output = '';


		//	$allActiveProducts = $this->model_extension_feed_product_cats->getActiveProducts();

			$allActiveProducts =  $this->getAllActiveProducts();


			foreach ($allActiveProducts as $key => $product) {
				$output .= $product['name'].",".$product['model'].",".$product['product_id'].",";
				$output .= $this->getProductCategories($product['product_id']);
				$output .= "\n";
			//	if($key > 1)
			//		break;
			}


			$this->response->addHeader('Content-Type: text/csv');
			$this->response->setOutput($output);
		}

		protected function getAllActiveProducts()
		{
			$sql = "SELECT pdb.model, pdb.product_id, pdesc.`name` FROM " . DB_PREFIX . "product as pdb INNER JOIN " . DB_PREFIX . "product_description as pdesc ON pdb.product_id = pdesc.product_id WHERE pdb.`status` = 1 ORDER BY pdb.product_id ASC";
			$query = $this->db->query($sql);
			return $query->rows;
		}


		protected function getProductCategories($productID){
			$output = '';
			$categories = $this->model_catalog_product->getCategories($productID);
			$tmp = '';
			$string = '';
			foreach ($categories as $key => $category) {
				$path = $this->getPath($category['category_id']);
				if($key > 0)
					$output .= ',';
				if ($path) {
					$string = '';

					foreach (explode('_', $path) as $path_id) {
						$category_info = $this->model_catalog_category->getCategory($path_id);

						if ($category_info) {
							$cleancatname = str_replace('&', 'and', $category_info['name']);
							//$cleandesc = str_replace('-', '', $cleandesc);
							//$cleandesc = str_replace('/', '', $cleandesc);

							if (!$string) {

								$string = $category_info['name'];
							} else {
								$string .= ' > ' . $category_info['name'];
							}
						}
					}

					$output .= $string;

				}
			}
			return $output;
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

}
