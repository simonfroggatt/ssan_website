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

if ((isset($_PLUGINS['WHMCS']) || defined('WHMCS')) && !defined('CHATSTACK')) {
	return;
}

$installed = false;
$database = require_once('./include/database.php');
if ($database) {
	require_once('./include/spiders.php');
	require_once('./include/core.functions.php');
	require_once('./include/class.aes.php');
	require_once('./include/class.session.php');
	$installed = require_once('./include/core.config.php');
	require_once('./include/class.models.php');
	require_once('./include/class.cookie.php');
}

if ($installed == false) {
	include('./include/default.php');
	$fp = @fopen('../' . $_SETTINGS['DEFAULTLOGO'], 'rb');
	if ($fp == false) {
		header('Location: ../' . $_SETTINGS['DEFAULTLOGO']);
	} else {
		header('Content-type: image/gif');
		$contents = fread($fp, filesize('../' . $_SETTINGS['DEFAULTLOGO']));
		echo($contents);
	}
	fclose($fp);
	exit();
}

// Callback
$callback = (isset($_REQUEST['CALLBACK'])) ? true : false;

// Department
$department = (isset($_REQUEST['DEPARTMENT'])) ? $_REQUEST['DEPARTMENT']: false;

// Hidden Departments
$hiddendepts = false;
if ((float)$_SETTINGS['SERVERVERSION'] >= 5.0) {
	$hiddendepts = Department::where('status', 1)
		->find_many();
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

function LoadStatusImage($status) {
	global $_SETTINGS;
	global $callback;

	if ($callback == true) {
		$image = $status;
		if ($image != 'Online') {
			$image = './include/Offline.gif';
		} else {
			$image = './locale/' . LANGUAGE . '/images/Callback.png';
		}
		$fp = @fopen($image, 'rb');
		if ($fp == false) {
			header('Location: ' . $_SETTINGS['URL'] . '/livehelp/' . $image);
		} else {
			header('Content-type: image/gif');
			$contents = fread($fp, filesize($image));
			echo($contents);
			fclose($fp);
		}
		return;
	}

	$status = strtoupper($status);
	if ($status == 'ONLINE' || $status == 'OFFLINE' || $status == 'OFFLINEEMAIL' || $status == 'BERIGHTBACK' || $status == 'AWAY') {
		$status = $status . 'LOGO';

		if (substr($_SETTINGS[$status], 0, 7) != 'http://' && substr($_SETTINGS[$status], 0, 8) != 'https://') {
			$fp = @fopen('../' . $_SETTINGS[$status], 'rb');
			if ($fp == false) {
				header('Location: ' . $_SETTINGS['URL'] . $_SETTINGS[$status]);
			} else {
				header('Content-type: image/gif');
				$contents = fread($fp, filesize('../' . $_SETTINGS[$status]));
				echo($contents);
				fclose($fp);
			}
		} else {
			header('Location: ' . $_SETTINGS[$status]);
		}
	} else {

		// HTTP Forbidden
		if (strpos(php_sapi_name(), 'cgi') === false) { header('HTTP/1.0 403 Forbidden'); } else { header('Status: 403 Forbidden'); }
		exit;
	}
}

// Away Disabled
if ($status == 'Away' && isset($_SETTINGS['AWAYMODE']) && $_SETTINGS['AWAYMODE'] === false) {
	$status = 'Offline';
}

// BRB Disabled
if ($status == 'BRB' && isset($_SETTINGS['BRBMODE']) && $_SETTINGS['BRBMODE'] === false) {
	$status = 'Offline';
}

// Status Images
switch ($status) {
	case 'BRB':
		LoadStatusImage('BeRightBack');
		break;
	case 'Away':
		LoadStatusImage('Away');
		break;
	case 'Online':
		LoadStatusImage('Online');
		break;
	case 'Offline':
		LoadStatusImage('Offline');
		break;
}

?>
