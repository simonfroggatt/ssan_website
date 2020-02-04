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

if (!isset($_REQUEST['NAME'])){ $_REQUEST['NAME'] = ''; }
if (!isset($_REQUEST['EMAIL'])){ $_REQUEST['EMAIL'] = ''; }
if (!isset($_REQUEST['DEPARTMENT'])){ $_REQUEST['DEPARTMENT'] = ''; }
if (!isset($_REQUEST['QUESTION'])){ $_REQUEST['QUESTION'] = ''; }
if (!isset($_REQUEST['TELEPHONE'])){ $_REQUEST['TELEPHONE'] = ''; }
if (!isset($_REQUEST['ERROR'])){ $_REQUEST['ERROR'] = ''; }

$installed = false;
$database = require_once('./include/database.php');
if ($database) {
	// Smarty Template
	require_once('./include/smarty/Smarty.class.php');

	require_once('./include/spiders.php');
	require_once('./include/core.functions.php');
	require_once('./include/class.aes.php');
	require_once('./include/class.cookie.php');
	require_once('./include/class.session.php');
	$installed = require_once('./include/core.config.php');
	require_once('./include/class.models.php');
	require_once('./include/version.php');
} else {
	$installed = false;
}

if ($installed == false) {
	header('Location: ./offline.php');
	exit();
}

if ($installed == true) {

	$username = htmlspecialchars(trim($_REQUEST['NAME']));
	$email = htmlspecialchars(trim($_REQUEST['EMAIL']));
	$department = htmlspecialchars(trim($_REQUEST['DEPARTMENT']));
	$question = htmlspecialchars(trim($_REQUEST['QUESTION']));
	$telephone = htmlspecialchars(trim($_REQUEST['TELEPHONE']));

	// Initialise Session
	$session = false;
	if (isset($_REQUEST['SESSION'])) {
		$session = new Session($_REQUEST['SESSION'], $_SETTINGS['AUTHKEY']);
	}

	// Override Template
	if (isset($_REQUEST['TEMPLATE']) && file_exists('templates/' . $_REQUEST['TEMPLATE'] . '/')) {
		$_SETTINGS['TEMPLATE'] = $_REQUEST['TEMPLATE'];
	}

	// Online Users
	if (empty($_REQUEST['ERROR'])) {

		$operators = Operator::find_many();

		$online = false;
		if ($operators !== false) {
			foreach ($operators as $key => $operator) {
				if ($operator->status() == 1) {
					if (!empty($department) && $operator->has_department($operator, $department)) {
						$online = true;
						break;
					} else {
						$online = true;
						break;
					}
				}
			}
		}

		// Offline Email
		if ($online === false) {
			header('Location: ./offline.php?LANGUAGE=' . LANGUAGE);
			exit();
		}
	}
}

header('Content-type: text/html; charset=utf-8');

if (file_exists('locale/' . LANGUAGE . '/guest.php')) {
	include('locale/' . LANGUAGE . '/guest.php');
}
else {
	include('locale/en/guest.php');
}

// Smarty Templates
$smarty = new Smarty;

/* Smarty Options
$smarty->force_compile = true;
$smarty->debugging = false;
$smarty->debug_tpl = './include/smarty/debug.tpl';
$smarty->caching = false;
$smarty->cache_lifetime = 120;
*/

$smarty->template_dir = './templates';
$smarty->compile_dir = './templates_c';
$smarty->cache_dir = './templates/cache';
$smarty->config_dir = './includes/smarty';

// TODO Disable Telephone - Future Use
$_SETTINGS['LOGINTELEPHONE'] = false;

// Override App Name
if (LANGUAGE !== $_SETTINGS['LOCALE'] && !empty($_LOCALE['appname'])) {
	$_SETTINGS['NAME'] = $_LOCALE['appname'];
}

$smarty->assign('SETTINGS', $_SETTINGS, true);
$smarty->assign('language', LANGUAGE, true);
$smarty->assign('cookie', $_REQUEST['COOKIE'], true);
$smarty->assign('template', $_SETTINGS['TEMPLATE'], true);
$smarty->assign('captcha', '', true);

$smarty->debugging = false;
$smarty->caching = false;

