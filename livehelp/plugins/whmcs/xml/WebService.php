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

include('../../../include/database.php');
include('../../../include/core.config.php');
include('../../../include/class.models.php');
include('../../../include/version.php');
include('../../../include/core.functions.php');

set_time_limit(0);
ignore_user_abort(true);

// Database Connection
if (DB_HOST == '' || DB_NAME == '' || DB_USER == '' || DB_PASS == '') {
	// HTTP Service Unavailable
	if (strpos(php_sapi_name(), 'cgi') === false ) { header('HTTP/1.0 503 Service Unavailable'); } else { header('Status: 503 Service Unavailable'); }
	exit();
}

if (!isset($_REQUEST['Username'])){ $_REQUEST['Username'] = ''; }
if (!isset($_REQUEST['Password'])){ $_REQUEST['Password'] = ''; }
$_OPERATOR = array();

if (IsAuthorized() == true) {

	$_REQUEST = array_map('addslashes', $_REQUEST);

	switch ($_SERVER['QUERY_STRING']) {
		case 'Client':
			Client();
			break;
		case 'Tickets':
			Tickets();
			break;
		case 'Replies':
			Ticket();
			break;
		default:
			if (strpos(php_sapi_name(), 'cgi') === false ) { header('HTTP/1.0 403 Forbidden'); } else { header('Status: 403 Forbidden'); }
			break;
	}

} else {
	if (strpos(php_sapi_name(), 'cgi') === false ) { header('HTTP/1.0 403 Forbidden'); } else { header('Status: 403 Forbidden'); }
}

exit();


function IsAuthorized() {

	global $_OPERATOR;
	global $_SETTINGS;

	$user = Operator::where('username', $_REQUEST['Username'])->find_one();
	if ($user !== false) {
		$length = strlen($user->password);
		if ($user->password == $_REQUEST['Password']) {
			return true;
		} else {
			switch ($length) {
				case 40: // SHA1
					$version = '2.0';
					break;
				case 128: // SHA512
					$version = '3.0';
					break;
				default: // MD5
					$version = '1.0';
					break;
			}
			header('X-Authentication: ' . $version);
		}
	}
	return false;
}

function Client() {

	global $_OPERATOR;
	global $_SETTINGS;

	if (!isset($_REQUEST['ID'])){ $_REQUEST['ID'] = ''; }
	$id = (int)$_REQUEST['ID'];

	$client = Plugins\WHMCS\Client::where_id_is($id)->find_one();
	if ($client !== false) {

		$name = $client->firstname . ' ' . $client->lastname;

		header('Content-type: text/xml; charset=utf-8');
		echo('<?xml version="1.0" encoding="utf-8"?>' . "\n");
?>
<Client ID="<?php echo($client->id); ?>">
	<Name><?php echo(xmlelementinvalidchars($name)); ?></Name>
	<Email><?php echo(xmlelementinvalidchars($client->email)); ?></Email>
	<Telephone><?php echo(xmlelementinvalidchars($client->phonenumber)); ?></Telephone>
</Client>
<?php
	} else {
?>
<Client/>
<?php
	}
}

function Tickets() {

	global $_OPERATOR;
	global $_SETTINGS;

	if (!isset($_REQUEST['ID'])){ $_REQUEST['ID'] = ''; }
	if (!isset($_REQUEST['Status'])){ $_REQUEST['Status'] = ''; }

	// WHMCS Ticket
	$id = (int)$_REQUEST['ID'];
	$tickets = Plugins\WHMCS\Ticket::where('userid', $id)
		->where_not_equals('status', 'Closed')
		->order_by_desc('date')
		->find_many();

	if ($tickets !== false) {

		header('Content-type: text/xml; charset=utf-8');
		echo('<?xml version="1.0" encoding="utf-8"?>' . "\n");
?>
<Tickets>
<?php
		foreach ($tickets as $key => $ticket) {

			$message = str_replace('<br />', '', $ticket->message);

?>
	<Ticket ID="<?php echo($ticket->id); ?>">
		<Date><?php echo(xmlelementinvalidchars($ticket->date)); ?></Date>
		<Title><?php echo(xmlelementinvalidchars($ticket->title)); ?></Title>
		<Message><?php echo(xmlelementinvalidchars($message)); ?></Message>
<?php

			// Ticket Replies
			$replies = Plugins\WHMCS\TicketReply::where('tid', $ticket->id)
				->order_by_asc('date')
				->find_many();

			if ($replies !== false) {
?>
		<Replies>
<?php
				foreach ($replies as $key => $reply) {

					$name = $reply->admin;

					if ($reply->userid > 0) {

						// WHMCS Client
						$client = Plugins\WHMCS\Client::where_id_is('id', $reply->userid)->find_one();
						if ($client !== false) {
							$name = $client->firstname . ' ' . $client->lastname;
						} else {
							$name = '';
						}
					}

					$message = str_replace('<br />', '', $reply->message);
?>
			<Reply ID="<?php echo(xmlattribinvalidchars($reply->id)); ?>" User="<?php echo(xmlattribinvalidchars($reply->userid)); ?>">
				<Date><?php echo(xmlelementinvalidchars($reply->date)); ?></Date>
				<Name><?php echo(xmlelementinvalidchars($name)); ?></Name>
				<Message><?php echo(xmlelementinvalidchars($message)); ?></Message>
				<Rating><?php echo(xmlelementinvalidchars($reply->rating)); ?></Rating>
			</Reply>
<?php
				}
?>
		</Replies>
<?php
			}
?>
	</Ticket>
<?php
		}
?>
</Tickets>
<?php
	} else {
?>
<Tickets/>
<?php
	}

}

function Replies() {

	global $_OPERATOR;
	global $_SETTINGS;

	if (!isset($_REQUEST['ID'])){ $_REQUEST['ID'] = ''; }
	$tid = (int)$_REQUEST['ID'];

	// Ticket Replies
	$replies = Plugins\WHMCS\TicketReply::where('tid', $tid)
		->order_by_asc('date')
		->find_many();

	if ($replies !== false) {

		header('Content-type: text/xml; charset=utf-8');
		echo('<?xml version="1.0" encoding="utf-8"?>' . "\n");
?>
<Replies ID="<?php echo($tid); ?>">
<?php
		foreach ($replies as $key => $reply) {

			$name = $reply->admin;

			if ($reply->userid > 0) {
				// WHMCS Client
				$client = Plugins\WHMCS\Client::where_id_is('id', $reply->userid)->find_one();
				$name = $client->firstname . ' ' . $client->lastname;
			}

			$message = str_replace('<br />', '', $reply->message);

?>
	<Reply ID="<?php echo(xmlattribinvalidchars($reply->id)); ?>">
		<Date><?php echo(xmlelementinvalidchars($reply->date)); ?></Date>
		<Name><?php echo(xmlelementinvalidchars($name)); ?></Name>
		<Message><?php echo(xmlelementinvalidchars($message)); ?></Message>
		<Rating><?php echo(xmlelementinvalidchars($reply->rating)); ?></Rating>
	</Reply>
<?php
		}
?>
</Replies>
<?php
	} else {
?>
<Replies/>
<?php
	}

}

?>
