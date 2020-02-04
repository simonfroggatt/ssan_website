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

class PUSH {

	// iPhone / Android PUSH HTTP / HTTPS API Key
	var $key = '20237df3ede04c4daa6657723cd6e62e473c26a0f793ac77ed17f1c14338d2fac9f1ccd8431b6152cad2647c1c04a25b4e7f0ee305c586cfad24aedea8ab34ac';

	// Notification
	var $title = '';
	var $alert = '';
	var $sound = '';
	var $badge = '';
	var $chat = '';
	var $message = '';
	var $action = '';
	var $custom = '';
	var $customid = '';
	var $category = '';

	function OnlineDevices() {

		global $_SETTINGS;

		// Online Operators
		$operators = Operator::where('status', 1)->find_many();

		$devices = array();
		if ($operators !== false) {
			foreach ($operators as $key => $operator) {
				if ($operator->status() == 1) {
					if ((float)$_SETTINGS['SERVERVERSION'] >= 4.1) {
						$unique = array();
						foreach ($operator->devices()->order_by_desc('datetime')->find_many() as $key => $device) {
							if (!in_array($device->unique, $unique)) {
								$unique[] = $device->unique;
								if (!empty($device->device)) {
									$devices[] = $device->token;
								}
							}
						}
					} else { // iPhone PUSH Supported
						if (!empty($operator->device)) {
							$devices[] = $operator->device;
						}
					}
				}
			}
		}

		return $devices;
	}

	function AllDevices() {

		global $_SETTINGS;

		// All Operators (Except Offline)
		$operators = Operator::find_many();

		$devices = array();
		if ($operators !== false) {
			foreach ($operators as $key => $operator) {
				if ($operator->status() != 0) {
					if ((float)$_SETTINGS['SERVERVERSION'] >= 4.1) {
						$unique = array();
						foreach ($operator->devices()->order_by_desc('datetime')->find_many() as $key => $device) {
							if (!in_array($device->unique, $unique)) {
								$unique[] = $device->unique;
								if (!empty($device->device)) {
									$devices[] = $device->token;
								}
							}
						}
					} else { // iPhone PUSH Supported
						if (!empty($operator->device)) {
							$devices[] = $operator->device;
						}
					}
				}
			}
		}

		return $devices;
	}

