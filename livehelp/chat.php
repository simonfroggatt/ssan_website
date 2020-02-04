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

if (!isset($_REQUEST['NAME'])){ $_REQUEST['NAME'] = ''; }
if (!isset($_REQUEST['EMAIL'])){ $_REQUEST['EMAIL'] = ''; }
if (!isset($_REQUEST['QUESTION'])){ $_REQUEST['QUESTION'] = ''; }
if (!isset($_REQUEST['DEPARTMENT'])){ $_REQUEST['DEPARTMENT'] = ''; }
if (!isset($_REQUEST['SERVER'])){ $_REQUEST['SERVER'] = ''; }
if (!isset($_REQUEST['URL'])){ $_REQUEST['URL'] = ''; }

if (!isset($_REQUEST['OTHER']) || !empty($_REQUEST['OTHER'])) {
	header('HTTP/1.1 403 Access Forbidden');
	header('Content-Type: text/plain');
	exit();
}

$user = trim($_REQUEST['NAME']);
$email = trim($_REQUEST['EMAIL']);
$department = trim($_REQUEST['DEPARTMENT']);
$question = trim($_REQUEST['QUESTION']);
$server = trim($_REQUEST['SERVER']);
$referer = $_REQUEST['URL'];
$ipaddress = $_SERVER['REMOTE_ADDR'];
$json = (isset($_REQUEST['JSON'])) ? true : false;
$status = 0;

// Email Validation
if (!empty($email) && !preg_match('/^[\-!#$%&\'*+\\\\.\/0-9=?A-Z\^_`a-z{|}~]+@[\-!#$%&\'*+\\\\\/0-9=?A-Z\^_`a-z{|}~]+\.[\-!#$%&\'*+\\\\.\/0-9=?A-Z\^_`a-z{|}~]+$/i', $email)) {
	header('HTTP/1.1 400 Bad Request');
	exit();
}

// Hidden Departments
$hiddendepts = false;
if ((float)$_SETTINGS['SERVERVERSION'] >= 5.0) {
	$hiddendepts = Department::where('status', 1)->find_many();
}

$excludedepts = array();
if ($hiddendepts !== false) {
	foreach ($hiddendepts as $key => $value) {
		$excludedepts[] = $value->name;
	}
}

// Departments
$departments = array();

// Operators
$users = Operator::find_many();

$type = false;
foreach ($users as $key => $account) {

	$id = (int)$account->id;

	switch ($account->status()) {
		case 0: // Offline - Hidden
			$type = &Operators::$hidden;
			break;
		case 1: // Online
			$type = &Operators::$online;
			break;
		case 2: // Be Right Back
			$type = &Operators::$brb;
			break;
		case 3: // Away
			$type = &Operators::$away;
			break;
	}

	if (!empty($department) && $type !== false) {

		$depmnts = explode(';', $account->department);
		if (is_array($depmnts)) {
			foreach ($depmnts as $key => $depart) {
				if (!in_array($id, $type)) {
					$depart = trim($depart);
					if (!in_array($depart, $excludedepts)) {
						if ($depart == $department) {
							$type[] = $id;
						}
						if (!in_array($depart, $departments)) {
							$departments[] = $depart;
						}
					}
				}
			}
		}
		else {
			if (!in_array($id, $type)) {
				$depmnt = trim($account->department);
				if (!in_array($depmnt, $excludedepts)) {
					if ($depmnt == $department) {
						$type[] = $id;
					}
					if (!in_array($depart, $departments)) {
						$departments[] = $depart;
					}
				}
			}
		}

	} else {
		$type[] = $id;
	}

}

// Department Validation
if (!empty($department) && count($departments) && !in_array($department, $departments)) {
	header('HTTP/1.1 400 Bad Request');
	exit();
}

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

if (empty($user)) { $user = 'Guest'; }

// Visitor
$visitor = false;
if (is_numeric($session->request) && $session->request > 0) {
	$visitor = Visitor::where_id_is($session->request)->find_one();
}

// Visitor Session Hook
$result = $hooks->run('VisitorSession', $session);
if (is_array($result) && isset($result['visitor']) && isset($result['session'])) {
	$visitor = ($result['visitor'] !== false) ? $result['visitor'] : $visitor;
	$session->visitor = $result['session']->visitor;
}

// Reset Previous Chat History
if ($_SETTINGS['PREVIOUSCHATTRANSCRIPTS'] == false) { $session->chat = 0; }

// Existing Chat / Skip Verification
$chat = false;
if ($session->chat > 0) {
	$chat = Chat::where_id_is($session->chat)->find_one();
	if ($_SETTINGS['DATABASEVERSION'] >= 17 && (empty($chat->hash) || empty($session->hash) || $chat->hash !== $session->hash)) {
		$chat = false;
	}
}

