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

require_once('../include/core.functions.php');

if (get_magic_quotes_runtime() && !ini_get('safe_mode')) {
	ini_set('magic_quotes_runtime', 0);
}

$protocol = ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == '443') ? 'https://' : $protocol = 'http://';
$directory = substr($_SERVER['SCRIPT_NAME'], 0, strpos($_SERVER['SCRIPT_NAME'], '/livehelp/'));
$address = (isset($_SERVER['HTTP_HOST'])) ? $protocol . $_SERVER['HTTP_HOST'] . $directory : $protocol . $_SERVER['SERVER_NAME'] . $directory;

error_reporting(E_ERROR | E_PARSE);
set_time_limit(0);

// Detect WHMCS Installation
$plugin = '';
if (file_exists('../../../configuration.php')) {

	// WHMCS Database Configuration
	include('../../../configuration.php');
	if (isset($db_host) && isset($db_name) && isset($db_username) && isset($db_password)) {
		$plugin = 'WHMCS';
	}
}

if (!isset($_REQUEST['DATABASEHOSTNAME'])){ $_REQUEST['DATABASEHOSTNAME'] = ''; }
if (!isset($_REQUEST['DATABASENAME'])){ $_REQUEST['DATABASENAME'] = ''; }
if (!isset($_REQUEST['DATABASEUSERNAME'])){ $_REQUEST['DATABASEUSERNAME'] = ''; }
if (!isset($_REQUEST['DATABASEPASSWORD'])){ $_REQUEST['DATABASEPASSWORD'] = ''; }
if (!isset($_REQUEST['DATABASEPREFIX'])){ $_REQUEST['DATABASEPREFIX'] = ''; }
if (!isset($_REQUEST['OFFLINEEMAIL'])){ $_REQUEST['OFFLINEEMAIL'] = ''; }
if (!isset($_REQUEST['USERNAME'])){ $_REQUEST['USERNAME'] = ''; }
if (!isset($_REQUEST['FIRSTNAME'])){ $_REQUEST['FIRSTNAME'] = ''; }
if (!isset($_REQUEST['LASTNAME'])){ $_REQUEST['LASTNAME'] = ''; }
if (!isset($_REQUEST['EMAIL'])){ $_REQUEST['EMAIL'] = ''; }
if (!isset($_REQUEST['PASSWORD'])){ $_REQUEST['PASSWORD'] = ''; }
if (!isset($_REQUEST['PASSWORDCONFIRM'])){ $_REQUEST['PASSWORDCONFIRM'] = ''; }

if (!get_magic_quotes_gpc()) {
	foreach ($_REQUEST as $key => $value) {
		$_REQUEST[$key] = addslashes($value);
	}
}

