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

use Smarty;

// Smarty Template
require_once('./include/smarty/Smarty.class.php');

require_once('./include/spiders.php');
require_once('./include/database.php');
require_once('./include/class.aes.php');
require_once('./include/class.cookie.php');
require_once('./include/class.session.php');
require_once('./include/core.config.php');
require_once('./include/class.push.php');
require_once('./include/class.models.php');
require_once('./include/core.functions.php');
require_once('./include/version.php');

if (!isset($_REQUEST['EMAIL'])){ $_REQUEST['EMAIL'] = ''; }

$email = trim($_REQUEST['EMAIL']);
$json = (isset($_REQUEST['JSON'])) ? true : false;

if ($json) {
	if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
		if (isset($_SERVER['HTTP_ORIGIN'])) {
			header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
			header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
			header('Access-Control-Allow-Headers: X-Requested-With');
			header('Access-Control-Allow-Credentials: true');
			header('Access-Control-Max-Age: 1728000');
			header('Content-Length: 0');
			header('Content-Type: text/plain');
			exit();
		} else {
			header('HTTP/1.1 403 Access Forbidden');
			header('Content-Type: text/plain');
			exit();
		}
	} else {
		// AJAX Cross-site Headers
		if (isset($_SERVER['HTTP_ORIGIN'])) {
			header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
			header('Access-Control-Allow-Credentials: true');
		}
	}
}

// Initialise Session
$session = new Session($_REQUEST['SESSION'], $_SETTINGS['AUTHKEY']);

// Existing Chat / Update Email
if ($session->chat > 0) {

	$chat = Chat::where_id_is($session->chat)->find_one();
	if ($_SETTINGS['DATABASEVERSION'] >= 17 && (empty($chat->hash) || empty($session->hash) || $chat->hash !== $session->hash)) {
		$chat = false;
	}

	if ($chat !== false) {

		// Update Email
		if (empty($chat->email) && !empty($email)) {

			$parts = explode('@', $email);
			if (is_array($parts)) {
				$name = $parts[0];
				$chat->name = $name;
			}

			$chat->email = $email;
			$chat->save();

			// Visitor Update Email Hook
			$hooks->run('VisitorUpdatedEmail', array('chat' => $chat, 'email' => $email));

		}

	}
}

if (file_exists('locale/' . LANGUAGE . '/guest.php')) {
	include('locale/' . LANGUAGE . '/guest.php');
}
else {
	include('locale/en/guest.php');
}

// Encrypt Session
$data = array('visitor' => $session->request, 'chat' => (int)$chat->id);
$encrypted = $session->encrypt($data);

$json = array();

if (defined('ACCOUNT') && strpos($session->request, 'visitor:' . ACCOUNT . ':') > -1) {
	$json['visitor'] = str_replace('visitor:' . ACCOUNT . ':', '', $session->request);
} else if (is_numeric($visitor->id) && (int)$visitor->id > 0) {
	$json['visitor'] = (int)$visitor->id;
}

$json['chat'] = (int)$chat->id;
$json['session'] = $encrypted;
$json['email'] = (!empty($email)) ? $email : false;
$json = json_encode($json);

if (!isset($_GET['callback'])) {
	header('Content-Type: application/json; charset=utf-8');
	exit($json);
} else {
	if (is_valid_callback($_GET['callback'])) {
		header('Content-Type: text/javascript; charset=utf-8');
		exit($_GET['callback'] . '(' . $json . ')');
	} else {
		header('HTTP/1.1 400 Bad Request');
		exit();
	}
}

?>
