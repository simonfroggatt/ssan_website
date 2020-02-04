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

function htmlSmilies($message, $path, $eol = '') {

	$smilie[0] = ':D';
	$smilieImage[0] = 'Laugh.png';
	$smilie[1] = ':)';
	$smilieImage[1] = 'Smile.png';
	$smilie[2] = ':(';
	$smilieImage[2] = 'Sad.png';
	$smilie[3] = '$)';
	$smilieImage[3] = 'Money.png';
	$smilie[4] = '&gt;:O';
	$smilieImage[4] = 'Angry.png';
	$smilie[5] = ':P';
	$smilieImage[5] = 'Impish.png';
	$smilie[6] = ':\\';
	$smilieImage[6] = 'Sweat.png';
	$smilie[7] = '8)';
	$smilieImage[7] = 'Cool.png';
	$smilie[8] = '&gt;:L';
	$smilieImage[8] = 'Frown.png';
	$smilie[9] = ';)';
	$smilieImage[9] = 'Wink.png';
	$smilie[10] = ':O';
	$smilieImage[10] = 'Surprise.png';
	$smilie[11] = '8-)';
	$smilieImage[11] = 'Woo.png';
	$smilie[12] = '8-O';
	$smilieImage[12] = 'Shock.png';
	$smilie[13] = 'xD';
	$smilieImage[13] = 'Hysterical.png';
	$smilie[14] = ':-*';
	$smilieImage[14] = 'Kissed.png';
	$smilie[15] = ':S';
	$smilieImage[15] = 'Dizzy.png';
	$smilie[16] = '+O)';
	$smilieImage[16] = 'Celebrate.png';
	$smilie[17] = '&lt;3';
	$smilieImage[17] = 'Adore.png';
	$smilie[18] = 'zzZ';
	$smilieImage[18] = 'Sleep.png';
	$smilie[19] = ':X';
	$smilieImage[19] = 'Stop.png';
	$smilie[20] = 'X-(';
	$smilieImage[20] = 'Tired.png';

	for($i=0; $i < count($smilie); $i++) {
		$message = str_replace($smilie[$i], '<img src="' . $path . $smilieImage[$i] . '" alt="Smilie" />' . $eol, $message);
	}
	return $message;
}

function time_layout($unixtime) {

	global $_LOCALE;

	$minutes = (int)($unixtime / 60);
	if ($minutes > 60) {
		$hours = (int)(($unixtime / 60) / 60);
		$minutes = (int)(($unixtime / 60) - ($hours * 60));

		if ($minutes < 10) {
			$minutes = '0' . (int)(($unixtime / 60) - ($hours * 60));
		}

		$seconds = ($unixtime % 60);

		if ($seconds < 10) {
			$seconds = '0' . ($unixtime % 60);
		}
		return $hours . ':' . $minutes . ':' . $seconds . ' ' . $_LOCALE['hours'];
	}
	else {
		if ($minutes < 10) {
			$minutes = '0' . (int)($unixtime / 60);
		}

		$seconds = ($unixtime % 60);

		if ($seconds < 10) {
			$seconds = '0' . ($unixtime % 60);
		}
		return $minutes . ':' . $seconds . ' ' . $_LOCALE['minutes'];
	}
}

function stripinvalidxml($value) {
	$ret = ''; $current = '';
	if (is_string($value)) {
		$length = strlen($value);
		for ($i=0; $i < $length; $i++) {
			$current = ord($value{$i});
			if (($current == 0x9) || ($current == 0xA) || ($current == 0xD) || (($current >= 0x20) && ($current <= 0xD7FF)) || (($current >= 0xE000) && ($current <= 0xFFFD)) || (($current >= 0x10000) && ($current <= 0x10FFFF))) {
				$ret .= chr($current);
			} else {
				$ret .= '';
			}
		}
	}
	return $ret;
}

function striptags($string) {
	return str_replace(array('>', '<'), array('&gt;', '&lt;'), $string);
}

