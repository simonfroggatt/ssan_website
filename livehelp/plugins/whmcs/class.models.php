<?php
namespace stardevelop\chatstack\Plugins\WHMCS;
use stardevelop\chatstack\ORM, stardevelop\chatstack\Model;

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

class Admin extends Model {
	public static $_table = 'tbladmins';
	public static $_id_column = 'id';
	public static $_connection_name = 'default';
}
Admin::$_connection_name = $_PLUGINS['WHMCS']['CONNECTION'];

class TicketDepartment extends Model {
	public static $_table = 'tblticketdepartments';
	public static $_id_column = 'id';
	public static $_connection_name = 'default';
}
TicketDepartment::$_connection_name = $_PLUGINS['WHMCS']['CONNECTION'];

class TicketPredefinedReplyCategory extends Model {
	public static $_table = 'tblticketpredefinedcats';
	public static $_id_column = 'id';
	public static $_connection_name = 'default';
}
TicketPredefinedReplyCategory::$_connection_name = $_PLUGINS['WHMCS']['CONNECTION'];

class TicketPredefinedReply extends Model {
	public static $_table = 'tblticketpredefinedreplies';
	public static $_id_column = 'id';
	public static $_connection_name = 'default';

	public function category() {
		return $this->has_one('\stardevelop\chatstack\Plugins\WHMCS\TicketPredefinedReplyCategory', 'id', 'id');
	}
}
TicketPredefinedReply::$_connection_name = $_PLUGINS['WHMCS']['CONNECTION'];

class Setting extends Model {
	public static $_table = 'tblconfiguration';
	public static $_id_column = 'setting';
	public static $_connection_name = 'default';
}
Setting::$_connection_name = $_PLUGINS['WHMCS']['CONNECTION'];

class Ticket extends Model {
	public static $_table = 'tbltickets';
	public static $_id_column = 'id';
	public static $_connection_name = 'default';
}
Ticket::$_connection_name = $_PLUGINS['WHMCS']['CONNECTION'];

class TicketReply extends Model {
	public static $_table = 'tblticketreplies';
	public static $_id_column = 'id';
	public static $_connection_name = 'default';
}
TicketReply::$_connection_name = $_PLUGINS['WHMCS']['CONNECTION'];

class KnowledgebaseCategory extends Model {
	public static $_table = 'tblknowledgebasecats';
	public static $_id_column = 'id';
	public static $_connection_name = 'default';
}
KnowledgebaseCategory::$_connection_name = $_PLUGINS['WHMCS']['CONNECTION'];

class KnowledgebaseLink extends Model {
	public static $_table = 'tblknowledgebaselinks';
	public static $_id_column = 'id';
	public static $_connection_name = 'default';

	public function knowledgebase() {
		return $this->has_one('\stardevelop\chatstack\Plugins\WHMCS\Knowledgebase', 'id', 'articleid');
	}
}
KnowledgebaseLink::$_connection_name = $_PLUGINS['WHMCS']['CONNECTION'];

class Knowledgebase extends Model {
	public static $_table = 'tblknowledgebase';
	public static $_id_column = 'id';
	public static $_connection_name = 'default';
}
Knowledgebase::$_connection_name = $_PLUGINS['WHMCS']['CONNECTION'];

class Client extends Model {
	public static $_table = 'tblclients';
	public static $_id_column = 'id';
	public static $_connection_name = 'default';

	public function securityquestion() {
		return $this->has_one('\stardevelop\chatstack\Plugins\WHMCS\SecurityQuestion', 'id', 'securityqid');
	}

	public function hosting() {
		return $this->has_many('\stardevelop\chatstack\Plugins\WHMCS\Hosting', 'userid', 'id');
	}
}
Client::$_connection_name = $_PLUGINS['WHMCS']['CONNECTION'];

class SecurityQuestion extends Model {
	public static $_table = 'tbladminsecurityquestions';
	public static $_id_column = 'id';
	public static $_connection_name = 'default';
}
SecurityQuestion::$_connection_name = $_PLUGINS['WHMCS']['CONNECTION'];

class Hosting extends Model {
	public static $_table = 'tblhosting';
	public static $_id_column = 'id';
	public static $_connection_name = 'default';

	public function product() {
		return $this->has_one('\stardevelop\chatstack\Plugins\WHMCS\Product', 'id', 'packageid');
	}
}
Hosting::$_connection_name = $_PLUGINS['WHMCS']['CONNECTION'];

class Product extends Model {
	public static $_table = 'tblproducts';
	public static $_id_column = 'id';
	public static $_connection_name = 'default';

	public function group() {
		return $this->has_one('\stardevelop\chatstack\Plugins\WHMCS\ProductGroup', 'id', 'gid');
	}
}
Product::$_connection_name = $_PLUGINS['WHMCS']['CONNECTION'];

class ProductGroup extends Model {
	public static $_table = 'tblproductgroups';
	public static $_id_column = 'id';
	public static $_connection_name = 'default';
}
ProductGroup::$_connection_name = $_PLUGINS['WHMCS']['CONNECTION'];

?>
