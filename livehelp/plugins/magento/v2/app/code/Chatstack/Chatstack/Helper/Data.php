<?php

namespace Chatstack\Chatstack\Helper;

use \Magento\Framework\App\Helper\Context;
use \Magento\Customer\Model\Session;
use \Magento\Store\Model\StoreManagerInterface;

class Data extends \Magento\Framework\App\Helper\AbstractHelper {

  private $customerSession;
  private $storeManager;

  public function __construct(Context $context, Session $customerSession, StoreManagerInterface $storeManager) {
    $this->customerSession = $customerSession;
    $this->storeManager = $storeManager;
    parent::__construct($context);
  }

  public function getServer() {
    $server = preg_replace('#^https?://|/$#', '', $this->storeManager->getStore()->getBaseUrl());
    return $server;
  }

  public function getCustomerEmail() {
    return $this->customerSession->getCustomer()->getEmail();
  }

  public function getCustomerName() {
    return $this->customerSession->getCustomer()->getName();
  }
}

?>