function xmlelementinvalidchars($string) {
	$string = str_replace(array('>', '<', '&'), array('&gt;', '&lt;', '&amp;'), $string);
	return stripinvalidxml($string);
}

function xmlattribinvalidchars($string) {
	$string = str_replace(array('>', '<', '"', '&', '\''), array('&gt;', '&lt;', '&quot;', '&amp;', '&apos;'), $string);
	return stripinvalidxml($string);
}

function unixtimestamp($datetime){

	$datetime = explode(" ", $datetime);
	$date = explode("-", $datetime[0]);
	$time = explode(":", $datetime[1]);
	unset($datetime);

	list($year, $month, $day) = $date;
	list($hour, $minute, $second) = $time;

	return mktime(intval($hour), intval($minute), intval($second), intval($month), intval($day), intval($year));

}

function ip_public($ip, $array) {
	$result = true;
	foreach ($array as $subnet) {
		list($network, $mask) = explode('/', $subnet);

		$network = str_pad(decbin(ip2long($network)), 32, '0', STR_PAD_LEFT);
		$address = str_pad(decbin(ip2long($ip)), 32, '0', STR_PAD_LEFT);

		if (strcmp(substr($network, 0, $mask), substr($address, 0, $mask)) == 0) {
			$result = false;
			break;
		}
	}
	return $result;
}

function ip_valid($ip) {
	if (($longip = ip2long($ip)) !== false) {
		if ($ip == long2ip($longip)) {
			return true;
		}
	}
	return false;
}

function ip_address($private = true) {

	$private_networks = array('10.0.0.0/8', '127.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16');

	$address = $_SERVER['REMOTE_ADDR'];
	if (isset($_SERVER['HTTP_X_FORWARDED_FOR']) && preg_match('/\d{1,3}[\.]\d{1,3}[\.]\d{1,3}[\.]\d{1,3}/i', $_SERVER['HTTP_X_FORWARDED_FOR'])) {
		$address = $_SERVER['HTTP_X_FORWARDED_FOR'];
	}
	elseif (isset($_SERVER['HTTP_X_CLUSTER_CLIENT_IP']) && preg_match('/\d{1,3}[\.]\d{1,3}[\.]\d{1,3}[\.]\d{1,3}/i', $_SERVER['HTTP_X_CLUSTER_CLIENT_IP'])) {
		$address = $_SERVER['HTTP_X_CLUSTER_CLIENT_IP'];
	}

	$result = preg_match_all('/\d{1,3}[\.]\d{1,3}[\.]\d{1,3}[\.]\d{1,3}/i', $address, $ip_array);
	if ($result == true) {
		if (is_array($ip_array[0])) {

			$ip_array = $ip_array[0];
			array_push($ip_array, $_SERVER['REMOTE_ADDR']);

			foreach($ip_array as $ip) {
				if ($ip != '' && ip_valid($ip) && ip_public($ip, $private_networks)) {
					return $ip;
					break;
				}
			}
		}
	}

	if ($private == true) {
		return $address;
	} else {
		return false;
	}

}

if (!function_exists('json_encode')) {

	function json_encode($a = false) {
		if (is_null($a)) return 'null';
		if ($a === false) return 'false';
		if ($a === true) return 'true';

		if (is_scalar($a)) {
			if (is_float($a)) {
				// Always use "." for floats.
				return floatval(str_replace(",", ".", strval($a)));
			}

			if (is_string($a)) {
				static $jsonReplaces = array(array("\\", "/", "\n", "\t", "\r", "\b", "\f", '"'), array('\\\\', '\\/', '\\n', '\\t', '\\r', '\\b', '\\f', '\"'));
				return '"' . str_replace($jsonReplaces[0], $jsonReplaces[1], $a) . '"';
			}
			else {
				return $a;
			}
		}

		$isList = true;
		for ($i = 0, reset($a); $i < count($a); $i++, next($a)) {
			if (key($a) !== $i) {
				$isList = false;
				break;
			}
		}
		$result = array();
		if ($isList) {
			foreach ($a as $v) $result[] = json_encode($v);
			return '[' . join(',', $result) . ']';
		} else {
			foreach ($a as $k => $v) $result[] = json_encode($k).':' . json_encode($v);
			return '{' . join(',', $result) . '}';
		}
  }
}

