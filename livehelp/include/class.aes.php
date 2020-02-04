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

if (!extension_loaded('mcrypt')) {
	// Require Legacy phpAES
	require_once __DIR__ . '/class.aes.legacy.php';
}

class AES256 {

	var $secret = '';
	var $iv = '';
	var $key = '';
	var $mode = '';
	var $mcrypt = false;
	var $openssl = false;
	var $options = false;
	var $size = 16;

	function __construct($secret = '', $iv = '') {
		if (!empty($secret)) {
			$this->secret = $secret;
		}
		$this->key = substr(sha1($this->secret), 0, 32);

		// AES Encryption Mode
		if (extension_loaded('openssl')) {
			$mode = 'aes-128-cbc';
			$ciphers = openssl_get_cipher_methods();
			if (in_array('aes-256-cbc', $ciphers)) {
				$mode = 'aes-256-cbc';
			}
			$this->mode = $mode;
			$this->openssl = true;
			$this->options = defined('OPENSSL_RAW_DATA') ? OPENSSL_RAW_DATA : 1;
			$this->size = openssl_cipher_iv_length($this->mode);
		} else if (extension_loaded('mcrypt')) {
			$this->mode = MCRYPT_MODE_CBC;
			$this->mcrypt = true;
		} else {
			$this->mode = 'CBC';
		}

		// Update Initialization Vector
		$iv = '';
		if (function_exists('openssl_random_pseudo_bytes')) {
			// Slow Windows PHP < 5.3.4
			$bytes = openssl_random_pseudo_bytes($this->size / 2);
			$iv = bin2hex($bytes);
		} else {
			$chars = '0123456789abcdefghijklmnopqrstuvwxyz';
			for ($index = 0; $index < $this->size; $index++) {
				$number = rand(1, strlen($chars));
				$iv .= substr($chars, $number - 1, 1);
			}
		}

		if (!empty($iv) && (strlen($iv) == $this->size)) {
			$this->iv = $iv;
		}
	}

	function encrypt($plaintext, $iv = '') {
		$ciphertext = '';

		// Initialization Vector Size
		if (extension_loaded('openssl')) {
			$this->size = openssl_cipher_iv_length($this->mode);
		}

		if (!empty($iv) && (strlen($iv) == $this->size)) {
			$this->iv = $iv;
		}

		// Encrypt
		if ($this->openssl) {
			// OpenSSL
			$ciphertext = openssl_encrypt($plaintext, $this->mode, $this->key, $this->options, $this->iv);
		} else if ($this->mcrypt) {
			// AES Compliant
			$td = mcrypt_module_open(MCRYPT_RIJNDAEL_128, '', $this->mode, '');
			mcrypt_generic_init($td, $this->key, $this->iv);
			$ciphertext = mcrypt_generic($td, $plaintext);
			mcrypt_generic_deinit($td);
			mcrypt_module_close($td);
		} else {
			$aes = new AES($this->key, $this->mode, $this->iv);
			$ciphertext = $aes->encrypt($plaintext);
		}
		return trim(base64_encode($ciphertext));
	}

	function decrypt($ciphertext, $iv = '') {
		$plaintext = '';

		// Initialization Vector Size
		if (extension_loaded('openssl')) {
			$this->size = openssl_cipher_iv_length($this->mode);
		}

		// Update Initialization Vector
		if (!empty($iv) && (strlen($iv) == $this->size)) {
			$this->iv = $iv;
		}

		// Decrypt
		$ciphertext = base64_decode($ciphertext);
		if (!empty($ciphertext)) {
			if ($this->openssl) {
				// OpenSSL
				$plaintext = openssl_decrypt($ciphertext, $this->mode, $this->key, $this->options, $this->iv);
			} else if ($this->mcrypt) {
				// AES Compliant
				$td = mcrypt_module_open(MCRYPT_RIJNDAEL_128, '', $this->mode, '');
				mcrypt_generic_init($td, $this->key, $this->iv);
				$plaintext = mdecrypt_generic($td, $ciphertext);
				mcrypt_generic_deinit($td);
				mcrypt_module_close($td);
			} else {
				$aes = new AES($this->key, $this->mode, $this->iv);
				$plaintext = $aes->decrypt($ciphertext);
			}
			return trim($plaintext);
		} else {
			return false;
		}

	}
}

?>
