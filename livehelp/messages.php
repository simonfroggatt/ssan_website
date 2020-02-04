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
require_once('./include/core.config.php');
require_once('./include/class.models.php');
require_once('./include/core.functions.php');

if (!isset($_REQUEST['ID'])){ $_REQUEST['ID'] = ''; }
if (!isset($_REQUEST['MESSAGE'])){ $_REQUEST['MESSAGE'] = 0; }
if (!isset($_REQUEST['TYPING'])){ $_REQUEST['TYPING'] = ''; }
if (!isset($_REQUEST['TIME'])){ $_REQUEST['TIME'] = ''; }

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

$message = $_REQUEST['MESSAGE'];
$status = $_REQUEST['TYPING'];
$active = 0;
$chat = false;
$typing = false;

// Initialise Session
$session = new Session($_REQUEST['SESSION'], $_SETTINGS['AUTHKEY']);

if ($session->chat > 0) {

	$chat = Chat::where_id_is($session->chat)->find_one();
	if ($_SETTINGS['DATABASEVERSION'] >= 17 && (empty($chat->hash) || empty($session->hash) || $chat->hash !== $session->hash)) {
		$chat = false;
	}

	if ($chat !== false) {

		if ($chat->status == 1) {
			// Accepted Operator
			$operator = $chat->session()->order_by_desc('requested')->find_one()->operator()->find_one();
			if ($chat !== false && $chat->status == 1 && $operator !== false) {
				$active = $operator->id;
			} else {
				$active = $chat->status;
			}
		}

		// Update Typing Status
		$typing = $chat->typing()->where('user', $active)->find_one();

		$result = false;
		if ($typing !== false) {
			if (isset($_COOKIE['LiveHelpOperator'])) {
				if ($status) { // Currently Typing
					switch((int)$typing->status) {
						case 0: // None
						case 2: // Operator Only
							$result = 2;
							break;
						case 1: // Guest Only
						case 3: // Both
							$result = 3;
							break;
					}
				}
				else { // Not Currently Typing
					switch((int)$typing->status) {
						case 0: // None
						case 2: // Operator Only
							$result = 0;
							break;
						case 1: // Guest Only
						case 3: // Both
							$result = 1;
							break;
					}
				}
			} else {
				if ($status) { // Currently Typing
					switch((int)$typing->status) {
						case 0: // None
						case 1: // Guest Only
							$result = 1;
							break;
						case 2: // Operator Only
						case 3: // Both
							$result = 3;
							break;
					}
				}
				else { // Not Currently Typing
					switch((int)$typing->status) {
						case 0: // None
						case 1: // Guest Only
							$result = 0;
							break;
						case 2: // Operator Only
						case 3: // Both
							$result = 2;
							break;
					}
				}
			}
		} else {
			if ($status) {
				$result = 1;
			}
		}

		// Typing
		if ($chat->status == 1 && $active > 0 && $result !== false) {
			if ($typing !== false) {
				$typing->status = $result;
			} else {
				$typing = Typing::create();
				$typing->id = sha1((string)$chat->id . (string)$active, true);
				$typing->chat = $chat->id;
				$typing->user = $active;
				$typing->status = $result;
			}
			$typing->save();
		}
	}
}

// Check if Accepted Chat
if ($chat !== false) {
	$username = $chat->name;
	$datetime = $chat->datetime;
	$department = $chat->department;
}

// HTTP/1.1
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', false);

// HTTP/1.0
header('Pragma: no-cache');
header('Content-type: text/html; charset=utf-8');

if (file_exists('locale/' . LANGUAGE . '/guest.php')) {
	include('locale/' . LANGUAGE . '/guest.php');
}
else {
	include('locale/en/guest.php');
}

// JSON Messages
$messages = false;
$messagesjson = array();
if ($chat !== false && $chat->status == 1) {

	if ($message > 0) {
		// New Messages
		$messages = Message::where('chat', $chat->id)
			->where_gt('id', (int)$message)
			->where_gte('status', 0)
			->find_many();

	} else {
		// All Messages except PUSH
		$messages = Message::where('chat', $chat->id)
			->where_gte('id', (int)$message)
			->where_gte('status', 0)
			->where_not_equal('status', 4)
			->find_many();
	}

	if ($messages !== false) {
		$joined = array();

		foreach ($messages as $key => $value) {
			// New Message
			if ((unixtimestamp($value->datetime) - unixtimestamp($datetime)) > 0) {
				// Operator Joined Chat Message
				if (($operator !== false && $operator->username != $value->username) && $value->status > 0) {

					$user = Operator::where('username', $value->username)->find_one();

					if ($user !== false && !in_array($user->id, $joined)) {
						if (!empty($user->firstname) && !empty($user->lastname)) {
							$content = sprintf('%s %s %s', $user->firstname, $user->lastname, $_LOCALE['joinedconversation']);
						} else {
							$content = sprintf('%s %s', $user->firstname, $_LOCALE['joinedconversation']);
						}
						$joined[] = $user->id;

						$messagesjson[] = array('id' => '', 'datetime' => unixtimestamp($value->datetime), 'hash' => md5($user->username), 'content' => $content, 'align' => 2, 'status' => 8);
					}
				}
			}
		}
	}
}