if (!empty($plugin) || (!empty($_REQUEST['DATABASEHOSTNAME']) && !empty($_REQUEST['DATABASENAME']) && !empty($_REQUEST['DATABASEUSERNAME']) && !empty($_REQUEST['DATABASEPASSWORD']) && !empty($_REQUEST['OFFLINEEMAIL']) && !empty($_REQUEST['USERNAME']) && !empty($_REQUEST['FIRSTNAME']) && !empty($_REQUEST['LASTNAME']) && !empty($_REQUEST['EMAIL']) && !empty($_REQUEST['PASSWORD']) && !empty($_REQUEST['PASSWORDCONFIRM']) && $_REQUEST['PASSWORD'] == $_REQUEST['PASSWORDCONFIRM'])) {

	$offlineemail = $_REQUEST['OFFLINEEMAIL'];
	$username = $_REQUEST['USERNAME'];
	$firstname = $_REQUEST['FIRSTNAME'];
	$lastname = $_REQUEST['LASTNAME'];
	$email = $_REQUEST['EMAIL'];
	$password = $_REQUEST['PASSWORD'];

	if (empty($plugin)) {

		$host = $_REQUEST['DATABASEHOSTNAME'];
		define('DB_NAME', $_REQUEST['DATABASENAME']);
		define('DB_USER', $_REQUEST['DATABASEUSERNAME']);
		define('DB_PASS', $_REQUEST['DATABASEPASSWORD']);

		$prefix = $_REQUEST['DATABASEPREFIX'];

	} else {

		// WHMCS Module Installation
		$host = $db_host;
		define('DB_NAME', $db_name);
		define('DB_USER', $db_username);
		define('DB_PASS', $db_password);

		$prefix = 'modlivehelp_';
	}

	define('TABLEPREFIX', $prefix);

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

	define('DB_HOST', $host);
	define('DB_PORT', $port);

	// Paris / Idiorm
	include('../include/lib/idiorm.php');
	include('../include/lib/paris.php');

	// Open MySQL Connection
	$connected = true;
	try {

		$connection = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8', DB_HOST, DB_PORT, DB_NAME);
		$db = new PDO($connection, DB_USER, DB_PASS);

		ORM::set_db($db);

	} catch (\PDOException $ex) {
		$error = $ex->getMessage();
		$connected = false;
	}

	// Models
	require_once('../include/class.models.php');
	include('../include/class.settings.php');

	if ($connected) {

		// Installation Requirements - MySQL Version
		$version = '';
		$query = $db->prepare('SELECT VERSION()');
		$query->execute();
		$version = $query->fetch();
		if (is_array($version)) {
			$version = $version['VERSION()'];
			if (!empty($version)) {
				// Check MySQL Minimum Requirement
				$minimum_mysql_version = '4.0.18';
				$mysql_version = (strpos($version, '-')) ? substr($version, 0, strpos($version, '-')) : $version;
				if (strnatcmp($mysql_version, $minimum_mysql_version) < 0) {
					$error = 'Please update your MySQL server to the latest MySQL.  Live Help requires MySQL ' . $minimum_mysql_version;
				}
			}
		}

		if (empty($error)) {

			// WHMCS Department Email
			if ($plugin == 'WHMCS') {

				$_PLUGINS['WHMCS'] = array();
				$_PLUGINS['WHMCS']['CONNECTION'] = 'default';

				include('../plugins/whmcs/class.models.php');

				// Department Email
				$ticketdepartment = Plugins\WHMCS\TicketDepartment::where('clientsonly', '')
					->where('piperepliesonly', '')
					->where('hidden', '')
					->order_by_asc('order')
					->find_one();

				if ($ticketdepartment !== false) {
					$email = $ticketdepartment->email;
					$offlineemail = $ticketdepartment->email;
				} else {
					// System Email
					$setting = Plugins\WHMCS\Setting::where('setting', 'Email')
						->find_one();

					if ($setting !== false) {
						$email = $setting->value;
						$offlineemail = $setting->value;
					}
				}
			}

			$schema = file('mysql.schema.txt');
			$dump = '';
			foreach ($schema as $key => $line) {
				if (trim($line) != '' && substr(trim($line), 0, 1) != '#') {
					$line = str_replace('prefix_', $prefix, $line);
					$dump .= trim($line);
				}
			}

			$dump = trim($dump, ';');
			$tables = explode(';', $dump);

			foreach ($tables as $key => $sql) {
				$result = ORM::raw_execute($sql);
				if ($result == false) {
					$statement = ORM::get_last_statement();
					$errorinfo = $statement->errorInfo();
					if (!empty($errorinfo) && is_array($errorinfo)) {
						$error = 'Unable to create the MySQL database schema ( MySQL Error: [' . $errorinfo[0] . '] ' . $errorinfo[2] . ' ).  Please contact technical support.';
					} else {
						$error = 'Unable to create the MySQL database schema.  Please contact technical support.';
					}
					break;
				}
			}
			unset($dump);
			unset($tables);

			if (empty($error)) {

				// Truncate settings
				$query = 'TRUNCATE ' . $prefix . 'settings';
				ORM::raw_execute($query);

				// Remove .www. if at the start of string
				$domain = $_SERVER['SERVER_NAME'];
				if (substr($domain, 0, 4) == 'www.') {
					$domain = substr($domain, 4);
				}

				// Insert / Update Settings
				$settings = file_get_contents('mysql.data.settings.txt');
				$settings = json_decode($settings, true);
				foreach ($settings as $key => $value) {

					// Update Settings
					if ($value['name'] == 'Email') {
						$value['value'] = $offlineemail;
					} else if ($value['name'] == 'Domain') {
						$value['value'] = $domain;
					} else if ($value['name'] == 'URL') {
						$value['value'] = $address;
					} else if ($value['name'] == 'OnlineLogo') {
						$value['value'] = $address . '/livehelp/locale/en/images/Online.png';
					} else if ($value['name'] == 'OfflineLogo') {
						$value['value'] = $address . '/livehelp/locale/en/images/Offline.png';
					} else if ($value['name'] == 'BeRightBackLogo') {
						$value['value'] = $address . '/livehelp/locale/en/images/BeRightBack.png';
					} else if ($value['name'] == 'AwayLogo') {
						$value['value'] = $address . '/livehelp/locale/en/images/Away.png';
					} else if ($value['name'] == 'AuthKey') {

						$key = '';
						$chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~!@#$%^&*()-_=+[{]}\|:\'",<.>/?';
						for ($index = 0; $index < 255; $index++) {
							$number = rand(1, strlen($chars));
							$key .= substr($chars, $number - 1, 1);
						}

						$value['value'] = $key;
					} else if ($value['name'] == 'LastUpdated') {
						$value['value'] = date('Y-m-d H:i:s', time());
					}

					// Insert Setting
					ORM::configure('logging', true);
					$setting = Setting::create();
					$setting->name = $value['name'];
					$setting->value = $value['value'];
					$result = $setting->save();

					if ($result == false) {
						$error = 'Unable to insert the Live Help settings.  Please contact technical support.';
						break;
					}

				}
				unset($settings);

				if (empty($error)) {

					// Countries / Telephone Codes
					$countries = file_get_contents('mysql.data.countries.txt');
					$countries = json_decode($countries, true);
					foreach ($countries as $key => $value) {

						// Insert Country
						$country = Country::create();
						$country->code = $value['code'];
						$country->country = $value['country'];
						$country->dial = $value['dial'];
						$result = $country->save();

						if ($result == false) {
							$error = 'Unable to insert the Live Help country data.  Please contact technical support.';
							break;
						}
					}
					unset($countries);

					if (empty($error)) {

						// Operator Password
						$algo = 'sha512';
						if (function_exists('hash') && in_array($algo, hash_algos())) {
							$password = hash($algo, $password);
						} else if (function_exists('mhash') && mhash_get_hash_name(MHASH_SHA512) != false) {
							$password = bin2hex(mhash(MHASH_SHA512, $password));
						} else {
							$password = sha1($password);
						}

						// Insert Operator Account
						if (!empty($username)) {
							$user = Operator::create();
							$user->username = $username;
							$user->password = $password;
							$user->firstname = $firstname;
							$user->lastname = $lastname;
							$user->email = $email;
							$user->department = 'Sales / Technical Support';
							$user->image = '';
							$user->datetime = date('Y-m-d H:i:s', time());
							$user->updated = date('Y-m-d H:i:s', time());
							$user->privilege = -1;
							$user->status = -1;
							$result = $user->save();

							if ($result == false) {
								$error = 'Unable to create Live Help operator account, username may already exist.';
							}
						}

						if (empty($error)) {

							// Save Database Configuration
							$writable = true;
							$configuration = '../include/database.php';
							if (empty($error)) {
								if (file_exists($configuration)) {
									if (is_writable($configuration)) {

										// WHMCS Configuration
										if (empty($plugin)) {

											$content = "<?php\n";
											$content .= "\n";
											$content .= 'define(\'DB_HOST\', \'' . DB_HOST . '\');' . "\n";
											$content .= 'define(\'DB_PORT\', ' . DB_PORT . ');' . "\n";
											$content .= 'define(\'DB_NAME\', \'' . DB_NAME . '\');' . "\n";
											$content .= 'define(\'DB_USER\', \'' . DB_USER . '\');' . "\n";
											$content .= 'define(\'DB_PASS\', \'' . DB_PASS . '\');' . "\n";
											$content .= "\n";
											$content .= 'date_default_timezone_set(\'UTC\');' . "\n";
											$content .= "\n";
											$content .= 'define(\'CHATSTACK\', true);' . "\n";
											$content .= '$table_prefix = \'' . $prefix . '\';' . "\n";
											$content .= "\n";
											$content .= 'return true;' . "\n";
											$content .= "\n";
											$content .= "?>";

										} else {

											$content = <<<EOT
<?php
\$params = \$_REQUEST;

ob_start();
if (!defined('WHMCS_ROOTDIR')) {
	\$whmcsRootDir = realpath(dirname(__FILE__) . '/../../../');
	define('WHMCS_ROOTDIR', \$whmcsRootDir);
	if (isset(\$templates_compiledir)) {
		\$templates_compiledir2 = \$templates_compiledir;
	}
	require WHMCS_ROOTDIR . '/configuration.php';
	if (isset(\$templates_compiledir2)) {
		\$templates_compiledir = \$templates_compiledir2;
	}

	// Time zone
	date_default_timezone_set('UTC');

	// Database Constants
	define('DB_HOST', \$db_host);
	define('DB_NAME', \$db_name);
	define('DB_USER', \$db_username);
	define('DB_PASS', \$db_password);

	// Enable Plugins
	\$_PLUGINS = array();
	\$_PLUGINS['WHMCS'] = array();

	define('WHMCSLIVECHAT', true);

	include_once WHMCS_ROOTDIR . '/init.php';

	define('CHATSTACK', true);

	\$table_prefix =  'modlivehelp_';

}
ob_end_clean();

\$_REQUEST = \$params;

return true;

EOT;

										}

										if (!$handle = fopen($configuration, 'w')) {
											$writable = false;
										} else {
											if (!fwrite($handle, $content)) {
												$writable = false;
											} else {
												$writable = true;
												fclose($handle);
											}
										}
									} else {
										$writable = false;
									}
								} else {
									$writable = false;
								}
							}
						}
					}
				}
			}
		}
	} else {
		// Unexpected Error
		$error = 'MySQL Connection Error. ' . $error . '  Please contact technical support.';
	}

}


$json = array();
$json['result'] = (empty($error) && isset($writable) && $writable) ? true : false;
if (!empty($error)) {
	$json['error'] = $error;
}

// Plugin
if (!empty($plugin)) {
	$json['plugin'] = $plugin;
}

// Output JSON
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