if ($chat !== false) {

	if ($chat->status == 1 && $chat->session()->count() > 0) {
		// Chat Details
		$user = $chat->name;
		$email = $chat->email;
		$server = $chat->server;
		$department = $chat->department;
		$status = $chat->status;
	} else {
		$date = date('Y-m-d H:i:s', time());

		// Update Chat
		if (is_numeric($session->request) && (int)$session->request > 0 && $_SETTINGS['DATABASEVERSION'] < 11) {
			$chat->request = $session->request;
		}
		$chat->name = $user;
		$chat->datetime = $date;
		$chat->email = $email;
		$chat->server = $server;
		$chat->department = $department;
		$chat->refresh = $date;
		$chat->status = 0;
		$chat->save();
	}

} else {

	if (is_numeric($session->request) && (int)$session->request > 0) {
		$visitor = Visitor::where_id_is($session->request)->find_one();
	}

	// Override Validation / Initiate Chat
	$override = false;
	if ($visitor !== false) {
		$initiate = (int)$visitor->initiate;
		if (is_string($visitor->path)) {
			$path = explode('; ', $visitor->path);
		} else {
			$path = $visitor->path;
		}
		$totalpages = count($path) + 1;

		if ($initiate > 0 || $initiate == -1 || (isset($_SETTINGS['INITIATECHATAUTO']) && $_SETTINGS['INITIATECHATAUTO'] > 0 && $initiate == 0 && count(Operators::$online) > 0 && $totalpages >= $_SETTINGS['INITIATECHATAUTO'])) {
			$override = true;
		}
	}

	// Verification
	if ($_SETTINGS['REQUIREGUESTDETAILS'] == true && $_SETTINGS['LOGINDETAILS'] == true && $override == false) {

		if (file_exists('locale/' . LANGUAGE . '/guest.php')) {
			include('locale/' . LANGUAGE . '/guest.php');
		}
		else {
			include('locale/en/guest.php');
		}

		if (!empty($department)) { $departmentquery = '&DEPARTMENT=' . $department; }
		if (empty($user) || (empty($email) && $_SETTINGS['LOGINEMAIL'] == true)) {
			if ($json) {
				$json = array();
				$json['error'] = $_LOCALE['invaliddetailserror'];
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
			} else {
				header('Location: index.php?ERROR=empty' . $departmentquery);
			}
			exit();
		}
		else if ($_SETTINGS['LOGINEMAIL'] == true) {
			if (!preg_match('/^[\-!#$%&\'*+\\\\.\/0-9=?A-Z\^_`a-z{|}~]+@[\-!#$%&\'*+\\\\\/0-9=?A-Z\^_`a-z{|}~]+\.[\-!#$%&\'*+\\\\.\/0-9=?A-Z\^_`a-z{|}~]+$/', $email)) {
				if ($json) {
					$json = array();
					$json['error'] = $_LOCALE['invalidemail'];
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
				} else {
					header('Location: index.php?ERROR=email' . $departmentquery);
				}
				exit();
			}
		}
	}

	$date = date('Y-m-d H:i:s', time());

	// Add Chat Session
	$chat = Chat::create();

	if (is_numeric($session->request) && (int)$session->request > 0 && $_SETTINGS['DATABASEVERSION'] < 11) {
		$chat->request = $session->request;
	}

	// Generate guidv4
	$guid = false;
	$exists = true;
	if ($_SETTINGS['DATABASEVERSION'] >= 17 && empty($chat->hash)) {
		while ($exists !== false) {
			$guid = guidv4();
			$exists = Chat::where('hash', $guid)->find_one();
		}
	}
	if (!empty($guid)) {
		$chat->hash = $guid;
	}

	$chat->name = $user;
	$chat->datetime = $date;
	$chat->email = $email;
	$chat->server = $server;
	$chat->department = $department;
	$chat->refresh = $date;
	$chat->status = 0;
	$chat->save();

	$hooks->run('ChatAdded', array('chat' => $chat, 'session' => $session));

}

if ($chat !== false && !empty($session->request) && $_SETTINGS['DATABASEVERSION'] > 10) {
	$chatvisitor = ChatVisitor::where('chat', $chat->id)->find_one();
	if ($chatvisitor !== false) {
		$chatvisitor->visitor = $session->request;
	} else {
		$chatvisitor = ChatVisitor::create();
		$chatvisitor->chat = $chat->id;
		$chatvisitor->visitor = $session->request;
	}
	$chatvisitor->save();
}

// Update Chat Session
if ($status == -3 || $status == -1) {

	$date = date('Y-m-d H:i:s', time());

	// Update Chat Session
	if (is_numeric($session->request) && (int)$session->request > 0 && $_SETTINGS['DATABASEVERSION'] < 11) {
		$chat->request = $session->request;
	}
	$chat->name = $user;
	$chat->datetime = $date;
	$chat->email = $email;
	$chat->server = $server;
	$chat->department = $department;
	$chat->refresh = $date;
	$chat->status = 0;
	$chat->save();
}

// Online Operators
$operators = Operator::where('status', 1)->find_many();