/*
// Check for Operator Connection Issue
$operator = false;
$operator = Operator::where_id_is($active)
	->where_gt('refresh', date('Y-m-d H:i:s', time() - $_SETTINGS['CONNECTIONTIMEOUT'] * 2))
	->find_one();
*/

if ($_SETTINGS['CHATUSERNAME'] == false) { $username = ''; }

// Override jQuery $_SETTINGS['JQUERY'] = 'CustomObject.jQuery';

if ($chat !== false && $chat->status == 1 && $message == 0) {

	if ($operator !== false) {
		$name = $operator->firstname . ' ' . $operator->lastname;
		$depmnt = explode(';', $operator->department);
		if (count($department) > 0) {
			$depmnt = $depmnt[0];
		}

		$hash = '';
		if (!empty($operator->email)) {
			$hash = md5($operator->email);
		}
		$parameters = "[{$operator->id}, '" . addslashes($name) . "', '" . addslashes($depmnt) . "', '" . addslashes($hash) . "']";
		$javascript = "if (typeof jQuery !== 'undefined') { jQuery(document).trigger('LiveHelp.Connected', " . $parameters . "); } if (typeof Chatstack !== 'undefined' && typeof Chatstack.jQuery !== 'undefined') { Chatstack.jQuery(document).trigger('LiveHelp.Connected', " . $parameters . "); }";
		if (isset($_SETTINGS['JQUERY'])) {
			$javascript .= " if (typeof " . $_SETTINGS['JQUERY'] . " !== 'undefined' && typeof " . $_SETTINGS['JQUERY'] . ".jQuery !== 'undefined') { " . $_SETTINGS['JQUERY'] . ".jQuery(document).trigger('LiveHelp.Connected', " . $parameters . "); }";
		}
		$messagesjson[] = array('id' => -4, 'username' => '', 'content' => $javascript, 'align' => 2, 'status' => 5);

		if (!empty($name)) {
			// Now Chatting Message
			$content = $_LOCALE['nowchattingwith'] . ' ' . $name;
			if ($_SETTINGS['DEPARTMENTS'] == true && !empty($department)) {
				$content .= ' (' . $department . ')';
			}
			$content = $content;
			$messagesjson[] = array('id' => -2, 'username' => '', 'content' => $content, 'align' => 2, 'status' => 1);
		}

	}

	// Google Analytics Custom Variable
	// Replace with analytics.js
	/*
	if (!empty($_SETTINGS['ANALYTICS'])) {
		$google = 'if (typeof(_gaq) === \'object\') { _gaq.push([\'_setCustomVar\', 1, \'Live Chat Operator\', \'' . $operator->firstname . ' ' . $operator->lastname . '\', 2]); _gaq.push([\'_trackEvent\', \'Live Chat\', \'Chat Accepted\']); }';
		$messagesjson[] = array('id' => -3, 'username' => '', 'content' => $google, 'align' => 2, 'status' => 5);
	}
	*/

	if (LANGUAGE !== $_SETTINGS['LOCALE'] && !empty($_LOCALE['introduction'])) {
		$_SETTINGS['INTRODUCTION'] = $_LOCALE['introduction'];
	}

	// Custom Initiate Chat
	if ($session->request > 0) {
		$initiate = InitiateChat::where('request', $session->request)->find_one();
		if ($initiate !== false && !empty($initiate->message)) {
			$_SETTINGS['INTRODUCTION'] = $initiate->message;
		}
	}

	if (!empty($_SETTINGS['INTRODUCTION'])) {
		$welcome = preg_replace("/(\r\n|\r|\n)/", '<br />', $_SETTINGS['INTRODUCTION']);
		$welcome = preg_replace("/({name})/", $chat->name, $welcome);
		$welcome = preg_replace("/({firstname})/", $operator->firstname, $welcome);
		$welcome = preg_replace("/({lastname})/", $operator->lastname, $welcome);
		$welcome = preg_replace("/({department})/", $chat->department, $welcome);
		$welcome = preg_replace("/(\[|\])/", '', $welcome);

		$messagesjson[] = array('id' => -1, 'from' => (int)$operator->id, 'username' => $operator->firstname, 'content' => $welcome, 'align' => 1, 'status' => 1);
	}

}
elseif ($chat !== false && $chat->status == -3) {
	// Blocked Chat
	$content = "if (typeof jQuery !== 'undefined') { jQuery(document).trigger('LiveHelp.BlockChat'); } if (typeof Chatstack !== 'undefined' && typeof Chatstack.jQuery !== 'undefined') { Chatstack.jQuery(document).trigger('LiveHelp.BlockChat'); }";
	if (isset($_SETTINGS['JQUERY'])) {
		$content .= " if (typeof " . $_SETTINGS['JQUERY'] . " !== 'undefined' && typeof " . $_SETTINGS['JQUERY'] . ".jQuery !== 'undefined') { " . $_SETTINGS['JQUERY'] . ".jQuery(document).trigger('LiveHelp.BlockChat'); }";
	}
	$messagesjson[] = array('id' => '', 'username' => '', 'content' => $content, 'align' => 2, 'status' => 5);
}
elseif ($chat !== false && $chat->status == -1) {
	// Closed Chat
	$content = "if (typeof jQuery !== 'undefined' && jQuery('#LiveHelpMessageTextarea').length > 0) { jQuery(document).trigger('LiveHelp.Disconnect'); } if (typeof Chatstack !== 'undefined' && typeof Chatstack.jQuery !== 'undefined' && Chatstack.jQuery('#LiveHelpMessageTextarea').length > 0) { Chatstack.jQuery(document).trigger('LiveHelp.Disconnect'); }";
	if (isset($_SETTINGS['JQUERY'])) {
		$content .= " if (typeof " . $_SETTINGS['JQUERY'] . " !== 'undefined' && if (typeof " . $_SETTINGS['JQUERY'] . ".jQuery !== 'undefined' && " . $_SETTINGS['JQUERY'] . ".jQuery('#LiveHelpMessageTextarea').length > 0) { " . $_SETTINGS['JQUERY'] . ".jQuery(document).trigger('LiveHelp.Disconnect'); }";
	}
	$messagesjson[] = array('id' => '', 'username' => '', 'content' => $content, 'align' => 2, 'status' => 5);
}