if (!function_exists('json_decode')) {
	function json_decode($content, $assoc=false) {
		require_once(dirname(__FILE__) . '/class.json.php');
		if ($assoc) {
			$json = new Services_JSON(SERVICES_JSON_LOOSE_TYPE);
		}
		else {
			$json = new Services_JSON;
		}
		return $json->decode($content);
	}
}

/*
if (!function_exists('json_encode')) {
	function json_encode($content) {
		require_once(dirname(__FILE__) . '/class.json.php');
		$json = new Services_JSON;
		return $json->encode($content);
	}
}
*/

function prepare_json($input) {
	// Convert ASCII/ISO-8859-1 to UTF-8
	if (function_exists('mb_convert_encoding')) {
		$input = mb_convert_encoding($input, 'UTF-8', 'ASCII,UTF-8,ISO-8859-1');

		// Remove UTF-8 BOM if present, json_decode() does not like it.
		if(substr($input, 0, 3) == pack("CCC", 0xEF, 0xBB, 0xBF)) $input = substr($input, 3);
	}
	return $input;
}

function is_valid_callback($callback) {

	$reserved = array('break', 'do', 'instanceof', 'typeof', 'case',
				'else', 'new', 'var', 'catch', 'finally', 'return', 'void',
				'continue', 'for', 'switch', 'while', 'debugger', 'function',
				'this', 'with',  'default', 'if', 'throw', 'delete', 'in', 'try',
				'class', 'enum', 'extends', 'super', 'const', 'export', 'import',
				'implements', 'let', 'private', 'public', 'yield', 'interface',
				'package', 'protected', 'static', 'null', 'true', 'false');

	foreach(explode('.', $callback) as $identifier) {
		if (!preg_match('/^[a-zA-Z_$][0-9a-zA-Z_$]*(?:\[(?:".+"|\'.+\'|\d+)\])*?$/', $identifier)) {
			return false;
		}
		if (in_array(strtolower($identifier), $reserved)) {
			return false;
		}
	}

	//return preg_match('/^[$_\p{L}][$_\p{L}\p{Mn}\p{Mc}\p{Nd}\p{Pc}\x{200C}\x{200D}]*+$/u', $identifier) && !in_array(mb_strtolower($identifier, 'UTF-8'), $reserved);
	return true;
}

function gethostnamebyaddr($ip){
	if (function_exists('dns_get_record')) {
		$ptr = implode('.', array_reverse(explode('.', $ip))) . '.in-addr.arpa';
		$host = dns_get_record($ptr, DNS_PTR);
		if ($host == null) {
			return $ip;
		} else {
			return $host[0]['target'];
		}
	} else {
		return $ip;
	}
}

if (!function_exists('is_utf8')) {
	function is_utf8($val) {
		return (preg_match('~~u', $val) && !preg_match('~[\\0-\\x8\\xB\\xC\\xE-\\x1F]~', $val));
	}
}

function convert_utf8($val) {
	if (function_exists('iconv') && !is_utf8($val) && strlen($utf8 = iconv('windows-1250', 'utf-8', $val)) > strlen($val)) {
		return $utf8;
	}
	return $val;
}

function LoadTrackerPixel($image) {
	global $_SETTINGS;

	$fp = @fopen($image, 'rb');
	if ($fp == false) {
		header('Location: ' . $_SETTINGS['URL'] . '/livehelp/include/' . $image);
	} else {
		$contents = fread($fp, filesize($image));
		echo($contents);
	}
	fclose($fp);
}

function guidv4() {
	if (function_exists('openssl_random_pseudo_bytes')) {
		$data = openssl_random_pseudo_bytes(16);

		$data[6] = chr(ord($data[6]) & 0x0f | 0x40);
		$data[8] = chr(ord($data[8]) & 0x3f | 0x80);

		return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
	} else {
		return false;
	}
}

?>
