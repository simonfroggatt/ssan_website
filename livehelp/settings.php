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

if ((isset($_PLUGINS['WHMCS']) || defined('WHMCS')) && !defined('CHATSTACK')) {
	return;
}

$installed = false;
$database = require_once('./include/database.php');
if ($database) {
	// Smarty Template
	require_once('./include/smarty/Smarty.class.php');

	require_once('./include/spiders.php');
	require_once('./include/class.aes.php');
	require_once('./include/class.cookie.php');
	require_once('./include/class.session.php');
	$installed = require_once('./include/core.config.php');
	require_once('./include/class.models.php');
} else {
	$installed = false;
}

require_once('./include/core.functions.php');
$version = require_once('./include/version.php');

if ($installed == false) {

	// Hooks
	require_once dirname(__FILE__) . '/include/class.hooks.php';

	// Settings Failure Hook
	$hooks->run('SettingsFailure');

	// Initialise Settings
	$_SETTINGS = array();

} else {

	// Copyright Removal
	if ($version == false && !isset($_LOCALE['stardevelopcopyright'])) {
		$_LOCALE['stardevelopcopyright'] = 'International Copyright &copy; 2003 - ' . date('Y') . ' <a href="http://livehelp.stardevelop.com" target="_blank" class="normlink">Live Help Messenger</a> All Rights Reserved';
	}

	if (!isset($_REQUEST['SESSION'])){ $_REQUEST['SESSION'] = ''; }
	if (!isset($_REQUEST['DEPARTMENT'])){ $_REQUEST['DEPARTMENT'] = ''; }
	$department = trim($_REQUEST['DEPARTMENT']);

	// Initialise Session
	$session = new Session($_REQUEST['SESSION'], $_SETTINGS['AUTHKEY']);

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

	// Operators
	$users = Operator::find_many();

	$type = false;
	foreach ($users as $key => $user) {

		$id = (int)$user->id;

		switch ($user->status()) {
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

			$depmnts = explode(';', $user->department);
			if (is_array($depmnts)) {
				foreach ($depmnts as $key => $depart) {
					if (!in_array($id, $type)) {
						$depart = trim($depart);
						if ($depart == $department && !in_array($depart, $excludedepts)) {
							$type[] = $id;
						}
					}
				}
			}
			else {
				if (!in_array($id, $type)) {
					$depmnt = trim($user->department);
					if ($depmnt == $department && !in_array($depmnt, $excludedepts)) {
						$type[] = $id;
					}
				}
			}

		} else {
			$type[] = $id;
		}

	}

	// Status Mode
	$status = 'Offline';
	if (count(Operators::$online) > 0) {
		$status = 'Online';
	} elseif (count(Operators::$brb) > 0 && count(Operators::$brb) >= count(Operators::$away)) {
		$status = 'BRB';
	} elseif (count(Operators::$away) > 0) {
		$status = 'Away';
	}

	// Away Disabled
	if ($status == 'Away' && isset($_SETTINGS['AWAYMODE']) && $_SETTINGS['AWAYMODE'] === false) {
		$status = 'Offline';
	}

	// BRB Disabled
	if ($status == 'BRB' && isset($_SETTINGS['BRBMODE']) && $_SETTINGS['BRBMODE'] === false) {
		$status = 'Offline';
	}

	// Auto Initiate Chat
	$initiate = false;
	if ($visitor !== false) {

		$initiate = (int)$visitor->initiate;
		if (is_string($visitor->path)) {
			$path = explode('; ', $visitor->path);
		} else {
			$path = $visitor->path;
		}
		$totalpages = count($path) + 1;

		if ($initiate > 0 || $initiate == -1 || (isset($_SETTINGS['INITIATECHATAUTO']) && $_SETTINGS['INITIATECHATAUTO'] > 0 && $initiate == 0 && count(Operators::$online) > 0 && $totalpages >= $_SETTINGS['INITIATECHATAUTO'])) {
			$initiate = true;
		} else {
			$initiate = false;
		}
	}

	// Offline Email Redirection
	if (!empty($_SETTINGS['OFFLINEEMAILREDIRECT'])) {
		if (preg_match('/^[\-!#$%&\'*+\\\\.\/0-9=?A-Z\^_`a-z{|}~]+@[\-!#$%&\'*+\\\\\/0-9=?A-Z\^_`a-z{|}~]+\.[\-!#$%&\'*+\\\\.\/0-9=?A-Z\^_`a-z{|}~]+$/', $_SETTINGS['OFFLINEEMAILREDIRECT'])) {
			$_SETTINGS['OFFLINEEMAILREDIRECT'] = 'mailto:' . $_SETTINGS['OFFLINEEMAILREDIRECT'];
		}
	}

	// Operators
	$embeddedoperator = false;

	// Departments
	$departments = array();
	$operators = array();
	$unavailable = array();

	$excludedepts = array();
	if ($hiddendepts !== false) {
		foreach ($hiddendepts as $key => $value) {
			$excludedepts[] = $value->name;
		}
	}

	// Unavailable Operators
	Operators::$unavailable = array_merge(Operators::$hidden, Operators::$brb, Operators::$away);

	if (Operators::$online !== false && count(Operators::$online) > 0) {
		foreach (Operators::$online as $id) {
			$user = Operator::where_id_is($id)->find_one();

			$depmnts = explode(';', $user->department);
			if (is_array($depmnts)) {
				foreach ($depmnts as $key => $depart) {
					$depart = trim($depart);
					if (!in_array($depart, $departments) && !in_array($depart, $excludedepts)) {
						$departments[] = $depart;
					}
					if (empty($department) || (!empty($department) && $depart == $department && !in_array($depart, $excludedepts))) {
						$operators[] = $user;
					}
				}
			}
			else {
				$depmnt = trim($user->department);
				if (!in_array($depmnt, $departments) && !in_array($depmnt, $excludedepts)) {
					$departments[] = $depmnt;
				}
				if (empty($department) || (!empty($department) && $depmnt == $department && !in_array($depmnt, $excludedepts))) {
					$operators[] = $user;
				}
			}
		}

		if (count($operators) > 0) {
			$embeddedoperator = $operators[array_rand($operators)];
		}

		$total = count($departments);
		sort($departments);
	} else if (Operators::$unavailable !== false && count(Operators::$unavailable) > 0) {
		foreach (Operators::$unavailable as $id) {
			$user = Operator::where_id_is($id)->find_one();

			$depmnts = explode(';', $user->department);
			if (is_array($depmnts)) {
				foreach ($depmnts as $key => $depart) {
					$depart = trim($depart);
					if (!in_array($depart, $departments) && !in_array($depart, $excludedepts)) {
						$departments[] = $depart;
					}
					if (empty($department) || (!empty($department) && $depart == $department && !in_array($depart, $excludedepts))) {
						$unavailable[] = $user;
					}
				}
			}
			else {
				$depmnt = trim($user->department);
				if (!in_array($depmnt, $departments) && !in_array($depmnt, $excludedepts)) {
					$departments[] = $depmnt;
				}
				if (empty($department) || (!empty($department) && $depmnt == $department && !in_array($depmnt, $excludedepts))) {
					$unavailable[] = $user;
				}
			}
		}

		if (count($unavailable) > 0) {
			$embeddedoperator = $unavailable[array_rand($unavailable)];
		}
	}

	// Departments Loaded Hook
	if (is_array($departments) && count($departments) > 0) {
		$departments = $hooks->run('DepartmentsLoaded', $departments);
	}

	// Disable Departments
	if ($_SETTINGS['DEPARTMENTS'] == false) {
		$departments = false;
	}

	if ($embeddedoperator !== false) {
		$embeddedinitate = array('id' => (int)$embeddedoperator->id, 'name' => $embeddedoperator->firstname . ' ' . $embeddedoperator->lastname, 'department' => $embeddedoperator->department, 'avatar' => md5($embeddedoperator->email), 'photo' => false);
	} else {
		$embeddedinitate = array('id' => -1);
	}

	// Auto Open Chat
	$connected = false;
	$name = '';
	$email = false;
	$depmnt = '';
	$blocked = 0;

	// Chat
	$chat = false;
	if ($session->chat > 0) {
		$chat = Chat::where_id_is($session->chat)->find_one();
		if ($_SETTINGS['DATABASEVERSION'] >= 17 && (empty($chat->hash) || empty($session->hash) || $chat->hash !== $session->hash)) {
			$chat = false;
		}
	}

	$channel = '';
	if ($chat !== false) {
		if ($chat->status == 1 || $chat->status == 0) {
			$connected = true;
			$name = $chat->name;
			$email = $chat->email;
			$depmnt = $chat->department;

			// Introduction Name / Department
			$_SETTINGS['INTRODUCTION'] = preg_replace("/({name})/", $name, $_SETTINGS['INTRODUCTION']);
			$_SETTINGS['INTRODUCTION'] = preg_replace("/({department})/", $depmnt, $_SETTINGS['INTRODUCTION']);

			// Override Embedded Initiate Chat Operator
			$chatsession = $chat->session()->order_by_desc('requested')->find_one();
			if ($chatsession !== false) {
				$account = $chatsession->operator()->find_one();
				if ($account !== false) {
					$embeddedinitate = array('id' => (int)$account->id, 'name' => $account->firstname . ' ' . $account->lastname, 'department' => $account->department, 'avatar' => md5($account->email), 'photo' => false);

					// Introduction Operator
					$_SETTINGS['INTRODUCTION'] = preg_replace("/({firstname})/", $account->firstname, $_SETTINGS['INTRODUCTION']);
					$_SETTINGS['INTRODUCTION'] = preg_replace("/({lastname})/", $account->lastname, $_SETTINGS['INTRODUCTION']);
				}
			}

			// Remove Optional Brackets
			$_SETTINGS['INTRODUCTION'] = preg_replace("/(\[|\])/", '', $_SETTINGS['INTRODUCTION']);

			if (isset($_SETTINGS['CLOUDSOCKETSCHANNELSALT'])) {
				$salt = $_SETTINGS['CLOUDSOCKETSCHANNELSALT'];
				$channel = sha1((int)$chat->id . $salt);
			}

		} else if ($chat->status == -3) {
			$blocked = 1;
		}
	}

	// Remove Introduction Variables
	if (!$connected) {
		if (strpos($_SETTINGS['INTRODUCTION'], '{name}') !== false) {
			$_SETTINGS['INTRODUCTION'] = preg_replace("/\s*({name})\s*/", '', $_SETTINGS['INTRODUCTION']);
		}

		if (strpos($_SETTINGS['INTRODUCTION'], '{firstname}') !== false) {
			$_SETTINGS['INTRODUCTION'] = preg_replace("/\s*({firstname})\s*|(?=\[).+({firstname}).+?(\])/", '', $_SETTINGS['INTRODUCTION']);
		}

		if (strpos($_SETTINGS['INTRODUCTION'], '{lastname}') !== false) {
			$_SETTINGS['INTRODUCTION'] = preg_replace("/\s*({lastname})\s*|(?=\[).+({lastname}).+?(\])/", '', $_SETTINGS['INTRODUCTION']);
		}

		if (strpos($_SETTINGS['INTRODUCTION'], '{department}') !== false) {
			$_SETTINGS['INTRODUCTION'] = preg_replace("/\s*({department})\s*|(?=\[).+({department}).+?(\])/", '', $_SETTINGS['INTRODUCTION']);
		}
	}

	// Encrypt Session
	$data = array();
	if ($visitor !== false) {
		$data['visitor'] = (int)$visitor->id;
		if ($visitor !== false && is_numeric($visitor->id) && $visitor->id > 0) {
			$data = array('visitor' => (int)$visitor->id);
		}

		// Visitor Session Hook
		$result = $hooks->run('VisitorSessionData', array('guid' => false, 'session' => $session));
		if ($result !== false && is_string($result)) {
			$data = array('visitor' => $result);
		} else if (is_array($result) && is_array($result['session']) && isset($result['session']['request'])) {
			$data = array('visitor' => (int)$result['session']['request']);
		}
	}

	if ($chat !== false) {
		$data['chat'] = (int)$chat->id;
		$data['name'] = $chat->name;
		$data['email'] = $chat->email;
		$data['department'] = $chat->department;

		if ($_SETTINGS['DATABASEVERSION'] >= 17 && !empty($chat->hash)) {
			$data['hash'] = $chat->hash;
		}

		// Chat Blocked
		if ($chat->status == -3) {
			$blocked = 1;
		}
	}

	$encrypted = $session->encrypt($data);

}

