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

class FullContactPerson extends Model {
	public static $_table = 'fullcontactperson';
	public static $_id_column = 'id';
	public static $_table_use_short_name = true;
	public static $_connection_name = 'default';
}
FullContactPerson::$_table = TABLEPREFIX . 'fullcontactperson';

?>
