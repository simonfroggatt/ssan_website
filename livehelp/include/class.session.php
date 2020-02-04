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

class Session {

	public $id = false;
	public $chat = false;
	public $request = false;
	public $hash = false;
	public $session = false;
	public $visitor = false;
	public $db = true;

	private $key = false;

	public function __construct($session, $key) {

		// Key
		$this->key = $key;
		$this->session = $session;

		// Decrypt Session
		if (isset($this->session) && !empty($this->session)) {
			$data = rawurldecode($this->session);

			$aes = new AES256($this->key);

			$size = strlen($aes->iv);
			$iv = substr($data, 0, $size);
			$verify = substr($data, $size, 40);
			$ciphertext = substr($data, 40 + $size);

			$decrypted = $aes->decrypt($ciphertext, $iv);

			if ($decrypted !== false && sha1($decrypted) == $verify) {
				$data = json_decode($decrypted, true);

				if (!empty($data['id'])) {
					$this->id = $data['id'];
				}

				if (isset($data['visitor'])) {
					$this->request = $data['visitor'];
				}

				if (isset($data['hash'])) {
					$this->hash = $data['hash'];
				}

				if (isset($data['chat'])) {
					$this->chat = $data['chat'];
				}
			} else {
				header('HTTP/1.1 403 Access Forbidden');
				header('Content-Type: text/plain');
				exit();
			}
		}

	}

	public function encrypt($data) {
		$data = json_encode($data);
		$verify = sha1($data);

		$aes = new AES256($this->key);
		$encrypted = $aes->iv . $verify . $aes->encrypt($data);
		return $encrypted;
	}

}

?>
