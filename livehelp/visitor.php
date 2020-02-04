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
}

// Fix Suhosin Request Data / Visitor Tracking Issue
// suhosin.get.max_value_length=512
$_REQUEST = array();
$params = explode('&', $_SERVER['QUERY_STRING']);
foreach ($params as $pair) {
	list($key, $value) = explode('=', $pair);
	$_REQUEST[urldecode($key)] = urldecode($value);
}

if (!isset($_SERVER['HTTP_REFERER'])){ $_SERVER['HTTP_REFERER'] = ''; }
if (!isset($_REQUEST['DATA'])){ $_REQUEST['DATA'] = ''; }
if (!isset($_REQUEST['DEPARTMENT'])){ $_REQUEST['DEPARTMENT'] = ''; }
if (!isset($_REQUEST['SERVER'])){ $_REQUEST['SERVER'] = ''; }
if (!isset($_REQUEST['PLUGIN'])){ $_REQUEST['PLUGIN'] = ''; }
if (!isset($_REQUEST['CUSTOM'])){ $_REQUEST['CUSTOM'] = ''; }
if (!isset($_REQUEST['NAME'])){ $_REQUEST['NAME'] = ''; }

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
	header('HTTP/1.1 403 Access Forbidden');
	header('Content-Type: text/plain');
	exit();
}

if (!empty($_REQUEST['DATA'])) {
	$data = base64_decode($_REQUEST['DATA']);
	$data = prepare_json($data);
	$data = json_decode($data, true);

	$_REQUEST['INITIATE'] = (isset($data['INITIATE'])) ? $data['INITIATE'] : false;
	$_REQUEST['CLOUD'] = (isset($data['CLOUD'])) ? 2 : 0;
	$_REQUEST['TITLE'] = (isset($data['TITLE'])) ? $data['TITLE'] : '';
	$_REQUEST['URL'] = (isset($data['URL'])) ? $data['URL'] : '';
	$_REQUEST['REFERRER'] = (isset($data['REFERRER'])) ? $data['REFERRER'] : '';
	$_REQUEST['USERAGENT'] = (isset($data['USERAGENT'])) ? $data['USERAGENT'] : '';
	$_REQUEST['WIDTH'] = (isset($data['WIDTH'])) ? $data['WIDTH'] : '';
	$_REQUEST['HEIGHT'] = (isset($data['HEIGHT'])) ? $data['HEIGHT'] : '';
	$_REQUEST['TIME'] = (isset($data['TIME'])) ? $data['TIME'] : '';
	$_REQUEST['PLUGIN'] = (isset($data['PLUGIN'])) ? $data['PLUGIN'] : '';
	$_REQUEST['CUSTOM'] = (isset($data['CUSTOM'])) ? $data['CUSTOM'] : '';
	$_REQUEST['NAME'] = (isset($data['NAME'])) ? $data['NAME'] : '';
	$_REQUEST['DEPARTMENT'] = (isset($data['DEPARTMENT'])) ? $data['DEPARTMENT'] : '';
	$_REQUEST['SESSION'] = (isset($data['SESSION'])) ? $data['SESSION'] : '';
	$_REQUEST['WEBSOCKETS'] = (isset($data['WEBSOCKETS'])) ? $data['WEBSOCKETS'] : '';

	$cloud = $_REQUEST['CLOUD'];
} else {
	header('HTTP/1.1 403 Access Forbidden');
	header('Content-Type: text/plain');
	exit();
}

$department = htmlspecialchars($_REQUEST['DEPARTMENT']);
$callback = (isset($_REQUEST['CALLBACK'])) ? true : false;
$websocket = (isset($_REQUEST['WEBSOCKETS']) && !empty($_REQUEST['WEBSOCKETS'])) ? $_REQUEST['WEBSOCKETS'] : false;

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

if (!isset($_REQUEST['TITLE'])){ $_REQUEST['TITLE'] = ''; }
if (!isset($_REQUEST['URL'])){ $_REQUEST['URL'] = ''; }
if (!isset($_REQUEST['REFERRER'])){ $_REQUEST['REFERRER'] = ''; }
if (!isset($_REQUEST['INITIATE'])){ $_REQUEST['INITIATE'] = ''; }

$title = urldecode(substr($_REQUEST['TITLE'], 0, 150));
$url = urldecode($_REQUEST['URL']);
$referrer = urldecode($_REQUEST['REFERRER']);
$initiate = $_REQUEST['INITIATE'];

$totalpages = 0;
$initiated = array('enabled' => false);

// AJAX Cross-site Headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
	header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
	header('Access-Control-Allow-Credentials: true');
}

