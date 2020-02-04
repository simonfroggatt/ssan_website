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

require_once(dirname(__FILE__) . '/../class.totp.php');

class TOTP extends Model {
	public static $_table = 'totp';
	public static $_id_column = 'user';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';
}
TOTP::$_table = TABLEPREFIX . 'totp';

class ExpiredTOTP extends Model {
	public static $_table = 'expiredtotp';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';
}
ExpiredTOTP::$_table = TABLEPREFIX . 'expiredtotp';

/*
 * Hook class name must end with Hooks
 * i.e. ExampleHooks or TestHooks
 *
 */
class TOTPHooks {

	function __construct() {
		// Init Hook
	}

	function ValidateTOTP($id, $code, $secret = false) {
		// Check TOTP Token Expired
		$id = (int)$id;
		$hash = sha1((int)$id . $code, true);
		$expired = ExpiredTOTP::where_id_is($hash)
			->find_one();

		if ($expired !== false) {
			// Forbidden - TOTP Token Already Used
			if (strpos(php_sapi_name(), 'cgi') === false) { header('HTTP/1.0 403 Forbidden'); } else { header('Status: 403 Forbidden'); }
			exit();
		} else {

			if ($secret == false) {
				$totp = TOTP::where('user', $id)
					->find_one();

				if ($totp !== false) {
					$secret = $totp->secret;
				}
			}

			$validated = false;
			if (is_string($secret) && strlen($secret) === 16) {
				$totp = new \TOTP\Auth($secret);
				$validated = $totp->validateCode($code);
			}

			// Used TOTP Code
			if ($validated !== false) {
				$expired = ExpiredTOTP::create();
				$expired->id = $hash;
				$expired->datetime = date('Y-m-d H:i:s', time());
				$expired->save();
			}

			// Remove Old TOTP Codes
			$expired = ExpiredTOTP::where_lt('datetime', date('Y-m-d H:i:s', time() - 300))
				->delete_many();

			return $validated;

		}
	}

	function EditAccount($args) {

		// Arguments
		$id = (!empty($args['id'])) ? $args['id'] : false;
		$data = (!empty($args['data'])) ? $args['data'] : false;

		if ($data !== false) {
			$data = json_decode($data, true);
			$secret = $data['secret'];
			$code = $data['code'];

			$validated = false;
			if (is_string($secret) && strlen($secret) == 16 && is_string($code) && strlen($code) == 6) {
				// Validate New Code / Secret
				$validated = $this->ValidateTOTP($id, $code, $secret);
				if ($validated == true) {

					$totp = TOTP::where('user', $id)
						->find_one();

					if ($totp !== false) {
						// Forbidden - TOTP Already Setup
						if (strpos(php_sapi_name(), 'cgi') === false) { header('HTTP/1.0 403 Forbidden'); } else { header('Status: 403 Forbidden'); }
						exit();
					} else {

						// Generate Backup Code
						$letters = 'abcdefghijklmnopqrstuwxyz';
						$backup = array();
						$length = strlen($letters) - 1;
						for ($i = 1; $i <= 20; $i++) {
							$n = rand(0, $length);
							$backup[] = $letters[$n];
							if ($i % 4 == 0) {
								$backup[] = '-';
							}
						}
						array_pop($backup);
						$backup = implode($backup);

						$hasher = new PasswordHash(8, true);
						$hash = $hasher->HashPassword($backup);

						// Insert TOTP Secret
						$totp = TOTP::create();
						$totp->user = $id;
						$totp->secret = $secret;
						$totp->backup = $hash;
						$totp->save();

						// JSON Response
						header('Content-type: application/json; charset=utf-8');
						$json = array('id' => (int)$id, 'success' => true, 'backup' => $backup);
						echo json_encode($json);
						exit;
					}

				} else {
					// Forbidden - TOTP Validation Failed
					if (strpos(php_sapi_name(), 'cgi') === false) { header('HTTP/1.0 403 Forbidden'); } else { header('Status: 403 Forbidden'); }
					exit();
				}

			} else if (empty($secret) && is_string($code) && strlen($code) == 6) {
				// Disable Current Valid
				$validated = $this->ValidateTOTP($id, $code);

				if ($validated) {
					$totp = TOTP::where('user', $id)
						->find_one();

					if ($totp !== false) {
						$totp->delete();
					}

					// JSON Response
					header('Content-type: application/json; charset=utf-8');
					$json = array('id' => (int)$id, 'success' => true);
					echo json_encode($json);
					exit;

				} else {
					// Forbidden - TOTP Validation Failed
					if (strpos(php_sapi_name(), 'cgi') === false) { header('HTTP/1.0 403 Forbidden'); } else { header('Status: 403 Forbidden'); }
					exit();
				}
			} else {
					// Forbidden - Invalid TOTP Code
					if (strpos(php_sapi_name(), 'cgi') === false) { header('HTTP/1.0 403 Forbidden'); } else { header('Status: 403 Forbidden'); }
					exit();
			}

		}

	}

	function AccountLoaded($account) {

		// Check TOTP Secret Exists
		$totp = TOTP::where('user', $account->id)->find_one();

		if ($totp !== false) {
			$account->twofactor = true;
		} else {
			$account->twofactor = false;
		}

		return $account;

	}

	function LoginSession($args) {

		// Arguments
		$id = (!empty($args['id'])) ? $args['id'] : false;
		$data = (!empty($args['data'])) ? $args['data'] : false;

		$totp = TOTP::where('user', (int)$id)
			->find_one();

		if ($totp !== false) {
			if ($data !== false) {
				$json = json_decode($data, true);
				$code = $json['code'];
				$backup = $json['backupcode'];

				// Backup Code
				if (!empty($backup) && strlen($backup) == 24) {

					// Validate Backup Code
					$hasher = new PasswordHash(8, true);
					$check = $hasher->CheckPassword($backup, $totp->backup);
					if ($check) {
						$totp->delete();
						return array('Token' => true, 'OTP' => true);
					} else {
						// Forbidden - Invalid Backup Code
						return array('Token' => false, 'OTP' => false);
					}

				}

				$validated = false;
				if (!empty($code) && strlen($code) == 6) {
					$validated = $this->ValidateTOTP($id, $code, $totp->secret);
				}

				if ($validated !== false) {
					// Token Accepted
					return array('Token' => true, 'OTP' => true);
				} else {
					// Forbidden - TOTP Validation Failed
					if (strpos(php_sapi_name(), 'cgi') === false) { header('HTTP/1.0 403 Forbidden'); } else { header('Status: 403 Forbidden'); }
					exit();
				}
			} else {
				return array('Token' => false, 'OTP' => true);
			}

		} else {
			return array('Token' => true, 'OTP' => true);
		}
	}

}

// Add Hook Functions
// $hooks->add('ExampleHooks', 'EventName', 'FunctionName');
$class = 'TOTPHooks';

$hooks->add($class, 'EditAccount', 'EditAccount');
$hooks->add($class, 'AccountLoaded', 'AccountLoaded');
$hooks->add($class, 'LoginSession', 'LoginSession');

?>
