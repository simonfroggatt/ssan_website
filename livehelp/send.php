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

use DateTime;

require_once('./include/database.php');
require_once('./include/class.aes.php');
require_once('./include/class.cookie.php');
require_once('./include/class.session.php');
require_once('./include/class.push.php');
require_once('./include/core.config.php');
require_once('./include/class.models.php');
require_once('./include/core.functions.php');

if (!isset($_REQUEST['JSON'])){ $_REQUEST['JSON'] = ''; }

ignore_user_abort(true);

if (!isset($_REQUEST['MESSAGE'])){ $_REQUEST['MESSAGE'] = ''; }

// Initialise Session
$session = new Session($_REQUEST['SESSION'], $_SETTINGS['AUTHKEY']);

// Guest Chat Session
$chat = false;
if ($session->chat > 0) {

	// Chat
	$chat = Chat::where_id_is($session->chat)->find_one();

	// Blocked Chat
	if ($chat !== false && $chat->status == -3) {
		header('HTTP/1.1 403 Access Forbidden');
		header('Content-Type: text/plain');
		exit();
	}

} else {
	header('HTTP/1.1 403 Access Forbidden');
	header('Content-Type: text/plain');
	exit();
}

$id = false;

if ($chat !== false && !empty($_REQUEST['MESSAGE'])) {

	$content = trim($_REQUEST['MESSAGE']);

	$date = new DateTime();

	// Send Guest Message
	$message = Message::create();
	$message->chat = $chat->id;
	$message->username = $chat->name;
	$message->datetime = $date->format('Y-m-d H:i:s');
	$message->message = $content;
	$message->align = 1;
	$message->status = 0;
	$message->save();

	$id = (int)$message->id;
	$datetime = $date->getTimestamp();

	// Format Date
	$message->datetime = $date->format('c');

	// Send Message Device Notification
	$hooks->run('SendMessage', array('chat' => $chat, 'message' => $message, 'guest' => true));

}

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

	$json = array();
	$json['id'] = $id;
	$json['datetime'] = $datetime;
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
}
?>
