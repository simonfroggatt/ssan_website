<?php
namespace Chatstack\Chatstack\Block;

use \Magento\Framework\View\Element\Template\Context;
use \Chatstack\Chatstack\Helper\Data;

class CodeBlock extends \Magento\Framework\View\Element\Template {

  private $dataHelper;

  public function __construct(Context $context, Data $dataHelper, array $data = []) {
    parent::__construct($context, $data);
    $this->dataHelper = $dataHelper;
  }

  public function getServer() {
    $result = false;

    $url = $this->dataHelper->getServer();
    if (!empty($url)) {
      $result = $url;
    }
    return $result;
  }

  public function getCustomerName() {
    $result = false;

    $name = trim($this->dataHelper->getCustomerName());
    if (!empty($name)) {
      $result = $name;
    }
    return $result;
  }

  public function getCustomerEmail() {
    $result = false;

    $email = $this->dataHelper->getCustomerEmail();
    if (!empty($email)) {
      $result = $email;
    }
    return $result;
  }
}

?>