// HTTP/1.1
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', false);

// HTTP/1.0
header('Pragma: no-cache');

// Initialise Session
$session = new Session($_REQUEST['SESSION'], $_SETTINGS['AUTHKEY']);

// Chat
$chat = false;
if ($session->chat > 0) {
	$chat = Chat::where_id_is($session->chat)->find_one();
	if ($_SETTINGS['DATABASEVERSION'] >= 17 && (empty($chat->hash) || empty($session->hash) || $chat->hash !== $session->hash)) {
		$chat = false;
	}
}

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

$guid = false;

if ($visitor !== false) {

	$initiateflag = $visitor->initiate;
	$status = $visitor->status;
	$date = date('Y-m-d H:i:s', time());

	if (!empty($url)) {

		// Current Page from URL
		$page = $url;
		for ($i = 0; $i < 3; $i++) {
			$pos = strpos($page, '/');
			if ($pos === false) {
				$page = '';
				break;
			}
			if ($i < 2) {
				$page = substr($page, $pos + 1);
			}
			elseif ($i >= 2) {
				$page = substr($page, $pos);
			}
		}

		$page = trim(addslashes($page));
		if (is_array($visitor->path)) {
			$path = $visitor->path;
			$previouspath = $path;
		} else {
			$path = addslashes($visitor->path);
			$previouspath = explode('; ', $path);
		}

		if ($page != trim(end($previouspath))) {

			$visitor->request = $date;
			if (is_array($visitor->path)) {
				$path[] = $page;
				$visitor->path = $path;
			} else {
				$visitor->path = $path . '; ' . $page;
			}
			$visitor->url = $page;
			$visitor->status = $cloud;

			$totalpages = count($previouspath) + 1;

			if ($_SETTINGS['TRANSCRIPTVISITORALERTS'] == true && $chat !== false) {

				if ($chat->id > 0 && $chat->session()->count() > 0) {
					$message = Message::create();
					$message->chat = $chat->id;
					$message->username = '';
					$message->datetime = $date;
					$message->message = sprintf('%s has just visited %s',  $chat->name, $_SERVER['HTTP_REFERER']);
					$message->align = 2;
					$message->status = -2;
					$message->save();

					// Visitor Alert Hook
					$hooks->run('VisitorAlert', $message);
				}
			}

		} else {

			$visitor->url = $referrer;
			$visitor->status = $cloud;

			$totalpages = count($previouspath);
		}
	}

	// Initiate Chat
	if ($initiateflag > 0 || $initiateflag == -1) { $initiated = array('enabled' => true); }
	if (isset($_SETTINGS['INITIATECHATAUTO']) && $_SETTINGS['INITIATECHATAUTO'] > 0) {
		if (($initiateflag == 0 || $initiateflag == -1) && count(Operators::$online) > 0 && $totalpages >= $_SETTINGS['INITIATECHATAUTO']) {
			$initiated = array('enabled' => true);
		}
	}

	// Custom Initiate Chat
	if ($initiateflag > 0) {
		$custominitiate = InitiateChat::where('request', $session->request)->find_one();
		if ($custominitiate !== false) {
			$avatar = false;

			// Operator
			$operator = Operator::where_id_is($custominitiate->user)->find_one();
			if ($operator !== false) {
				$avatar = md5($operator->email);
				$image = $operator->image;
			}
			$initiated = array('enabled' => true, 'message' => $custominitiate->message, 'avatar' => $avatar, 'image' => $image);
		}
	}

	// IP Address
	$ipaddress = ip_address(false);
	if ($ipaddress !== false && $visitor->ipaddress !== $ipaddress) {
		$visitor->ipaddress = $ipaddress;
	}

	// User Agent
	$useragent = (isset($_SERVER['HTTP_USER_AGENT'])) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 200) : '';

	if (isset($_REQUEST['USERAGENT']) && !empty($_REQUEST['USERAGENT'])) {
		$useragent = $_REQUEST['USERAGENT'];
	}
	$visitor->useragent = $useragent;

	// Update Initiate Status
	if (!empty($initiate)) {
		if ($initiate == 'Opened') {
			// Intiiate Opened
			$visitor->initiate = '-1';
		}
		elseif ($initiate == 'Accepted') {
			// Initiate Accepted
			$visitor->initiate = '-2';
		}
		elseif ($initiate == 'Declined') {
			// Initiate Declined
			$visitor->initiate = '-3';
		}
	}

	// Update Current Page and Title
	if (!empty($url) && !empty($title)) {
		$visitor->url = $url;
		$visitor->title = $title;
	}

	$visitor->refresh = $date;

	// Save Visitor
	if ($session->db !== false && method_exists($visitor, 'save')) {
		$visitor->save();
	}

	// Visitor Updated
	if ($visitor !== false) {
		$visitor->websocket = $websocket;
		$hooks->run('VisitorUpdated', $visitor);
	}

} else {

	if (!isset($_REQUEST['WIDTH'])){ $_REQUEST['WIDTH'] = ''; }
	if (!isset($_REQUEST['HEIGHT'])){ $_REQUEST['HEIGHT'] = ''; }

	$width = $_REQUEST['WIDTH'];
	$height = $_REQUEST['HEIGHT'];

	$ipaddress = ip_address();
	$useragent = (isset($_SERVER['HTTP_USER_AGENT'])) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 200) : '';

	if (isset($_REQUEST['USERAGENT']) && !empty($_REQUEST['USERAGENT'])) {
		$useragent = $_REQUEST['USERAGENT'];
	}

	if (!empty($width) && !empty($height) && !empty($url)) {

		$page = $_REQUEST['URL'];
		for ($i = 0; $i < 3; $i++) {
			$pos = strpos($page, '/');
			if ($pos === false) {
				$page = '';
				break;
			}
			if ($i < 2) {
				$page = substr($page, $pos + 1);
			}
			elseif ($i >= 2) {
				$page = substr($page, $pos);
			}
		}
		if (empty($page)) { $page = '/'; }
		$page = urldecode(trim($page));

		if (empty($referrer)) { $referrer = 'Direct Visit / Bookmark'; }
		$date = date('Y-m-d H:i:s', time());

		if ($session->db !== false) {
			$visitor = Visitor::create();
		} else {
			$visitor = $session->visitor;
		}

		$visitor->ipaddress = $ipaddress;
		$visitor->useragent = $useragent;
		$visitor->resolution = sprintf('%s x %s', $width, $height);
		$visitor->city = '';
		$visitor->state = '';
		$visitor->country = '';
		$visitor->datetime = $date;
		$visitor->request = $date;
		$visitor->url = $url;
		$visitor->title = $title;
		$visitor->referrer = $referrer;
		$visitor->initiate = 0;
		$visitor->status = $cloud;

		if ($session->db !== false) {
			$visitor->refresh = $date;
			$visitor->path = $page;
		} else {
			$visitor->path = array($page);
		}

		$visitor->status = $cloud;

		// MaxMind Geo IP Location Plugin
		// Note that you must download the new format of the MaxMind GeoIP City (GEO-133).
		// The old format (GEO-132) will not work.
		$geolocation = false;
		if (file_exists('./plugins/maxmind/GeoLiteCity.dat') && (float)$_SETTINGS['SERVERVERSION'] >= 3.90) {
			require_once('./plugins/maxmind/geoipcity.php');

			// Shared Memory Support
			// geoip_load_shared_mem('./plugins/maxmind/GeoLiteCity.dat');
			// $gi = geoip_open('./plugins/maxmind/GeoLiteCity.dat', GEOIP_SHARED_MEMORY);

			$gi = geoip_open('./plugins/maxmind/GeoLiteCity.dat', GEOIP_STANDARD);
			$record = geoip_record_by_addr($gi, ip_address());
			if (!empty($record)) {
				if (!empty($record->country_name)) { $country = convert_utf8($record->country_name); } else { $country = ''; }
				if (isset($GEOIP_REGION_NAME[$record->country_code][$record->region])) { $state = convert_utf8($GEOIP_REGION_NAME[$record->country_code][$record->region]); } else { $state = ''; }
				if (!empty($record->city)) { $city = convert_utf8($record->city); } else { $city = ''; }

				$visitor->city = $city;
				$visitor->state = $state;
				$visitor->country = $country;

				$geolocation = array(
					'city' => $city,
					'state' => $state,
					'country' => $country
				);

				// Save Visitor
				if ($session->db !== false) {
					$visitor->save();
				}

				// Insert Geolocation
				if ((float)$_SETTINGS['SERVERVERSION'] >= 4.10) {
					$latitude = $record->latitude;
					$longitude = $record->longitude;

					// Location Save
					if ($session->db !== false) {
						// Save Geolocation
						$location = Geolocation::create();
						$location->request = $visitor->id;
						$location->city = $city;
						$location->state = $state;
						$location->country = $country;
						$location->latitude = $latitude;
						$location->longitude = $longitude;
						$location->save();
					} else {
						$visitor->city = $city;
						$visitor->state = $state;
						$visitor->country = $country;
						$visitor->latitude = $latitude;
						$visitor->longitude = $longitude;
					}

					$geolocation = array(
						'city' => $city,
						'state' => $state,
						'country' => $country,
						'latitude' => $latitude,
						'longitude' => $longitude
					);
				}

			} else {
				// Save Visitor
				if ($session->db !== false) {
					$visitor->save();
				}
			}
			geoip_close($gi);

		} else {
			// Save Visitor
			if ($session->db !== false) {
				$visitor->save();
			}
		}

		// GUID
		$guid = guidv4();

		if ($session->db === false) {
			$visitor->id = 'visitor:' . ACCOUNT . ':' . $guid;
		}

		$visitor->guid = $guid;
		$visitor->location = $geolocation;

		// Visitor Added Hook
		$visitor->websocket = $websocket;
		$hooks->run('VisitorAdded', $visitor);

	}
}

