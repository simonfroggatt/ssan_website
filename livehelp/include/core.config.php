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

error_reporting(E_ALL);
if (isset($_SETTINGS['DISPLAYERRORS']) && $_SETTINGS['DISPLAYERRORS'] == true) {
	ini_set('display_errors', 1);
} else {
	ini_set('display_errors', 0);
}
ini_set('html_errors', false);

// Log PHP Fatal Errors - Development Servers
if (isset($_SETTINGS['PHPLOG'])) {
	ini_set('log_errors', 1);
	ini_set('error_log', $_SETTINGS['PHPLOG']);
}

// Error Log
if (isset($_SETTINGS['LOGFILE'])) {
	$logfile = $_SETTINGS['LOGFILE'];
} else {
	$logfile = dirname(__FILE__) . '/../log/ERRORLOG.TXT';
}

// Include Path
$dir = dirname(__FILE__);

require_once($dir . '/class.errorhandler.php');

if (!empty($logfile) && is_writable($logfile)) {
	set_error_handler('\\stardevelop\\chatstack\\ErrorHandler::handler');
}

if (!isset($_SETTINGS['DATABASECHARSET']) || !isset($_SETTINGS['DATABASECOLLATION'])) {
	$_SETTINGS['DATABASECHARSET'] = 'utf8';
	$_SETTINGS['DATABASECOLLATION'] = 'utf8_unicode_ci';
}

ini_set('magic_quotes_sybase', 0);

if (get_magic_quotes_gpc()) {
	$_COOKIE = array_map('stripslashes', $_COOKIE);
	$_REQUEST = array_map('stripslashes', $_REQUEST);
}

if (!isset($_SERVER['HTTP_REFERER'])){ $_SERVER['HTTP_REFERER'] = ''; }
if (!isset($_REQUEST['COOKIE'])){ $_REQUEST['COOKIE'] = ''; }
if (!isset($_REQUEST['SERVER'])){ $_REQUEST['SERVER'] = ''; }

// Database Table Prefix
if (!defined('TABLEPREFIX') && isset($table_prefix)) {
	define('TABLEPREFIX', $table_prefix);
}

// Paris and Idiorm
require_once($dir . '/lib/idiorm.php');
require_once($dir . '/lib/paris.php');

// Settings Model
$settings = false;
require_once($dir . '/class.settings.php');

// Database Configuration
if (defined('DB_HOST') && defined('DB_NAME') && defined('DB_USER') && defined('DB_PASS')) {

	try {
		if (!defined('DB_SOCKET')) {
			ORM::configure('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . $_SETTINGS['DATABASECHARSET'], null, 'default');
		} else {
			ORM::configure('mysql:host=' . DB_HOST . ';unix_socket=' . DB_SOCKET . ';dbname=' . DB_NAME . ';charset=' . $_SETTINGS['DATABASECHARSET'], null, 'default');
		}
		ORM::configure('username', DB_USER, 'default');
		ORM::configure('password', DB_PASS, 'default');

		if (!isset($_SETTINGS['DATABASECHARSETOVERRIDE']) || (isset($_SETTINGS['DATABASECHARSETOVERRIDE']) && !$_SETTINGS['DATABASECHARSETOVERRIDE'])) {
			$query = sprintf('SET NAMES %s COLLATE %s', $_SETTINGS['DATABASECHARSET'], $_SETTINGS['DATABASECOLLATION']);
			ORM::raw_execute($query, array(), 'default');
		}

	} catch (\PDOException $ex) {
		return false;
	}

	// Settings
	$settings = Setting::find_many();

}

if (!is_array($_PLUGINS['WHMCS']) && isset($_PLUGINS['WHMCS'])) {
	$_PLUGINS['WHMCS'] = array();
}

// WHMCS Database Configuration
foreach ($_PLUGINS as $key => $plugin) {
	if (isset($plugin['DB_HOST']) && isset($plugin['DB_NAME']) && isset($plugin['DB_USER']) && isset($plugin['DB_PASS'])) {

		try {
			if (!isset($plugin['DB_SOCKET'])) {
				ORM::configure('mysql:host=' . $plugin['DB_HOST'] . ';dbname=' . $plugin['DB_NAME'] . ';charset=' . $_SETTINGS['DATABASECHARSET'], null, $plugin['CONNECTION']);
			} else {
				ORM::configure('mysql:host=' . $plugin['DB_HOST'] . ';unix_socket=' . $plugin['DB_SOCKET'] . ';dbname=' . $plugin['DB_NAME'] . ';charset=' . $_SETTINGS['DATABASECHARSET'], null, $plugin['CONNECTION']);
			}
			ORM::configure('username', $plugin['DB_USER'], $plugin['CONNECTION']);
			ORM::configure('password', $plugin['DB_PASS'], $plugin['CONNECTION']);

			if (!isset($_SETTINGS['DATABASECHARSETOVERRIDE']) || (isset($_SETTINGS['DATABASECHARSETOVERRIDE']) && !$_SETTINGS['DATABASECHARSETOVERRIDE'])) {
				$query = sprintf('SET NAMES %s COLLATE %s', $_SETTINGS['DATABASECHARSET'], $_SETTINGS['DATABASECOLLATION']);
				ORM::raw_execute($query, array(), $plugin['CONNECTION']);
			}

		} catch (\PDOException $ex) {
			return false;
		}

	} else {
		$_PLUGINS[$key]['CONNECTION'] = 'default';
	}
}

// Hooks
require_once $dir . '/class.hooks.php';

// Web Hook
if (!defined('WEBHOOK')) {
	if ($settings !== false) {
		// Initialize Settings
		Setting::initializeSettings($settings);
		return true;

	} else {
		// Settings Loaded Hook
		$hooks->run('SettingsLoaded', $_SETTINGS);
		return false;
	}
}

?>