header('Content-type: text/html; charset=utf-8');

if (defined('LANGUAGE')) {
	include('./locale/' . LANGUAGE . '/guest.php');
} else {
	include('./locale/en/guest.php');
}

if (LANGUAGE !== $_SETTINGS['LANGUAGE'] && !empty($_LOCALE['introduction'])) {
	$_SETTINGS['INTRODUCTION'] = $_LOCALE['introduction'];
	$_SETTINGS['INTRODUCTION'] = preg_replace("/(\r\n|\r|\n)/", '<br />', $_SETTINGS['INTRODUCTION']);
}

// Templates
$templates = array();
if (isset($_SETTINGS['TEMPLATES']) && is_array($_SETTINGS['TEMPLATES'])) {
	foreach ($_SETTINGS['TEMPLATES'] as $key => $template) {
		$templates[] = $template['value'];
	}
}

if (empty($templates)) {
	$templates[] = 'default';
}

// Visitor Language Hook
$hooks->run('VisitorLanguage');

// Language
$language = array();
$language['welcome'] = $_LOCALE['welcome'];
$language['enterguestdetails'] = $_LOCALE['enterguestdetails'];
$language['says'] = $_LOCALE['says'];
$language['pushedurl'] = $_LOCALE['pushedurl'];
$language['opennewwindow'] = $_LOCALE['opennewwindow'];
$language['sentfile'] = $_LOCALE['sentfile'];
$language['startdownloading'] = $_LOCALE['startdownloading'];
$language['rightclicksave'] = $_LOCALE['rightclicksave'];
$language['disconnecttitle'] = $_LOCALE['disconnecttitle'];
$language['disconnectdescription'] = $_LOCALE['disconnectdescription'];
$language['thankyoupatience'] = $_LOCALE['thankyoupatience'];
$language['emailchat'] = $_LOCALE['emailchat'];
$language['togglesound'] = $_LOCALE['togglesound'];
$language['feedback'] = $_LOCALE['feedback'];
$language['disconnect'] = $_LOCALE['disconnect'];
$language['collapse'] = $_LOCALE['collapse'];
$language['expand'] = $_LOCALE['expand'];
$language['invalidemail'] = $_LOCALE['invalidemail'];
$language['name'] = $_LOCALE['name'];
$language['email'] = $_LOCALE['email'];
$language['department'] = $_LOCALE['department'];
$language['question'] = $_LOCALE['question'];
$language['send'] = $_LOCALE['send'];
$language['enteryourmessage'] = $_LOCALE['enteryourmessage'];
$language['switchpopupwindow'] = $_LOCALE['switchpopupwindow'];
$language['rateyourexperience'] = $_LOCALE['rateyourexperience'];
$language['copyright'] = $_LOCALE['stardevelopcopyright'];
$language['thankyoumessagesent'] = $_LOCALE['thankyoumessagesent'];
$language['cancel'] = $_LOCALE['cancel'];
$language['pleasewait'] = $_LOCALE['pleasewait'];
$language['telephonecallshortly'] = $_LOCALE['telephonecallshortly'];
$language['telephonethankyoupatience'] = $_LOCALE['telephonethankyoupatience'];
$language['connect'] = $_LOCALE['connect'];
$language['connecting'] = $_LOCALE['connecting'];
$language['closechat'] = $_LOCALE['closechat'];
$language['chatsessionblocked'] = $_LOCALE['chatsessionblocked'];
$language['accessdenied'] = $_LOCALE['accessdenied'];
$language['blockedchatsession'] = $_LOCALE['blockedchatsession'];
$language['istyping'] = $_LOCALE['istyping'];
$language['online'] = $_LOCALE['online'];
$language['offline'] = $_LOCALE['offline'];
$language['brb'] = $_LOCALE['brb'];
$language['away'] = $_LOCALE['away'];
$language['offlineerrortitle'] = $_LOCALE['offlineerrortitle'];
$language['closedusermessage'] = $_LOCALE['closedusermessage'];
$language['contactus'] = $_LOCALE['contactus'];
$language['restartchat'] = $_LOCALE['restartchat'];
$language['password'] = $_LOCALE['password'];
$language['retypepassword'] = $_LOCALE['retypepassword'];
$language['chatwith'] = $_LOCALE['chatwith'];
$language['feedbackintroduction'] = $_LOCALE['feedbackintroduction'];;
$language['enteryourfeedbackemail'] = $_LOCALE['enteryourfeedbackemail'];
$language['enteryourfeedback'] = $_LOCALE['enteryourfeedback'];
$language['close'] = $_LOCALE['close'];
$language['needsupport'] = $_LOCALE['needsupport'];
$language['clickhere'] = $_LOCALE['clickhere'];
$language['chattingwith'] = $_LOCALE['chattingwith'];
$language['offlinemessagedescription'] = $_LOCALE['offlinemessagedescription'];
$language['enteryourofflinename'] = $_LOCALE['enteryourofflinename'];
$language['enteryourofflineemail'] = $_LOCALE['enteryourofflineemail'];
$language['enteryourofflinemessage'] = $_LOCALE['enteryourofflinemessage'];
$language['retry'] = $_LOCALE['retry'];


