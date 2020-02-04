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

$installed = false;
$database = require_once('./include/database.php');
if ($database) {
	// Smarty Template
	require_once('include/smarty/Smarty.class.php');

	require_once('./include/spiders.php');
	require_once('./include/class.aes.php');
	require_once('./include/class.session.php');
	$installed = require_once('./include/core.config.php');
	require_once('./include/class.models.php');
	require_once('./include/class.cookie.php');
	require_once('./include/core.functions.php');
	require_once('./include/version.php');
} else {
	$installed = false;
}

if ($installed == false) {
	require_once('./include/default.php');
}

if (!isset($_REQUEST['COMPLETE'])){ $_REQUEST['COMPLETE'] = ''; }
if (!isset($_REQUEST['CAPTCHA'])){ $_REQUEST['CAPTCHA'] = ''; }
if (!isset($_REQUEST['BCC'])){ $_REQUEST['BCC'] = ''; }
if (!isset($_REQUEST['SECURITY'])){ $_REQUEST['SECURITY'] = ''; }
if (!isset($_REQUEST['STATUS'])){ $_REQUEST['STATUS'] = ''; }

$json = (isset($_REQUEST['JSON'])) ? true : false;

// Update VoIP Call Status / JSON
if ($json) {

	$status = -1;

	// Initialise Session
	$session = new Session($_REQUEST['SESSION'], $_SETTINGS['AUTHKEY']);

	if ($session->id > 0) {

		$call = Callback::where_id_is($session->id)
			->find_one();

		if ($call !== false) {
			$status = (int)$call->status;
		}

		// Update Status
		$status = (int)$_REQUEST['STATUS'];
		if ($status > 0) {
			$call->status = $status;
			$call->save();
		}
	}

	$json = array('status' => $status);
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

// Override Security Code
if (isset($_REQUEST['SECURITY'])) {

	$security = rawurldecode($_REQUEST['SECURITY']);

	$aes = new AES256($_SETTINGS['AUTHKEY']);
	$size = strlen($aes->iv);
	$iv = substr($security, 0, $size);
	$verify = substr($security, $size, 40);
	$ciphertext = substr($security, 40 + $size);

	$security = '';
	$decrypted = $aes->decrypt($ciphertext, $iv);
	if (sha1(strtoupper($decrypted)) == $verify) {
		$security = $decrypted;
	}
}

header('Content-type: text/html; charset=utf-8');

if (defined('LANGUAGE')) {
	include('./locale/' . LANGUAGE . '/guest.php');
} else {
	include('./locale/en/guest.php');
}

$error = '';
$name = '';
$email = '';
$message = '';
$country = '';
$timezone = '';
$dial = '';
$telephone = '';
$captcha = '';
$status = '';

$ipcountry = '';
$countryoptions = array();
$selected = '';

if (isset($_REQUEST['NAME']) && isset($_REQUEST['EMAIL']) && isset($_REQUEST['COUNTRY']) && isset($_REQUEST['DIAL']) && isset($_REQUEST['TELEPHONE']) && isset($_REQUEST['MESSAGE'])) {

	foreach ($_REQUEST as $key => $value) {
		if ($key != 'Submit') {
			$value = str_replace('<', '&lt;', $value);
			$value = str_replace('>', '&gt;', $value);
			$value = trim($value);
			$_REQUEST[$key] = $value;
		}
	}

	$name = stripslashes($_REQUEST['NAME']);
	$email = stripslashes($_REQUEST['EMAIL']);
	$message = stripslashes($_REQUEST['MESSAGE']);
	$country = stripslashes($_REQUEST['COUNTRY']);
	$dial = stripslashes($_REQUEST['DIAL']);
	$telephone = stripslashes($_REQUEST['TELEPHONE']);
	$timezone = stripslashes($_REQUEST['TIMEZONE']);
	$captcha = stripslashes($_REQUEST['CAPTCHA']);

	if (empty($name) || empty($email) || empty($message) || empty($country) || empty($telephone)) {
		$error = $_LOCALE['invaliddetailserror'];
	}
	else {

		if (!preg_match('/^[\-!#$%&\'*+\\\\.\/0-9=?A-Z\^_`a-z{|}~]+@[\-!#$%&\'*+\\\\\/0-9=?A-Z\^_`a-z{|}~]+\.[\-!#$%&\'*+\\\\.\/0-9=?A-Z\^_`a-z{|}~]+$/', $email)) {
			$error = $_LOCALE['invalidemail'];
		}
		else {

			$security = sha1(strtoupper($security));
			$captcha = sha1(strtoupper($captcha));
			if ($security != $captcha && $_SETTINGS['SECURITYCODE'] == true && ((function_exists('imagepng') || function_exists('imagejpeg')) && function_exists('imagettftext'))) {
				$error = $_LOCALE['invalidsecurityerror'];

				// Generate Security Code
				$chars = array('a','A','b','B','c','C','d','D','e','E','f','F','g','G','h','H','i','I','j','J','k','K','l','L','m','M','n','N','o','O','p','P','q','Q','r','R','s','S','t','T','u','U','v','V','w','W','x','X','y','Y','z','Z','1','2','3','4','5','6','7','8','9');
				$security = '';
				for ($i = 0; $i < 5; $i++) {
				   $security .= $chars[rand(0, count($chars)-1)];
				}

			}
			else {

				$pos = strpos($country, '+');
				$prefix = trim(substr($country, $pos));
				$country = trim(substr($country, 0, $pos - strlen($country)));

				if ($timezone) {
					$offset = -$timezone;
					$timezone = ($offset > 0) ? '+' : '-';
					$timezone .= floor($offset / 60);
					$timezone .= (($offset % 60) < 10) ? '0' . $offset % 60 : $offset % 60;
				}

				$call = Callback::create();
				$call->datetime = date('Y-m-d H:i:s', time());
				$call->name = $name;
				$call->email = $email;
				$call->country = $country;
				$call->timezone = $timezone;
				$call->dial = $dial;
				$call->telephone = $telephone;
				$call->message = $message;
				$call->save();

				$session->id = $call->id;

			}

		}
	}

	// JSON / JSONP
	$json = array('id' => $session->id, 'error' => $error);
	$json = json_encode($json);

	$encrypted = $session->encrypt($json);

	$json = array('session' => $encrypted);
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

	// Reset Security Code
	$chars = array('a','A','b','B','c','C','d','D','e','E','f','F','g','G','h','H','i','j','J','k','K','L','m','M','n','N','p','P','q','Q','r','R','s','S','t','T','u','U','v','V','w','W','x','X','y','Y','z','Z','2','3','4','5','6','7','8','9');
	$ascii = array();

	$code = '';
	for ($i = 0; $i < 5; $i++) {
		$char = $chars[rand(0, count($chars) - 1)];
		$ascii[$i] = ord($char);
		$code .= $char;
	}

	$verify = sha1(strtoupper($code));
	$aes = new AES256($_SETTINGS['AUTHKEY'], $iv);
	$captcha = $aes->iv . $verify . $aes->encrypt($code);

	// MaxMind Geo IP Location Plugin
	if (file_exists('./plugins/maxmind/GeoLiteCity.dat') && $_SETTINGS['SERVERVERSION'] >= 3.90) {
		// Note that you must download the New Format of GeoIP City (GEO-133).
		// The old format (GEO-132) will not work.

		require_once('./plugins/maxmind/geoipcity.php');

		// Shared Memory Support
		// geoip_load_shared_mem('./plugins/maxmind/GeoLiteCity.dat');
		// $gi = geoip_open('./plugins/maxmind/GeoLiteCity.dat', GEOIP_SHARED_MEMORY);

		$gi = geoip_open('./plugins/maxmind/GeoLiteCity.dat', GEOIP_STANDARD);
		$record = geoip_record_by_addr($gi, ip_address());
		if (!empty($record)) {
			$ipcountry = $record->country_code;
		}

		geoip_close($gi);

	}

	// Popular Countries
	$popular = array();
	$popular[] = 'UK';
	$popular[] = 'US';
	if (!empty($ipcountry)) {
		$popular[] = $ipcountry;
	}

	// Countries
	$countries = Country::order_by_asc('country')
		->find_many();

	$currentoption = '';
	$popularadded = false;

	if ($countries !== false) {
		foreach ($countries as $key => $value) {
			$option = sprintf('%s +%s', ucwords(strtolower($value->country)), $value->dial);
			if (!in_array($value->code, $popular)) {
				$countryoptions[] = $option;
			} else {
				if ($ipcountry !== $value->code) {
					if (!$popularadded) {
						array_unshift($countryoptions, '');
						$popularadded = true;
					}
					array_unshift($countryoptions, $option);
				} else {
					$currentoption = $option;
				}
			}
			if ($ipcountry == $value->code) {
				$selected = $value->country;
			}
		}
	}

	if (!empty($ipcountry)) {
		array_unshift($countryoptions, $currentoption);
	}

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

// Override App Name
if (LANGUAGE !== $_SETTINGS['LOCALE'] && !empty($_LOCALE['appname'])) {
	$_SETTINGS['NAME'] = $_LOCALE['appname'];
}

$smarty->assign('SETTINGS', $_SETTINGS, true);
$smarty->assign('language', LANGUAGE, true);
$smarty->assign('cookie', $_REQUEST['COOKIE'], true);
$smarty->assign('template', $_SETTINGS['TEMPLATE'], true);

$smarty->debugging = false;
$smarty->caching = false;

$smarty->assign('LOCALE', $_LOCALE, true);

$uri = (isset($_SERVER['REQUEST_URI'])) ? $_SERVER['REQUEST_URI'] : $_SERVER['SCRIPT_NAME'];
$basedir = substr($uri, 0, strpos($uri, '/livehelp')) . '/livehelp/';
if (isset($_SETTINGS['BASEDIR'])) {
	$basedir = $_SETTINGS['BASEDIR'];
}
$smarty->assign('basedir', $basedir);

$jspath = '/livehelp/scripts/jquery.livehelp.js';
if (isset($_SETTINGS['JSPATH'])) {
	$jspath = $_SETTINGS['JSPATH'];
}
$smarty->assign('jspath', $jspath);

$smarty->assign('name', $name);
$smarty->assign('email', $email);
$smarty->assign('country', $country);
$smarty->assign('server', $server);
$smarty->assign('prefix', $prefix);
$smarty->assign('telephone', $telephone);
$smarty->assign('message', $message);
$smarty->assign('title', 'Click-to-Call', true);
$smarty->assign('countries', $countryoptions);
$smarty->assign('dial', $dial);
$smarty->assign('selected', $selected);

if (!empty($captcha)) {
	$smarty->assign('captcha', $captcha, true);
}

if (!empty($error)) { $smarty->assign('error', $error, true); }

// Compaign Image
if (!empty($_SETTINGS['CAMPAIGNIMAGE'])) {
	$smarty->assign('campaign', true);
} else {
	$smarty->assign('campaign', false);
}

// Campaign Link
if (!empty($_SETTINGS['CAMPAIGNLINK'])) {
	$smarty->assign('campaignlink', true);
} else {
	$smarty->assign('campaignlink', false);
}

// Security Code
if ($_SETTINGS['SECURITYCODE'] == true && (function_exists('imagepng') || function_exists('imagejpeg')) && function_exists('imagettftext')) {
	$smarty->assign('security', true);
}

$smarty->display($_SETTINGS['TEMPLATE'] . '/call.tpl');
?>
