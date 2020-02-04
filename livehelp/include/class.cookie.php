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

class Cookie {

	public static function encode($vars) {
		global $_SETTINGS;
		$vars = array_change_key_case($vars, CASE_LOWER);
		$json = json_encode($vars);

		$verify = sha1($json);
		$aes = new AES256($_SETTINGS['AUTHKEY']);
		$cookie = $aes->iv . $verify . $aes->encrypt($json);

		return $cookie;
	}

	public static function decode($data) {
		global $_SETTINGS;

		$aes = new AES256($_SETTINGS['AUTHKEY']);

		$size = strlen($aes->iv);
		$iv = substr($data, 0, $size);
		$verify = substr($data, $size, 40);
		$ciphertext = substr($data, 40 + $size);

		$decrypted = $aes->decrypt($ciphertext, $iv);

		if (sha1($decrypted) == $verify) {
			$data = json_decode($decrypted, true);
			$data = array_change_key_case($data, CASE_UPPER);
		}

		return $data;
	}

}

?>