if (isset($_LOCALE['departments'])) {
	$language['departments'] = $_LOCALE['departments'];
} else {
	$language['departments'] = array();
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

	$settings = array();
	if (!empty($_SETTINGS)) {
		$settings['popupSize'] = array('width' => (int)$_SETTINGS['CHATWINDOWWIDTH'], 'height' => (int)$_SETTINGS['CHATWINDOWHEIGHT']);
		$settings['status'] = $status;
		$settings['offlineRedirect'] = $_SETTINGS['OFFLINEEMAILREDIRECT'];
		$settings['offlineEmail'] = (int)$_SETTINGS['OFFLINEEMAIL'];
		$settings['channel'] = $channel;
		$settings['connected'] = $connected;
		$settings['smilies'] = (int)$_SETTINGS['SMILIES'];
		$settings['departments'] = $departments;
		$settings['locale'] = LANGUAGE;
		$settings['language'] = $language;
		$settings['session'] = $encrypted;
		$settings['user'] = $name;
		$settings['email'] = $email;
		$settings['department'] = $depmnt;
		$settings['visitor'] = array('enabled' => (int)$_SETTINGS['VISITORTRACKING'], 'refresh' => (int)$_SETTINGS['VISITORREFRESH']);
		$settings['requireGuestDetails'] = (int)$_SETTINGS['REQUIREGUESTDETAILS'];
		$settings['loginDetails'] = (int)$_SETTINGS['LOGINDETAILS'];
		$settings['loginEmail'] = (int)$_SETTINGS['LOGINEMAIL'];
		$settings['loginQuestion'] = (int)$_SETTINGS['LOGINQUESTION'];
		$settings['initiate'] = array('enabled' => (int)$initiate, 'delay' => (isset($_SETTINGS['INITIATECHATDELAY'])) ? (int)$_SETTINGS['INITIATECHATDELAY'] : -1);
		$settings['embeddedinitiate'] = $embeddedinitate;
		$settings['templates'] = $templates;
		$settings['template'] = $_SETTINGS['TEMPLATE'];
		$settings['blocked'] = $blocked;
		$settings['rtl'] = (isset($_SETTINGS['DIRECTION']) && $_SETTINGS['DIRECTION'] == 'rtl') ? true : false;
		$settings['plugins'] = (isset($_SETTINGS['PLUGINS'])) ? $_SETTINGS['PLUGINS'] : false;
		$settings['images'] = array('online' => $_SETTINGS['ONLINELOGO'], 'offline' => $_SETTINGS['OFFLINELOGO'], 'brb' => $_SETTINGS['BERIGHTBACKLOGO'], 'away' => $_SETTINGS['AWAYLOGO'], 'initiatechat' => $_SETTINGS['INITIATECHATLOGO'], 'feedback' => (isset($_SETTINGS['FEEDBACKLOGO'])) ? $_SETTINGS['FEEDBACKLOGO'] : '', 'logo' => (isset($_SETTINGS['LOGO'])) ? $_SETTINGS['LOGO'] : '', 'button' => (isset($_SETTINGS['CHATBUTTONIMAGE'])) ? $_SETTINGS['CHATBUTTONIMAGE'] : 'default');
		$settings['introduction'] = $_SETTINGS['INTRODUCTION'];
		$settings['styles'] = (file_exists('./templates/' . $_SETTINGS['TEMPLATE'] . '/styles/styles.min.css')) ? file_get_contents('./templates/' . $_SETTINGS['TEMPLATE'] . '/styles/styles.min.css') : false;
		$settings['sidebar'] = (isset($_SETTINGS['SIDEBAR'])) ? (int)$_SETTINGS['SIDEBAR'] : false;
		$settings['supportaddress'] = (isset($_SETTINGS['SUPPORTADDRESS'])) ? $_SETTINGS['SUPPORTADDRESS'] : '';
		$settings['fonts'] = (file_exists('./templates/' . $_SETTINGS['TEMPLATE'] . '/styles/fonts.min.css')) ? file_get_contents('./templates/' . $_SETTINGS['TEMPLATE'] . '/styles/fonts.min.css') : false;
		$settings['campaign'] = array('image' => (isset($_SETTINGS['CAMPAIGNIMAGE'])) ? $_SETTINGS['CAMPAIGNIMAGE'] : '', 'link' => (isset($_SETTINGS['CAMPAIGNLINK'])) ? $_SETTINGS['CAMPAIGNLINK'] : '');
		$settings['theme'] = $_SETTINGS['THEME'];

		// Visitor Hash
		if ($visitor !== false && isset($_SETTINGS['CLOUDSOCKETSVISITORSALT'])) {
			$salt = $_SETTINGS['CLOUDSOCKETSVISITORSALT'];
			$settings['visitor']['hash'] = sha1($visitor->id . $salt);
		}

		// Visitor Monitoring Server Override
		if (defined('VISITORSERVER')) {
			$settings['visitor']['server'] = VISITORSERVER;
		}

	}

	// Default Template
	if (empty($_SETTINGS['TEMPLATE'])) {
		$_SETTINGS['TEMPLATE'] = 'default';
	}

	// Smarty Templates
	$smarty = new Smarty;

	$smarty->debugging = false;
	$smarty->caching = false;
	$smarty->template_dir = './templates';
	$smarty->compile_dir = './templates_c';
	$smarty->cache_dir = './templates/cache';
	$smarty->config_dir = './includes/smarty';

	$smarty->assign('LOCALE', $_LOCALE, true);

	$dir = (isset($_SETTINGS['DIRECTION']) && $_SETTINGS['DIRECTION'] == 'rtl') ? 'dir="rtl"' : '';
	$rtl = (isset($_SETTINGS['DIRECTION']) && $_SETTINGS['DIRECTION'] == 'rtl') ? 'style="text-align:right"' : '';
	$style = (strlen($_LOCALE['stardevelopcopyright']) > 0) ? 'block' : 'none';
	$smarty->assign('dir', $dir, true);
	$smarty->assign('rtl', $rtl, true);
	$smarty->assign('style', $style, true);

	if (isset($_REQUEST['TEMPLATE'])) {
		$path = $_REQUEST['TEMPLATE'] . '/chat.tpl';
		if (!file_exists($smarty->template_dir . '/' . $path)) {
			$path = $_SETTINGS['TEMPLATE'] . '/chat.tpl';
		}
	} else {
		$path = $_SETTINGS['TEMPLATE'] . '/chat.tpl';
	}
	$html = $smarty->fetch($path);
	$settings['html'] = $html;

	$result = $hooks->run('VisitorSettings', array('settings' => $settings));
	if (is_array($result) && isset($result['settings'])) {
		$settings = $result['settings'];
	}

	if ($installed == false) {
		$settings['error'] = true;
	} else {
		$settings['error'] = false;
	}

	$json = json_encode($settings);
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