	function send($devices) {

		global $hooks;

		if (count($devices) > 0) {

			// TODO: Future Accept Alert
			//array('body' => "$user is pending for Live Help at $server", 'action-loc-key' => 'Accept');

			$payload = '';
			if (!empty($this->alert) && !empty($this->sound)) {
				if (function_exists('mb_strlen')) {
					$length = mb_strlen($this->alert, 'utf-8');
				} else {
					$length = strlen($this->alert);
				}
				$bytes = $this->strbytes(json_encode($this->alert));
				$shortened = false;
				while ($bytes > 110) { // Max 200 bytes - Russian Cyrillic Issue 110 bytes
					$length--;
					if (function_exists('mb_strcut')) {
						$this->alert = mb_strcut($this->alert, 0, $length, 'utf-8');
					} else {
						$this->alert = substr($this->alert, 0, $length);
					}
					$bytes = $this->strbytes(json_encode($this->alert));
					$shortened = true;
				}
				if ($shortened == true) { $this->alert .= '...'; }

				// APNS JSON Payload
				if (!empty($this->badge)) {
					$aps = array('alert' => $this->alert, 'sound' => $this->sound, 'badge' => $this->badge);
				} else {
					$aps = array('alert' => $this->alert, 'sound' => $this->sound);
				}

				// Category
				if (!empty($this->category)) {
					$aps['category'] = $this->category;
				}

				$payload = array('aps' => $aps);
			}

			if (!empty($this->action) && !empty($this->custom)) {
				$payload[$this->custom] = array('id' => $this->customid, 'action' => $this->action);
			}

			// WNS JSON Payload
			if (!empty($this->title)) {
				$wns = array('title' => $this->title, 'description' => $this->alert, $this->custom => $this->customid);
			} else {
				$wns = '';
			}

			// GCM Payload
			$gcm = array('message' => $this->message, 'description' => $this->alert);

			// Override PUSH Notifications
			if (defined('DEVICEOVERRIDE')) {
				$hooks->run('DeviceNotification', array('devices' => $devices, 'apns' => $payload, 'gcm' => $gcm, 'wns' => $wns));
				return;
			}

			// Web Service Data
			$data = array('key' => $this->key, 'devices' => $devices, 'payload' => $payload, 'gcm' => $gcm, 'wns' => $wns);
			$query = json_encode($data);
			$url = 'http://api.stardevelop.com/push.php';

			// Query Web Service
			if (function_exists('curl_init')) {

				$headers = array('Accept: application/json', 'Content-Type: application/json');
				$ch = curl_init($url);
				curl_setopt($ch, CURLOPT_HEADER, $headers);
				curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
				curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
				curl_setopt($ch, CURLOPT_POST, 1);
				curl_setopt($ch, CURLOPT_POSTFIELDS, $query);
				$result = curl_exec($ch);
				curl_close($ch);

			} else {

				// PHP5 HTTP POST
				if (version_compare(phpversion(), '5.0.0', '>=')) {
					$opts = array('http' =>
						array(
							'method'  => 'POST',
							'header'  => "Content-type: application/x-www-form-urlencoded\r\n" . "Content-Type: application/json\r\n" . "Accept: application/json\r\n",
							'content' => $query
						)
					);
					$context  = stream_context_create($opts);
					$result = file_get_contents($url, false, $context);

				} else {

					// PHP4 HTTP POST
					$body = $query;
					$headers = "POST $url 1.1\r\n";
					$headers .= "Content-type: application/x-www-form-urlencoded\r\n";
					$headers .= "Content-Type: application/json\r\n";
					$headers .= "Accept: application/json\r\n";
					if (!empty($body)) {
						$headers .= "Content-length: " . strlen($body) . "\r\n";
					}
					$headers .= "\r\n";

					if ($fp = fsockopen('api.stardevelop.com', 80, $errno, $errstr, 180)) {
						fwrite($fp, $headers . $body, strlen($headers . $body));
						fclose();
					}
				}
			}
		}
	}

	function strbytes($str) {

		// Number of characters in string
		$strlen_var = strlen($str);

		// # Bytes
		$d = 0;

		/*
		* Iterate over every character in the string,
		* escaping with a slash or encoding to UTF-8 where necessary
		*/
		for ($c = 0; $c < $strlen_var; ++$c) {

			$ord_var_c = ord($str{$d});
			if (($ord_var_c >= 0x20) && ($ord_var_c <= 0x7F)) {
				// characters U-00000000 - U-0000007F (same as ASCII)
				$d++;
			} else if (($ord_var_c & 0xE0) == 0xC0) {
				// characters U-00000080 - U-000007FF, mask 110XXXXX
				// see http://www.cl.cam.ac.uk/~mgk25/unicode.html#utf-8
				$d+=2;
			} else if (($ord_var_c & 0xF0) == 0xE0) {
				// characters U-00000800 - U-0000FFFF, mask 1110XXXX
				// see http://www.cl.cam.ac.uk/~mgk25/unicode.html#utf-8
				$d+=3;
			} else if (($ord_var_c & 0xF8) == 0xF0) {
				// characters U-00010000 - U-001FFFFF, mask 11110XXX
				// see http://www.cl.cam.ac.uk/~mgk25/unicode.html#utf-8
				$d+=4;
			} else if (($ord_var_c & 0xFC) == 0xF8) {
				// characters U-00200000 - U-03FFFFFF, mask 111110XX
				// see http://www.cl.cam.ac.uk/~mgk25/unicode.html#utf-8
				$d+=5;
			} else if (($ord_var_c & 0xFE) == 0xFC) {
				// characters U-04000000 - U-7FFFFFFF, mask 1111110X
				// see http://www.cl.cam.ac.uk/~mgk25/unicode.html#utf-8
				$d+=6;
			} else {
				$d++;
			}
		}

		return $d;
	}

}

?>