// Custom Integration
$plugin = htmlspecialchars(urldecode($_REQUEST['PLUGIN']));
$custom = htmlspecialchars(urldecode($_REQUEST['CUSTOM']));
$name = htmlspecialchars(urldecode($_REQUEST['NAME']));

// Custom Plugin / Integration Data
if ($visitor !== false && ($visitor->id > 0 || is_string($visitor->id)) && !empty($plugin) && !empty($custom)) {
	if ($plugin !== 'Internal') {

		// Integration Hook
		$hooks->run('VisitorCustomDetailsInitialised', array('request' => $visitor->id, 'custom' => $custom, 'name' => $name, 'plugin' => $plugin));

	} else if ($plugin === 'Internal') {

		$result = $hooks->run('VisitorCustomDetailsInitialised', array('visitor' => $visitor, 'custom' => $custom, 'name' => $name, 'plugin' => $plugin));

		// Internal Integration
		if (!is_bool($result)) {
			$integration = Custom::where('request', $visitor->id)->find_one();
			if ($integration === false) {
				$integration = Custom::create();
				$integration->request = $visitor->id;
			}
			$integration->custom = $custom;
			$integration->name = $name;
			$integration->reference = $plugin;
			$integration->save();
		}
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

// Departments
$departments = false;
if ($_SETTINGS['DEPARTMENTS'] == true) {

	$departments = array();
	$operators = array();

	$excludedepts = array();
	if ($hiddendepts !== false) {
		foreach ($hiddendepts as $key => $value) {
			$excludedepts[] = $value->name;
		}
	}

	if (Operators::$online !== false) {
		foreach (Operators::$online as $id) {
			$user = Operator::where_id_is($id)
				->find_one();

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
	}

	// Departments Loaded Hook
	if (is_array($departments) && count($departments) > 0) {
		$departments = $hooks->run('DepartmentsLoaded', $departments);
	}

}

$json = array();
if ($visitor !== false && ((is_numeric($visitor->id) && $visitor->id > 0) || (is_string($visitor->id) && strlen($visitor->id) > 0))) {
	$data = array();
	if ($visitor !== false && is_numeric($visitor->id) && $visitor->id > 0) {
		$data = array('visitor' => (int)$visitor->id);
	}

	// Visitor Session Hook
	$result = $hooks->run('VisitorSessionData', array('guid' => $guid, 'session' => $session));
	if ($result !== false && is_string($result)) {
		$data = array('visitor' => $result);
	} else if (is_array($result) && is_array($result['session']) && isset($result['session']['request'])) {
		$data = array('visitor' => (int)$result['session']['request']);
	}

	if ($chat !== false) {
		$data['chat'] = (int)$chat->id;
		$data['name'] = $chat->name;
		$data['email'] = $chat->email;
		$data['department'] = $chat->department;

		if ($_SETTINGS['DATABASEVERSION'] >= 17 && !empty($chat->hash)) {
			$data['hash'] = $chat->hash;
		}

	} else {
		$data['chat'] = 0;
	}

	$encrypted = $session->encrypt($data);

	if (isset($_SETTINGS['CLOUDSOCKETSVISITORSALT'])) {
		$salt = $_SETTINGS['CLOUDSOCKETSVISITORSALT'];
		$json['visitor'] = sha1($session->request . $salt);
	}

	$json['session'] = $encrypted;
}

$json['status'] = $status;
$json['departments'] = $departments;
$json['initiate'] = $initiated;

$json = json_encode($json);

if (!isset($_GET['callback'])) {
	header('Content-Type: application/json; charset=utf-8');
	echo($json);
} else {
	if (is_valid_callback($_GET['callback'])) {
		header('Content-Type: text/javascript; charset=utf-8');
		echo($_GET['callback'] . '(' . $json . ')');
	} else {
		header('HTTP/1.1 400 Bad Request');
	}
}
exit();

?>
