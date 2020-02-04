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

use PDO;

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('html_errors', false);

require_once('../include/core.functions.php');

error_reporting(E_ERROR | E_PARSE);
set_time_limit(0);

if (!get_magic_quotes_gpc()) {
	$_REQUEST = array_map('addslashes', $_REQUEST);
}

// HTTP/1.1
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', false);

// HTTP/1.0
header('Pragma: no-cache');

// Include Path
$dir = dirname(__FILE__);

// Paris and Idiorm
include($dir . '/../include/lib/idiorm.php');
include($dir . '/../include/lib/paris.php');

$result = true;
$error = '';
$mysql = 'MySQL Database Issue';
$type = 0;

// PDO Drivers
$mysqlpdo = false;
$pdo = ORM::get_db();
$drivers = $pdo::getAvailableDrivers();
foreach ($drivers as $key => $driver) {
	if ($driver == 'mysql') {
		$mysqlpdo = true;
		break;
	}
}

// Hostname
$host = $_REQUEST['HOSTNAME'];

// Database Port
$separator = strpos($host, ':');
if ($separator !== false) {
	$host = substr($host, 0, $separator);
	$port = substr($host, $separator + 1);
	if (is_numeric($port)) {
		$port = (int)$port;
	} else {
		$port = 3306;
	}
} else {
	$port = 3306;
}

// Database Configuration
try {

	$connection = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8', $host, $port, $_REQUEST['DATABASE']);
	$db = new PDO($connection, $_REQUEST['USERNAME'], $_REQUEST['PASSWORD']);

	ORM::set_db($db);

} catch (\PDOException $ex) {
	$error = $ex->getMessage();
	$type = $ex->getCode();
	$result = false;
}

if ($mysqlpdo == false) {
	$result = false;
}

$json = array();
$json['result'] = $result;
if (!$result) {
	$data = array();
	$data['error'] = $error;
	$data['mysql'] = $mysql;
	$data['type'] = $type;
	$json['error'] = $data;
}
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
