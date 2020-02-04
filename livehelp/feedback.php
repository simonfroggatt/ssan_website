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
	require('./include/smarty/Smarty.class.php');

	include('./include/spiders.php');
	include('./include/core.functions.php');
	include('./include/class.aes.php');
	include('./include/class.session.php');
	$installed = include('./include/core.config.php');
	include('./include/class.models.php');
	include('./include/class.cookie.php');
	include('./include/class.email.php');
	include('./include/version.php');
}

if ($installed == false) {

	// Hooks
	require_once $dir . '/class.hooks.php';
	$hooks->run('OfflineEmailError');

	if (isset($_SETTINGS['EMAIL'])) {
		// Default Settings
		if (!isset($_SETTINGS['TEMPLATE'])) { $_SETTINGS['TEMPLATE'] = 'default'; }
	} else {
		header('Location: error.htm');
		exit();
	}
}

header('Content-type: text/html; charset=utf-8');
if (file_exists('locale/' . LANGUAGE . '/guest.php')) {
	include('locale/' . LANGUAGE . '/guest.php');
}
else {
	include('locale/en/guest.php');
}

$error = '';
$question = '';
$email = '';
$message = '';
$score = '';
$server = htmlspecialchars($_REQUEST['SERVER']);
$json = (isset($_REQUEST['JSON'])) ? true : false;

// Initialise Session
$session = false;
if (isset($_REQUEST['SESSION'])) {
	$session = new Session($_REQUEST['SESSION'], $_SETTINGS['AUTHKEY']);
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

if (isset($_REQUEST['QUESTION']) && isset($_REQUEST['MESSAGE'])) {

	foreach ($_REQUEST as $key => $value) {
		if ($key != 'Submit') {
			$value = trim($value);
			$_REQUEST[$key] = $value;
		}
	}

	$question = stripslashes(htmlspecialchars($_REQUEST['QUESTION']));
	$email = stripslashes(htmlspecialchars($_REQUEST['EMAIL']));
	$message = stripslashes(htmlspecialchars($_REQUEST['MESSAGE']));
	$score = stripslashes(htmlspecialchars($_REQUEST['SCORE']));

	// Validate Email
	if (!preg_match('/^[\-!#$%&\'*+\\\\.\/0-9=?A-Z\^_`a-z{|}~]+@[\-!#$%&\'*+\\\\\/0-9=?A-Z\^_`a-z{|}~]+\.[\-!#$%&\'*+\\\\.\/0-9=?A-Z\^_`a-z{|}~]+$/i', $email)) {
		$email = '';
	}

	if (empty($question) || empty($message)) {
		$error = $_LOCALE['invaliddetailserror'];

		if ($json) {
			$json = array('result' => false, 'error' => $error);
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

	} else {

		$visitor = false;
		if ((isset($_SETTINGS['VISITORTRACKING']) && $_SETTINGS['VISITORTRACKING'] !== false) && (!isset($_SETTINGS['COUCHBASEHOST']) || !isset($_SETTINGS['COUCHBASEBUCKET']))) {
			$visitor = Visitor::where_id_is($session->request)->find_one();
		}

		// Visitor Details
		if ($visitor !== false) {
			$url = $visitor->url;
			$title = $visitor->title;
			$referrer = $visitor->referrer;

			if (empty($url)) { $url = 'Unavailable'; }
			if (empty($title)) { $title = 'Unavailable'; }
			if (empty($referrer)) { $referrer = 'Unavailable'; } elseif ($referrer == 'false') { $referrer = 'Direct Link / Bookmark'; }
		}

		$country = 'Unavailable';
		// MaxMind Geo IP Location Plugin
		if (file_exists('./plugins/maxmind/GeoLiteCity.dat') && $_SETTINGS['SERVERVERSION'] >= 3.90) {
			// Note that you must download the New Format of GeoIP City (GEO-133).
			// The old format (GEO-132) will not work.

			require_once('./plugins/maxmind/geoipcity.php');

			// Shared Memory Support
			// geoip_load_shared_mem('../maxmind/GeoLiteCity.dat');
			// $gi = geoip_open('../maxmind/GeoLiteCity.dat', GEOIP_SHARED_MEMORY);

			$gi = geoip_open('./plugins/maxmind/GeoLiteCity.dat', GEOIP_STANDARD);
			$record = geoip_record_by_addr($gi, ip_address());
			if (!empty($record)) {
				$country = $record->country_name;
				if (isset($GEOIP_REGION_NAME[$record->country_code][$record->region])) { $state = $GEOIP_REGION_NAME[$record->country_code][$record->region]; } else { $state = ''; }
				$city = $record->city;
			}
			geoip_close($gi);

		}

		switch ((int)$score) {
			case 1:
				$score = 'Sad';
				$scoreimage = $_SETTINGS['URL'] . '/livehelp/images/RatingPoor.png';
				break;
			case 2:
				$score = 'Neutral';
				$scoreimage = $_SETTINGS['URL'] . '/livehelp/images/RatingNeutral.png';
				break;
			case 3:
				$score = 'Happy';
				$scoreimage = $_SETTINGS['URL'] . '/livehelp/images/RatingGood.png';
				break;
		}

		$hostname = gethostnamebyaddr(ip_address());
		$message = preg_replace("/(\r\n|\r|\n)/", '<br/>', $message);

		$html = <<<END
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<style type="text/css">
<!--

div, p {
	font-family: Calibri, Verdana, Arial, Helvetica, sans-serif;
	font-size: 14px;
	color: #000000;
}

//-->
</style>
</head>

<body>
<p><img src="{$_SETTINGS['FEEDBACKHEADERIMAGE']}" alt="Customer Feedback" /></p>
<p><strong>Score:</strong> $score</p>
<p><img src="$scoreimage" alt="$score" title="$score"/></p>
<p><strong>$question</strong></p>
<p>$message</p>
<p>&nbsp;</p>
END;

		if ($visitor !== false) {

			$html .= <<<END
<p><strong>IP / Hostname Logged:</strong> $hostname<br />
<strong>Country:</strong> $country<br />
<strong>Current Page:</strong> <a href="$url">$url</a><br />
<strong>Current Page Title:</strong> $title<br />
<strong>Referer:</strong> <a href="$referrer">$referrer</a></p>
END;
		}

		$html .= <<<END
<p><img src="{$_SETTINGS['OFFLINEEMAILFOOTERIMAGE']}" alt="{$_SETTINGS['NAME']}" /></p>
</body>
</html>
END;

		$from = $_SETTINGS['EMAIL'];
		if (isset($_SETTINGS['SMTPFROM'])) {
			$from = $_SETTINGS['SMTPFROM'];
		}

		$subject = $_SETTINGS['NAME'] . ' ' . $_LOCALE['feedback'];

		if (!empty($email)) {
			$replyto = $email;
		} else {
			$replyto = $_SETTINGS['EMAIL'];
		}

		$result = Email::send($_SETTINGS['EMAIL'], $from, $_SETTINGS['NAME'], $subject, $html, EmailType::HTML, $replyto);

		if ($json) {
			$json = array('result' => $result);
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
	}

	$message = stripslashes($message);

} else {
	header('HTTP/1.1 400 Bad Request');
	exit();
}

?>
