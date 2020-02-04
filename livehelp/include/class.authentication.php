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

class Authentication {

  static function IsAuthorized() {

  	global $_OPERATOR;
  	global $_PLUGINS;
  	global $_SETTINGS;
  	global $XML;
  	global $hooks;

  	$session = false;
  	$version = false;

  	$auth = false;
  	if (isset($_SERVER['HTTP_AUTHORIZATION']) && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
  		$auth = $_SERVER['HTTP_AUTHORIZATION'];
  	} else if (isset($_SERVER['HTTP_AUTHENTICATION']) && !empty($_SERVER['HTTP_AUTHENTICATION'])) {
  		$auth = htmlspecialchars_decode($_SERVER['HTTP_AUTHENTICATION']);
  	}

  	if ($auth !== false) {
  		if (!empty($auth) && substr($auth, 0, 5) === 'Token') {
  			if (preg_match('/Token signature="([^"]+)", version="(\d)"/', $auth, $regs)) {
  				$session = (isset($regs[1])) ? $regs[1] : false;
  				$version = (isset($regs[2])) ? (int)$regs[2] : false;
  			}
  		}
  	}

  	if ($session == false && isset($_REQUEST['Session'])) {
  		$session = $_REQUEST['Session'];
  	}

  	if ($version == false && isset($_REQUEST['Version'])) {
  		$version = $_REQUEST['Version'];
  	}

    if (!defined('AUTHVERSION')) {
  	   define('AUTHVERSION', $version);
    }

  	$username = false;
  	$password = false;
  	$email = false;

  	if (isset($_REQUEST['Username']) && isset($_REQUEST['Password']) && !empty($_REQUEST['Username']) && !empty($_REQUEST['Password'])) {
  		$session = false;
  		$username = $_REQUEST['Username'];
  		$password = $_REQUEST['Password'];
  	}

  	// Encrypted Operator Session
  	if (!empty($session)) {

  		$hooks->run('AuthorizationKey', array('session' => $session));

  		$data = base64_decode($session);
  		$aes = new AES256($_SETTINGS['AUTHKEY']); // TODO Setup Seperate Operator Key

  		$size = strlen($aes->iv);
  		$iv = substr($data, 0, $size);
  		$verify = substr($data, $size, 40);
  		$ciphertext = substr($data, 40 + $size);

  		$decrypted = $aes->decrypt($ciphertext, $iv);

  		if (sha1($decrypted) == $verify) {
  			$data = json_decode($decrypted, true);

  			$id = (int)$data['id'];
  			$username = (isset($data['username'])) ? $data['username'] : false;
  			$password = (isset($data['password'])) ? $data['password'] : false;
  			$email = (isset($data['email'])) ? $data['email'] : false;
  		}
  	}

  	// Pre Auth Hook
  	$hooks->run('PreAuthorization', array('username' => $username, 'email' => $email));

  	// Database Constants
  	if (!defined('DB_HOST') || !defined('DB_NAME') || !defined('DB_USER') || !defined('DB_PASS')) {
  		return false;
  	}

  	if (!empty($version) && $version > 3.9) {

  		if ($email !== false) {
  			$operator = Operator::where('email', $email)->find_one();
  			if ($operator !== false) {

  				$_OPERATOR['ID'] = $operator->id;
  				$_OPERATOR['DATETIME'] = $operator->datetime;
  				$_OPERATOR['PRIVILEGE'] = $operator->privilege;
  				$_OPERATOR['STATUS'] = $operator->status;
  				$_OPERATOR['USERNAME'] = $operator->username;
  				$_OPERATOR['PASSWORD'] = $operator->password;
  				$_OPERATOR['NAME'] = (!empty($operator->lastname)) ? $operator->firstname . ' ' . $operator->lastname : $operator->firstname;
  				$_OPERATOR['DEPARTMENT'] = $operator->department;
  				return true;

  			} else {
  				return false;
  			}
  		} else {
  			$operator = Operator::where('username', $username)->find_one();
  			if ($operator === false) {
  				$operator = Operator::where('email', $username)->find_one();
  			}
  		}

  	} else {

  		$operator = Operator::where('disabled', 0)
  			->where('username', $username)
  			->find_one();
  	}

  	if ($operator !== false) {

      $check = false;
      $legacy = '';
      $hasher = new PasswordHash(8, true);

      if (substr($operator->password, 0, 3) === '$P$') {
        // v4.0 Password
    		$check = $hasher->CheckPassword($password, $operator->password);
      } else {
        // Legacy Hashes
  			switch (strlen($operator->password)) {
  				case 40: // SHA1
  					$legacy = sha1($password);
  					break;
  				case 128: // SHA512
  					if (function_exists('hash')) {
  						if (in_array('sha512', hash_algos())) {
  							$legacy = hash('sha512', $password);
  						} else if (in_array('sha1', hash_algos())) {
  							$legacy = hash('sha1', $password);
  						}
  					} else if (function_exists('mhash') && mhash_get_hash_name(MHASH_SHA512) != false) {
  						$legacy = bin2hex(mhash(MHASH_SHA512, $password));
  					}
  					break;
  				default: // MD5
  					$legacy = md5($password);
  					break;
  			}
  		}

  		// Process Legacy Password
  		$password = $hooks->run('LoginCustomHash', array('Password' => $password, 'Version' => $version));

  		if ((!empty($version) && $version >= 4.0 && ($check || $operator->password == $legacy)) || $operator->password == $password) {

  			// Upgrade Password Authentication
  			if (!empty($version) && $version >= 4.0) {
  				if (substr($operator->password, 0, 3) != '$P$') {
  					$hash = $hasher->HashPassword($_REQUEST['Password']);
  					if (strlen($hash) >= 20) {
  						// Update Password Hash
  						$operator->password = $hash;
  						$operator->save();
  					}
  				}
  			}

  			$_OPERATOR['DISABLED'] = $operator->disabled;
  			if ($_OPERATOR['DISABLED']) {
  				header('X-Disabled: *');
  				return false;
  			} else {

  				$_OPERATOR['ID'] = $operator->id;
  				$_OPERATOR['DATETIME'] = $operator->datetime;
  				$_OPERATOR['PRIVILEGE'] = $operator->privilege;
  				$_OPERATOR['STATUS'] = $operator->status;
  				$_OPERATOR['USERNAME'] = $operator->username;
  				$_OPERATOR['PASSWORD'] = $operator->password;
  				$_OPERATOR['NAME'] = (!empty($operator->lastname)) ? $operator->firstname . ' ' . $operator->lastname : $operator->firstname;
  				$_OPERATOR['DEPARTMENT'] = $operator->department;

  				$_OPERATOR = $hooks->run('LoginCompleted', $_OPERATOR);
  				return true;

  			}

  		} else {

  			$_OPERATOR['ID'] = $operator->id;
  			$_OPERATOR['USERNAME'] = $operator->username;
  			$_OPERATOR['DATETIME'] = $operator->datetime;
  			$_OPERATOR['PRIVILEGE'] = $operator->privilege;
  			$_OPERATOR['STATUS'] = $operator->status;

  			$_OPERATOR = $hooks->run('LoginFailed', array('Operator' => $_OPERATOR, 'Password' => $password));

  			if (isset($_OPERATOR['PASSWORD'])) {
  				return true;
  			}

  			$_OPERATOR['DISABLED'] = $operator->disabled;
  			if ($_OPERATOR['DISABLED']) {
  				header('X-Disabled: *');
  				return false;
  			}
  		}
  	} else {

  		// Account Missing
  		$_OPERATOR = $hooks->run('LoginAccountMissing', array('Username' => $username, 'Password' => $password));
  		if ($_OPERATOR != false && count($_OPERATOR) > 2) {
  			return true;
  		} else {
  			return false;
  		}

  	}

  	//  Supports v4.0 Authentication
  	$version = '4.0';
  	header('X-Authentication: ' . $version);

  	return false;
  }

}

?>