// Chat Connected
$connected = false;
$chat = false;
if ($session !== false && $session->chat > 0) {
	$chat = Chat::where_id_is($session->chat)->find_one();
}

// Login Details
if ($chat !== false) {
	$username = (empty($username)) ? $chat->name : $username;
	$email = (empty($email)) ? $chat->email : $email;
	$department = $chat->department;
}

$smarty->assign('LOCALE', $_LOCALE, true);
$smarty->assign('username', $username, true);
$smarty->assign('email', $email, true);
$smarty->assign('telephone', $telephone, true);
$smarty->assign('question', $question, true);
$smarty->assign('title', 'Live Chat', true);

if ($session !== false) {
	$smarty->assign('session', $session->session, true);
}

$smarty->assign('language', LANGUAGE, true);

// Department
if (!isset($_REQUEST['DEPARTMENT']) || isset($department)) {
	$selected = $department;
	$smarty->assign('department', $department);
	$smarty->assign('selected', $selected);
}

// Check Connected
if ($chat !== false && $chat->status == 1 && $chat->session()->count() > 0) {
	$connected = true;
}

// Login Details
if ($_SETTINGS['LOGINDETAILS'] == false) {
	$connected = true;
}

if ($connected) {
	$smarty->assign('connected', $connected);
}

$uri = (isset($_SERVER['REQUEST_URI'])) ? $_SERVER['REQUEST_URI'] : $_SERVER['SCRIPT_NAME'];
$basedir = substr($uri, 0, strpos($uri, '/livehelp')) . '/livehelp/';
if (isset($_SETTINGS['BASEDIR'])) {
	$basedir = $_SETTINGS['BASEDIR'];
}
$smarty->assign('basedir', $basedir);

$jspath = '/livehelp/scripts/js.js';
if (isset($_SETTINGS['JSPATH'])) {
	$jspath = $_SETTINGS['JSPATH'];
}
$smarty->assign('jspath', $jspath);

// Error Messages
if ($_REQUEST['ERROR'] == 'empty') {
	$smarty->assign('error', $_LOCALE['emptyuserdetails'], true);
} else if ($_REQUEST['ERROR'] == 'email') {
	$smarty->assign('error', $_LOCALE['invalidemail'], true);
}

// Copyright Removal
$style = (strlen($_LOCALE['stardevelopcopyright']) > 0) ? 'block' : 'none';
$smarty->assign('style', $style, true);

// Required Details
if ($_SETTINGS['REQUIREGUESTDETAILS'] == true && $_SETTINGS['LOGINDETAILS'] == true) {
	$smarty->assign('required', true);
} else {
	$smarty->assign('required', false);
}

$departments = array();

// Departments
if ($_SETTINGS['DEPARTMENTS'] == true && empty($_REQUEST['DEPARTMENT']) && $installed == true || $_REQUEST['ERROR'] == 'empty')  {

	$users = Operator::find_many();

	if ($users !== false) {
		foreach ($users as $user) {
			if ($user->status() == 1) {
				$depmnts = explode(';', $user->department);
				if (is_array($depmnts)) {
					foreach ($depmnts as $key => $depart) {
						$depart = trim($depart);
						if (!in_array($depart, $departments)) {
							$departments[] = $depart;
						}
					}
				}
				else {
					$depmnt = trim($user->department);
					if (!in_array($depmnt, $departments)) {
						$departments[] = $depmnt;
					}
				}
			}
		}

		$total = count($departments);
		sort($departments);
	}

	// Departments Loaded Hook
	if (is_array($departments) && count($departments) > 0) {
		$departments = $hooks->run('DepartmentsLoaded', $departments);
	}

}

$total = count($departments);
if ($total > 1) {
	array_unshift($departments, '');
}
if (is_array($departments)) {
	if (!isset($selected)) {
		foreach($departments as $key => $selected) {
			if ($total == 1) {
				$smarty->assign('selected', $selected);
			} else {
				$smarty->assign('selected', '');
			}
		}
	}
	$smarty->assign('departments', $departments);
}

$smarty->assign('departments', $departments);

$smarty->display($_SETTINGS['TEMPLATE'] . '/index.tpl');

?>