// Typing Status
if ($chat !== false) {
	$typing = Typing::where('chat', $chat->id)->find_many();

	$operators = array();
	foreach ($typing as $key => $type) {
		if ($type !== false) {
			switch($type->status) {
				case 0: // None
				case 1: // Guest Only
					$operators = array_diff($operators, array($type->user));
					break;
				case 2: // Operator Only
				case 3: // Both
					$operators[] = $type->user;
					break;
			}
		}
	}

	$typing = 0;
	if (count($operators) > 0) {
		$typing = 1;
	}
}

$names = array();
if ($messages !== false) {
	foreach ($messages as $key => $message) {

		$from = false;
		$username = $message->username;
		$content = $message->message;

		if ((int)$message->status !== 5) {
			$content = str_replace('<', '&lt;', $content);
			$content = str_replace('>', '&gt;', $content);
			$content = preg_replace("/(\r\n|\r|\n)/", '<br />', $content);
		} else {
			$content = preg_replace("/(\r\n|\r|\n)/", '', $content);
		}

		if ($message->status > 0) {
			if (!array_key_exists($username, $names)) {
				$operator = Operator::where('username', $username)->find_one();

				if ($operator !== false) {
					$from = (int)$operator->id;
					$username = $operator->firstname;
					$names[$operator->username] = array('id' => $operator->id, 'firstname' => $operator->firstname);
				}
			} else {
				$from = (int)$names[$username]['id'];
				$username = $names[$username]['firstname'];
			}
		}

		if ($_SETTINGS['CHATUSERNAME'] == false) { $username = ''; }

		// Output Message
		$status = (int)$message->status;
		if ($status >= 0 && $status !== 8) { // Exclude Operator Only Messages i.e. $message->status === 8
			$messagesjson[] = array('id' => (int)$message->id, 'datetime' => unixtimestamp($message->datetime), 'username' => $username, 'from' => $from, 'content' => $content, 'align' => (int)$message->align, 'status' => (int)$message->status);
		}
	}
}

// Update Refresh
if ($chat !== false) {
	$chat->refresh = date('Y-m-d H:i:s', time());
	$chat->save();
}

// JSON Output
$json = array();

// Typing Status
if ($typing) { $json['typing'] = $typing; }

// Messages
if (count($messagesjson) > 0) {
	$json['messages'] = $messagesjson;
}

// Output JSON
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
