<?php
/*
Chatstack - https://www.chatstack.com
Copyright - All Rights Reserved - Stardevelop Pty Ltd

You may not distribute this program in any manner,
modified or otherwise, without the express, written
consent from Stardevelop Pty Ltd (https://www.chatstack.com)

You may make modifications, but only for your own
use and within the confines of the License Agreement.
All rights reserved.

Selling the code for this program without prior
written consent is expressly forbidden. Obtain
permission before redistributing this program over
the Internet or in any other medium.  In all cases
copyright and header must remain intact.
*/
namespace stardevelop\chatstack;

error_reporting(E_ALL);
ini_set('display_errors', true);

require 'vendor/autoload.php';

use Services_FullContact_Person;

// Live Help Database
require_once __DIR__ . '/../../../include/database.php';
require_once __DIR__ . '/../../../include/core.config.php';
require_once __DIR__ . '/../../../include/class.aes.php';
require_once __DIR__ . '/../../../include/class.models.php';

// FullContact Models
require_once __DIR__ . '/../class.models.php';

// Middleware
require_once __DIR__ . '/Middleware/CustomAuth.php';

// Extend FullContact and return raw JSON
class Services_FullContact_Person_Json extends Services_FullContact_Person
{
    public function lookupByEmailJson($search)
    {
        $this->_execute(array('email' => $search, 'method' => 'email'));

        return $this->response_json;
    }
}

// Error Logging
//$env = \Slim\Environment::getInstance();
//$env['slim.errors'] = fopen('/var/log/php-fpm/www-error.log', 'a');

// Instantiate a Slim application
$app = new \Slim\Slim();
$app->config('debug', true);

// Register Middleware
$app->add(new CustomAuth());

// Slim Routes
$app->get('/', function () use ($app) {
	$app->redirect('/chat/admin/index.php');
});

// Email Route
$app->get('/person/:email', function($email) use($app) {
  $json = false;
  $nocredit = false;

  if (defined('FULLCONTACTAPIKEY')) {
    try {

      $cached = false;
      $time = time() - 7776000; // 90 Days = 7776000 seconds

      // Check FullContact Cached Data
      $fullcontactperson = FullContactPerson::where('email', $email)
        ->where_gt('datetime', date('Y-m-d H:i:s', $time))
        ->find_one();

      if ($fullcontactperson !== false) {
        $cached = true;
        $json = $fullcontactperson->data;
      }

      if (!$cached) {

        // FullContact API Lookup
        $fullcontact = new Services_FullContact_Person_Json(FULLCONTACTAPIKEY);
        $json = $fullcontact->lookupByEmailJson($email);

        $person = json_decode($json);

        if ($person->status == 200) {
          if ($fullcontactperson === false) {
            $fullcontactperson = FullContactPerson::create();
            $fullcontactperson->email = $email;
            $fullcontactperson->datetime = date('Y-m-d H:i:s', time());
            $fullcontactperson->data = $json;
          }
          $fullcontactperson->save();
        } else {
          $json = false;
        }
      }

    } catch (Services_FullContact_Exception_NoCredit $ex) {
      // Return FullContact Credit Error
      $res = $app->response();
			$res->status(403);
			$app->stop();
    }
  }

  if ($json !== false) {
    $res = $app->response();
  	$res['Content-Type'] = 'application/json';
  	echo $json;
  } else {
    $res = $app->response();
    $res->status(404);
    $app->stop();
  }

});

// Run the Slim application
$app->run();

?>
