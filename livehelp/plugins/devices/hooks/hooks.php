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

/*
 * Hook class name must end with Hooks
 * i.e. ExampleHooks or TestHooks
 *
 */
class DeviceNotificationHooks {

	function __construct() {
		// Init Hook
	}

	function OperatorUpdatedStatusModeNotification($args) {

		global $_SETTINGS;

		// Arguments
		$id = $args['id'];
		$status = $args['status']; // Hidden, Offline, Online, BRB, Away

		// Operators
		$operators = Operator::find_many();

		$devices = array();
		if ($operators !== false) {
			foreach ($operators as $key => $operator) {
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

		if (!empty($devices) && is_array($devices)) {

			// Device PUSH
			$push = new PUSH();

			$action = array('type' => 'status', 'status' => $status);
			$json = json_encode($action);

			// APNS Alert Options
			$push->action = $json;
			$push->custom = 'status';
			$push->customid = $id;
			$push->message = 'status';

			$push->send($devices);
		}

	}

	function SendMessageNotification($args) {

		global $_SETTINGS;

		// Arguments
		$chat = (!empty($args['chat'])) ? $args['chat'] : false;
		$message = (!empty($args['message'])) ? $args['message'] : false;
		$json = (!empty($args['json'])) ? $args['json'] : false;
		$guest = (!empty($args['guest'])) ? $args['guest'] : false;

		// TODO Sent Mobile PUSH
		if (is_string($chat) && strlen($chat) === 36) {
			return $args;
		}

		if ($guest == true) {

			$operators = false;
			if ($chat !== false) {
				$sessions = $chat->session()->find_many();
				if ($sessions !== false) {
					$operators = array();
					foreach ($sessions as $key => $session) {
						$operator = $session->operator()->find_one();
						if ($operator !== false) {
							$operators[] = $operator;
						}
					}
				}
			}

			$devices = array();
			if ($operators !== false) {
				foreach ($operators as $key => $operator) {
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

			if (!empty($devices) && is_array($devices)) {

				// Device PUSH
				$push = new PUSH();

				$action = array('type' => 'message', 'guest' => true);
				$json = json_encode($action);

				// APNS Alert Options
				$push->title = 'New Message';
				$push->alert = sprintf('%s: %s', $message->username, $message->message);
				$push->sound = 'Message.wav';
				$push->action = $json;
				$push->custom = 'chat';
				$push->customid = $chat->id;
				$push->message = 'message';
				$push->category = 'Reply';

				$push->send($devices);
			}

			$otherdevices = array();
			$operators = Operator::find_many();
			if ($operators !== false) {
				foreach ($operators as $key => $operator) {
					if ((float)$_SETTINGS['SERVERVERSION'] >= 4.1) {
						$unique = array();
						foreach ($operator->devices()->order_by_desc('datetime')->find_many() as $key => $device) {
							if (!in_array($device->unique, $unique)) {
								$unique[] = $device->unique;
								if (!empty($device->device) && !in_array($device->token, $devices)) {
									$otherdevices[] = $device->token;
								}
							}
						}
					} else { // iPhone PUSH Supported
						if (!empty($operator->device) && !in_array($operator->device, $devices)) {
							$otherdevices[] = $operator->device;
						}
					}
				}
			}

			if (!empty($otherdevices) && is_array($otherdevices)) {

				// Device PUSH
				$push = new PUSH();

				$action = array('type' => 'message', 'guest' => true);
				$json = json_encode($action);

				// APNS Alert Options
				$push->action = $json;
				$push->custom = 'chat';
				$push->customid = $chat->id;
				$push->message = 'message';

				$push->send($otherdevices);
			}

		} else {

			// Send Notification to Operator Sessions
			$sessions = $chat->session()->find_many();
			$devices = array();
			if ($sessions !== false) {
				foreach ($sessions as $key => $session) {
					$operator = $session->operator()->find_one();
					if ($operator !== false) {
						if ((float)$_SETTINGS['SERVERVERSION'] >= 4.1) {
							$unique = array();
							foreach ($operator->devices()->order_by_desc('datetime')->find_many() as $key => $device) {
								if (!in_array($device->unique, $unique)) {
									$unique[] = $device->unique;
									if (!empty($device->device) && !in_array($device->token, $devices)) {
										$devices[] = $device->token;
									}
								}
							}
						} else { // iPhone PUSH Supported
							if (!empty($operator->device) && !in_array($operator->device, $devices)) {
								$devices[] = $operator->device;
							}
						}
					}
				}
			}

			if (!empty($devices) && is_array($devices)) {

				// Device PUSH
				$push = new PUSH();

				$action = array('type' => 'message', 'guest' => false);
				$json = json_encode($action);

				// APNS Alert Options
				$push->action = $json;
				$push->custom = 'chat';
				$push->customid = $chat->id;
				$push->message = 'message';
				$push->category = 'Reply';

				$push->send($devices);
			}

		}

		return $args;
	}

	function PendingChatNotification($args) {

		// Arguments
		$username = $args['user'];
		$server = $args['server'];
		$badge = $args['badge'];
		$chat = $args['chat'];
		$devices = $args['devices'];
		$channel = $args['channel'];

		if (!empty($devices) && is_array($devices)) {

			// Device PUSH Notifications
			$push = new PUSH();

			// APNS Alert Options
			$push->title = 'Pending Chat';
			$push->alert = sprintf('%s is waiting to chat at %s', $username, $server);
			$push->sound = 'Pending.wav';
			$push->badge = $badge;
			$push->custom = 'chat';
			$push->customid = $chat->id;
			$push->message = 'chat';
			$push->action = 'accept';

			// Send PUSH Notification
			$push->send($devices);
		}
	}

	function AcceptChatNotification($args) {

		// Arguments
		$chat = $args['chat'];
		if ($chat !== false) {

			// Device PUSH Notifications
			$push = new PUSH();

			// Devices
			$devices = $push->OnlineDevices();

			if (!empty($devices) && is_array($devices)) {

				// APNS Alert Options
				$push->alert = sprintf('%s accepted Live Chat', ucwords(strtolower($chat->name)));
				$push->message = 'accepted';

				// Send PUSH Notification
				$push->send($devices);
			}
		}

	}

	function CloseChatNotification($args) {

		// Arguments
		list($chat, $name) = $args;

		// Devices
		if ($name !== false) {

			// Device PUSH Notifications
			$push = new PUSH();

			// Devices
			$devices = $push->OnlineDevices();

			if (!empty($devices) && is_array($devices)) {

				// APNS Alert Options
				$push->alert = sprintf('%s closed the Live Chat', $name);
				$push->message = 'closed';

				// Send PUSH Notification
				$push->send($devices);
			}
		}

	}

	function SendOperatorMessageNotification($args) {

		global $_SETTINGS;

		// Arguments
		$user = (!empty($args['user'])) ? $args['user'] : false;
		$message = (!empty($args['message'])) ? $args['message'] : false;
		$guest = (!empty($args['guest'])) ? $args['guest'] : false;

		if ($guest == false) {

			$operator = Operator::where_id_is($message->to)->find_one();

			$devices = array();
			if ($operator !== false) {
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

			$firstname = false;
			$from = Operator::where_id_is($message->from)->find_one();
			if ($from !== false) {
				$firstname = $from->firstname;
			}

			if (!empty($devices) && is_array($devices) && $firstname !== false) {

				// Device PUSH
				$push = new PUSH();

				$action = array('type' => 'message', 'guest' => false);
				$json = json_encode($action);

				// APNS Alert Options
				$push->title = 'New Message';
				$push->alert = sprintf('%s: %s', $firstname, $message->message);
				$push->sound = 'Message.wav';
				$push->action = $json;
				$push->custom = 'chat';
				$push->customid = $operator->id;
				$push->message = 'message';

				$push->send($devices);
			}

			// From Notification
			$devices = array();
			if ($from !== false) {
				if ((float)$_SETTINGS['SERVERVERSION'] >= 4.1) {
					$unique = array();
					foreach ($from->devices()->order_by_desc('datetime')->find_many() as $key => $device) {
						if (!in_array($device->unique, $unique)) {
							$unique[] = $device->unique;
							if (!empty($device->device)) {
								$devices[] = $device->token;
							}
						}
					}
				} else { // iPhone PUSH Supported
					if (!empty($from->device)) {
						$devices[] = $from->device;
					}
				}
			}

			if (!empty($devices) && is_array($devices) && $firstname !== false) {

				// Device PUSH
				$push = new PUSH();

				$action = array('type' => 'message', 'guest' => false);
				$json = json_encode($action);

				// APNS Alert Options
				$push->action = $json;
				$push->custom = 'chat';
				$push->customid = $from->id;
				$push->message = 'message';

				$push->send($devices);
			}

		}
	}

}

// Add Hook Functions
// $hooks->add('ExampleHooks', 'EventName', 'FunctionName');
$class = 'DeviceNotificationHooks';

$hooks->add($class, 'SendMessage', 'SendMessageNotification');
$hooks->add($class, 'PendingChat', 'PendingChatNotification');
$hooks->add($class, 'AcceptChat', 'AcceptChatNotification');
$hooks->add($class, 'CloseChat', 'CloseChatNotification');
$hooks->add($class, 'SendOperatorMessage', 'SendOperatorMessageNotification');
$hooks->add($class, 'OperatorUpdatedStatusMode', 'OperatorUpdatedStatusModeNotification');

?>
