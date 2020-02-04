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

class Activity extends Model {
	public static $_table = 'activity';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';
}
Activity::$_table = TABLEPREFIX . 'activity';


class OperatorMessage extends Model {
	public static $_table = 'operatormessages';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';
}
OperatorMessage::$_table = TABLEPREFIX . 'operatormessages';


class Callback extends Model {
	public static $_table = 'callback';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';
}
Callback::$_table = TABLEPREFIX . 'callback';


class Country extends Model {
	public static $_table = 'countries';
	public static $_id_column = 'code';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';
}
Country::$_table = TABLEPREFIX . 'countries';


class Department extends Model {
	public static $_table = 'departments';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';
}
Department::$_table = TABLEPREFIX . 'departments';


class Device extends Model {
	public static $_table = 'devices';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';
}
Device::$_table = TABLEPREFIX . 'devices';


class Message extends Model {
	public static $_table = 'messages';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';

	public function operator() {
		return $this->has_one(__namespace__ . '\Operator', 'username', 'username');
	}
}
Message::$_table = TABLEPREFIX . 'messages';


class Response extends Model {
	public static $_table = 'responses';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';
}
Response::$_table = TABLEPREFIX . 'responses';


class Chat extends Model {
	public static $_table = 'chats';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';

	public $channel = false;

	public function messages() {
		return $this->has_many(__namespace__ . '\Message', 'chat');
	}

	public function custom() {
		return $this->has_one(__namespace__ . '\Custom', 'request', 'request');
	}

	public function rating() {
		return $this->has_many(__namespace__ . '\Rating', 'chat');
	}

	public function session() {
		return $this->has_many(__namespace__ . '\ChatSession', 'chat');
	}

	public function typing() {
		return $this->has_one(__namespace__ . '\Typing', 'chat');
	}

	public function visitor() {
		return $this->has_one(__namespace__ . '\ChatVisitor', 'chat');
	}

	public static function has_department($chat, $department) {
		$result = false;
		$departments = explode(';', $department);
		if (!empty($chat->department)) {
			if (is_array($departments)) {
				foreach ($departments as $key => $value) {
					if ($chat->department == trim($value)) {
						$result = true;
					}
				}
			}
		} else {
			$result = true;
		}
		return $result;
	}

	public static function has_visitor($chat) {
		global $_SETTINGS;
		global $hooks;

		$visitor = false;
		if ($chat !== false) {
			if ($_SETTINGS['DATABASEVERSION'] > 10) {
				if (!empty($chat->id) && (int)$chat->id > 0) {
					$chatvisitor = ChatVisitor::where('chat', $chat->id)->find_one();
					if ($chatvisitor !== false) {
						if (is_numeric($chatvisitor->visitor) && (int)$chatvisitor->visitor > 0) {
							$visitor = $chatvisitor->visitor()->find_one();
						} else {
							$hash = false;
							$id = $chat->id;
							$prefix = 'visitor:' . ACCOUNT . ':';
							if (strpos($chatvisitor->visitor, $prefix) > -1) {
								$hash = str_replace($prefix, '', $chatvisitor->visitor);
								$result = $hooks->run('VisitorLoaded', array('id' => $hash, 'visitor' => $visitor));
								if (is_array($result) && isset($result['visitor'])) {
									$visitor = $result['visitor'];
								}
							}
						}
					}
				}
			} else {
				if (!empty($chat->request) && (int)$chat->request > 0) {
					$visitor = Visitor::where_id_is($chat->request)->find_one();
				}
			}
		}
		return $visitor;
	}

}
Chat::$_table = TABLEPREFIX . 'chats';


class Geolocation extends Model {
	public static $_table = 'geolocation';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';
}
Geolocation::$_table = TABLEPREFIX . 'geolocation';


class Custom extends Model {
	public static $_table = 'custom';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';
}
Custom::$_table = TABLEPREFIX . 'custom';


class Visitor extends Model {
	public static $_table = 'requests';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';

	public $company = false;
	public $address = false;
	public $telephone = false;
	public $groups = array();
	public $socket = false;
	public $custom = false;

	public function geolocation() {
		return $this->has_one(__namespace__ . '\Geolocation', 'request');
	}

	public function custom() {
		return $this->has_many(__namespace__ . '\Custom', 'request', 'request');
	}

}
Visitor::$_table = TABLEPREFIX . 'requests';

class Operator extends Model {
	public static $_table = 'users';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';

	public function devices() {
		return $this->has_many(__namespace__ . '\Device', 'user');
	}

	public function status() {
		global $_SETTINGS;

		$status = 0;
		$active = time() - strtotime($this->refresh) < $_SETTINGS['CONNECTIONTIMEOUT'];

		if ((int)$_SETTINGS['DATABASEVERSION'] >= 10) {
			if ($active || count($this->devices()->find_array()) > 0 || (defined('WEBSOCKETS') && count($this->websocket()->where_gt('active', 0)->find_array()) > 0)) {
				$status = (int)$this->status;
			}
		} elseif ((float)$_SETTINGS['SERVERVERSION'] >= 4.1) {
			if ($active || count($this->devices()->find_array()) > 0) {
				$status = (int)$this->status;
			}
		} elseif ((float)$_SETTINGS['SERVERVERSION'] >= 3.80) {
			if ($active || !empty($this->device)) {
				$status = (int)$this->status;
			}
		} else {
			if ($active) {
				$status = (int)$this->status;
			}
		}
		return $status;
	}

	public function websocket() {
		return $this->has_one(__namespace__ . '\Websocket', 'id');
	}

	public static function has_department($user, $department) {
		$result = false;
		$departments = explode(';', $user->department);
		if (is_array($departments)) {
			foreach ($departments as $key => $value) {
				if ($department == trim($value)) {
					$result = true;
				}
			}
		}
		return $result;
	}

}
Operator::$_table = TABLEPREFIX . 'users';

class Operators {
	public static $online = array();
	public static $hidden = array();
	public static $away = array();
	public static $brb = array();
	public static $unavailable = array();
}

class Rating extends Model {
	public static $_table = 'ratings';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';
}
Rating::$_table = TABLEPREFIX . 'ratings';

class ChatSession extends Model {
	public static $_table = 'sessions';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';

	public function operator() {
		return $this->has_one(__namespace__ . '\Operator', 'id', 'user');
	}

}
ChatSession::$_table = TABLEPREFIX . 'sessions';


class Typing extends Model {
	public static $_table = 'typing';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';
}
Typing::$_table = TABLEPREFIX . 'typing';


class ChatVisitor extends Model {
	public static $_table = 'chatvisitors';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';

	public function visitor() {
		return $this->has_one(__namespace__ . '\Visitor', 'id', 'visitor');
	}

	public function chat() {
		return $this->has_one(__namespace__ . '\Chat', 'id', 'chat');
	}

	public function custom() {
		return $this->has_one(__namespace__ . '\Custom', 'request', 'visitor');
	}

}
ChatVisitor::$_table = TABLEPREFIX . 'chatvisitors';


class InitiateChat extends Model {
	public static $_table = 'initiatechat';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';
}
InitiateChat::$_table = TABLEPREFIX . 'initiatechat';


class Address {
	public $address1;
	public $address2;
	public $city;
	public $state;
	public $postcode;
	public $country;
}


class VisitorGroup {
	public $id = false;
	public $name = false;
	public $sections = array();
	public $position = false;
}


class VisitorSection {
	public $id = false;
	public $name = false;
	public $items = array();
	public $position = false;
}


class VisitorItem {
	public $label = false;
	public $value = false;
}

?>
