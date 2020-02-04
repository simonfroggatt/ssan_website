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

require_once('./include/database.php');
require_once('./include/class.aes.php');
require_once('./include/class.cookie.php');
require_once('./include/class.session.php');
require_once('./include/class.email.php');
require_once('./include/core.functions.php');
require_once('./include/core.config.php');
require_once('./include/class.models.php');
require_once('./include/class.push.php');

ignore_user_abort(true);

if (!isset($_REQUEST['RATING'])){ $_REQUEST['RATING'] = ''; }

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

header('Content-type: text/html; charset=utf-8');

if (defined('LANGUAGE')) {
	include('./locale/' . LANGUAGE . '/guest.php');
} else {
	include('./locale/en/guest.php');
}

// Initialise Session
$session = new Session($_REQUEST['SESSION'], $_SETTINGS['AUTHKEY']);

if ($session->chat > 0) {

	$chat = Chat::where_id_is($session->chat)->find_one();

	if ($chat !== false) {

		// Update Rating
		$rating = (int)$_REQUEST['RATING'];
		if (!empty($rating) && $rating > 0 && $rating < 6) {

			$owner = false;
			$current = time();

			$users = $chat->session()->find_many();
			foreach ($users as $key => $value) {
				$time = strtotime($value->accepted);
				if ($time < $current || ($owner != false && $time > strtotime($owner->accepted))) {
					$owner = $value;
				}
			}

			if ($owner != false) {
				$rate = Rating::where('chat', $chat->id)
					->where('user', $owner->user)
					->find_one();

				$updated = false;
				if ($rate !== false) {
					if ((int)$rate->rating !== $rating) {
						$rate->rating = $rating;
						$rate->save();

						$updated = true;
					}
				} else {
					$rate = Rating::create();
					$rate->chat = $chat->id;
					$rate->user = $owner->user;
					$rate->rating = $rating;
					$rate->save();

					$updated = true;
				}
				$rate->save();

				if ($_SETTINGS['TRANSCRIPTVISITORALERTS'] == true) {

					if ($updated !== false && $chat->session()->count() > 0) {

						switch ($rating) {
							case 1:
								$rating = $_LOCALE['poor'];
								break;
							case 2:
								$rating = $_LOCALE['neutral'];
								break;
							case 3:
								$rating = $_LOCALE['good'];
								break;
						}

						$content = sprintf($_LOCALE['ratedchat'], $chat->name, $rating);

						$message = Message::create();
						$message->chat = $chat->id;
						$message->username = $chat->name;
						$message->datetime = date('Y-m-d H:i:s', time());
						$message->message = $content;
						$message->align = 2;
						$message->status = -3;
						$message->save();
					}
				}
			}

		}
	}
}
?>