$devices = array();
if ($operators !== false) {
	foreach ($operators as $key => $operator) {
		if ($operator->status() == 1 && ($_SETTINGS['DEPARTMENTS'] == false || ($_SETTINGS['DEPARTMENTS'] == true && $operator->has_department($operator, $department)))) {
			if ((float)$_SETTINGS['SERVERVERSION'] >= 4.1) {
				$unique = array();
				foreach ($operator->devices()->order_by_desc('datetime')->find_many() as $key => $device) {
					if (!in_array($device->unique, $unique)) {
						$unique[] = $device->unique;
						if (!empty($device->token)) {
							$devices[] = $device->token;
						}
					}
				}
			} else { // iPhone PUSH Supported
				if (!empty($operator->device)) {
					$devices[] = $operator->device;
				}
			}
		}
	}
} else {
	if ($json) {
		$json = array();
		$json['status'] = 'Offline';
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
	} else {
		header('Location: offline.php?SERVER=' . $server);
	}
	exit();
}

if (empty($user)) { $user = 'Guest'; }

$server = $_SETTINGS['URL'];

// Hostname
if (is_numeric($session->request) && (int)$session->request > 0) {

	$visitor = Visitor::where_id_is($session->request)->find_one();
	if ($visitor !== false) {
		$server = $visitor->url;

		for ($i = 0; $i < 3; $i++) {
			$substr_pos = strpos($server, '/');
			if ($substr_pos === false) {
				break;
			}
			if ($i < 2) {
				$server = substr($server, $substr_pos + 1);
			}
			else {
				$server = substr($server, 0, $substr_pos);
			}

		}
		if (substr($server, 0, 4) == 'www.') { $server = substr($server, 4); }

		// Cancel Initiate Chat
		$visitor->initiate = -4;
		$visitor->save();
	}

}

// Update Activity
if ((float)$_SETTINGS['SERVERVERSION'] >= 3.90) {
	// Insert Requested Live Help
	$activity = Activity::create();
	$activity->user = $chat->id;
	$activity->username = $user;
	$activity->datetime = date('Y-m-d H:i:s', time());

	// Action Text
	if ($_SETTINGS['DEPARTMENTS'] == true && !empty($department)) {
		$action = sprintf('requested a chat with %s', $department);
	} else {
		$action = 'requested a chat';
	}

	$activity->activity = $action;
	$activity->type = 8;
	$activity->status = 0;
	$activity->save();

}

// Send Guest Initial Question as chat message if different from previous
if (!empty($question)) {

	$message = Message::create();
	$message->chat = $chat->id;
	$message->username = $user;
	$message->datetime = date('Y-m-d H:i:s', time());
	$message->message = $question;
	$message->align = 1;
	$message->save();
}

// Cancel Initiate Chat
if ($visitor !== false && $session->db !== false && method_exists($visitor, 'save')) {
	$visitor->initiate = -4;
	$visitor->save();
}

$hooks->run('VisitorSaveInitiate', array('id' => $session->request, 'initiate' => -4));

// Current Server
if ($chat !== false && !empty($server)) {
	$server = $chat->server;
}

// Total Pending Visitors
$online = Chat::where('status', 0)
	->where_gt('refresh', date('Y-m-d H:i:s', time() - $_SETTINGS['CONNECTIONTIMEOUT']))
	->count();

// Pending Chat Device Notification
$badge = (is_numeric($online) ? $online : 0);
$data = $hooks->run('PendingChat', array('user' => $user, 'server' => $server, 'badge' => $badge, 'chat' => $chat, 'devices' => $devices, 'channel' => false));

$channel = '';
if (!empty($data) && !empty($data['channel'])) {
	$channel = $data['channel'];
}

if (!empty($_SETTINGS['LOGO'])) { $margin = 16; $footer = -10; $textmargin = 15; } else { $margin = 50; $footer = 30; $textmargin = 50; }

if (file_exists('locale/' . LANGUAGE . '/guest.php')) {
	include('locale/' . LANGUAGE . '/guest.php');
}
else {
	include('locale/en/guest.php');
}

// Encrypt Session
$data = array('visitor' => $session->request, 'chat' => (int)$chat->id, 'hash' => $chat->hash);
$encrypted = $session->encrypt($data);

if ($json) {
	$json = array();

	if (defined('ACCOUNT') && strpos($session->request, 'visitor:' . ACCOUNT . ':') > -1) {
		$json['visitor'] = str_replace('visitor:' . ACCOUNT . ':', '', $session->request);
	} else if (!empty($visitor) && is_numeric($visitor->id) && (int)$visitor->id > 0) {
		$json['visitor'] = (int)$visitor->id;
	}

	$json['chat'] = (int)$chat->id;
	$json['session'] = $encrypted;
	$json['user'] = $user;
	$json['channel'] = $channel;
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
} else {
	header('HTTP/1.1 400 Bad Request');
	exit();
}

?>
