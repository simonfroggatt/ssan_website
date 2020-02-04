<?php

/*  WHMCS Configuration
$params = $_REQUEST;
ob_start();
if (!defined('WHMCS_ROOTDIR')) {
	$whmcsRootDir = realpath(dirname(__FILE__) . '/../../../');
	define('WHMCS_ROOTDIR', $whmcsRootDir);
	if (isset($templates_compiledir)) {
		$templates_compiledir2 = $templates_compiledir;
	}
	require WHMCS_ROOTDIR . '/configuration.php';
	if (isset($templates_compiledir2)) {
		$templates_compiledir = $templates_compiledir2;
	}

	// Time zone
	date_default_timezone_set('UTC');

	define('DB_HOST', $db_host);
	define('DB_NAME', $db_name);
	define('DB_USER', $db_username);
	define('DB_PASS', $db_password);

	// Enable Plugins
	$_PLUGINS = array();
	$_PLUGINS['WHMCS'] = array();

	define('WHMCSLIVECHAT', true);

	include_once WHMCS_ROOTDIR . '/init.php';

	define('CHATSTACK', true);

	$table_prefix =  'modlivehelp_';

}
ob_end_clean();
$_REQUEST = $params;
return true;

*/

/*  Squirrel Cart Configuration
require(dirname(__FILE__) . '/../../squirrelcart/config.php');

define('DB_HOST', $sql_host);
define('DB_PORT', 3306);
define('DB_NAME', $db);
define('DB_USER', $sql_username);
define('DB_PASS', $sql_password);

date_default_timezone_set('UTC');

define('CHATSTACK', true);
$table_prefix =  'livehelp_';

// Enable Plugins
$_PLUGINS = array();
$_PLUGINS['SQUIRRELCART'] = true;

return true;

*/

/*  Standard Configuration

define('DB_HOST', '');
define('DB_PORT', 3306);
define('DB_NAME', '');
define('DB_USER', '');
define('DB_PASS', '');
define('DB_SOCKET', '');

date_default_timezone_set('UTC');

define('CHATSTACK', true);
$table_prefix =  'livehelp_';


// Override Settings
//$_SETTINGS = array();
//$_SETTINGS['AUTOEMAILTRANSCRIPT'] = 'user@example.com';
//$_SETTINGS['FORCESSL'] = true;
//$_SETTINGS['CDN'] = '';

// Recommended SMTP Providers
// mandrill.com or mailgun.com
//$_SETTINGS['SMTPHOST'] = '';
//$_SETTINGS['SMTPPORT'] = 587;
//$_SETTINGS['SMTPUSERNAME'] = '';
//$_SETTINGS['SMTPPASSWORD'] = '';
//$_SETTINGS['SMTPSECURE'] = 'tls';

return true;

*/

?>
