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

require_once('./include/database.php');
require_once('./include/class.aes.php');
require_once('./include/class.cookie.php');
require_once('./include/class.session.php');
require_once('./include/class.email.php');
require_once('./include/core.functions.php');
require_once('./include/core.config.php');
require_once('./include/class.models.php');
require_once('./include/class.push.php');

ignore_user_abort(true);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
	if (isset($_SERVER['HTTP_ORIGIN'])) {
		header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
		header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
		header('Access-Control-Allow-Headers: X-Requested-With');
		header('Access-Control-Allow-Credentials: true');
		header('Access-Control-Max-Age: 1728000');
		header('Content-Length: 0');
		header('Content-Type: text/plain');
		exit();
	} else {
		header('HTTP/1.1 403 Access Forbidden');
		header('Content-Type: text/plain');
		exit();
	}
} else {
	// AJAX Cross-site Headers
	if (isset($_SERVER['HTTP_ORIGIN'])) {
		header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
		header('Access-Control-Allow-Credentials: true');
	}
}

header('Content-type: text/html; charset=utf-8');

if (defined('LANGUAGE')) {
	include('./locale/' . LANGUAGE . '/guest.php');
} else {
	include('./locale/en/guest.php');
}

// Initialise Session
$session = new Session($_REQUEST['SESSION'], $_SETTINGS['AUTHKEY']);

if ($session->chat > 0) {

	$chat = Chat::where_id_is($session->chat)->find_one();
	if ($chat !== false) {

		if ($chat->status == 1 && $chat->session()->count() > 0) {

			// Close Status
			$chat->status = -1;
			$chat->save();

			// Save Session End Datetime
			$chatsession = ChatSession::where('chat', $chat->id)
				->where_null('end')
				->order_by_desc('accepted')
				->find_one();

			$chatsession->end = date('Y-m-d H:i:s', time());
			$chatsession->save();

			// Delete Typing
			$typing = Typing::where('chat', $chat->id)
				->find_many();

			if ($typing !== false) {
				foreach ($typing as $key => $type) {
					$type->delete();
				}
			}

			// Initiate Chat
			if (is_numeric($session->request) && $session->request > 0) {
				$visitor = Visitor::where_id_is($session->request)->find_one();
				if ($visitor !== false) {
					$visitor->initiate = 0;
					$visitor->save();
				}
			}

			$hooks->run('VisitorSaveInitiate', array('id' => $session->request));

			if ($_SETTINGS['SERVERVERSION'] >= 3.90) {
				// Insert Closed Chat Activity
				$activity = Activity::create();
				$activity->user = $chat->id;
				$activity->username = $chat->name;
				$activity->datetime = date('Y-m-d H:i:s', time());
				$activity->activity = 'The chat with {name} has been closed';
				$activity->type = 9;
				$activity->status = 0;
				$activity->save();
			}

			// Close Chat Hook
			$hooks->run('CloseChat', array($chat->id, $chat->name));

		}

		// Send Chat Transcript
		if (isset($_SETTINGS['AUTOEMAILTRANSCRIPT']) && $_SETTINGS['AUTOEMAILTRANSCRIPT'] != '') {

			$messages = Message::where('chat', $chat->id)
				->where_lte('status', 3)
				->order_by_asc('datetime')
				->find_many();

			// Determine EOL
			$server = strtoupper(substr(PHP_OS, 0, 3));
			if ($server == 'WIN') {
				$eol = "\r\n";
			} elseif ($server == 'MAC') {
				$eol = "\r";
			} else {
				$eol = "\n";
			}

			$htmlmessages = '';
			if ($messages !== false) {
				foreach ($messages as $key => $message) {
					$content = $message->message;

					switch ($message->status) {
						case -3: // Chat Rating
							break;
						case -2: // Visitor Alert
							// Issue: Outlook 2007 / 2010 doesn't support CSS Float and Position use align attribute instead
							$htmlmessages .= '<img src="' . $_SETTINGS['URL'] . '/livehelp/images/16px/Visitor.png" style="margin-right:5px" align="left" width="16" height="16" /><div style="margin-left:15px; color:#666666;">' . $content . '</div>' . $eol;
							break;
						case 2: // Hyperlink
							list($description, $link) = explode("\n", $content);
							$content = '<a href="' . trim($link) . '" alt="' . trim($description) . '">' . trim($link) . '</a>';
							$htmlmessages .= '<div style="margin-left:15px">' . trim($description) . ' - ' . $content . '</div>' . $eol;
							break;
						case 3: // Image
							list($description, $image) = explode("\n", $content);
							$content = '<img src="' . trim($image) . '" alt="Received Image">';
							$htmlmessages .= '<div style="margin-left:15px">' . $content . '</div>' . $eol;
							break;
						default:
							// Remove HTML code
							$content = str_replace('<', '&lt;', $content);
							$content = str_replace('>', '&gt;', $content);
							$content = preg_replace("/(\r\n|\r|\n)/", '<br />', $content);

							// Emoticons
							$content = htmlSmilies($content, $_SETTINGS['URL'] . '/livehelp/images/16px/', $eol);

							// Operator
							if ($message->status) {
								$htmlmessages .= '<div style="color:#666666">' . $message->username . ' ' . $_LOCALE['says'] . ':</div><div style="margin-left:15px; color:#666666;">' . $content . '</div>' . $eol;
							}
							// Guest
							if (!$message->status) {
								$htmlmessages .= '<div>' . $message->username . ' ' . $_LOCALE['says'] . ':</div><div style="margin-left: 15px;">' . $content . '</div>' . $eol;
							}
							break;
					}
				}
			}

			$visitor = false;
			if (is_numeric($session->request) && $session->request > 0) {
				$visitor = Visitor::where_id_is($session->request)->find_one();
			}

			$visitor = $hooks->run('VisitorLoaded', array('id' => $session->request, 'visitor' => $visitor));

			// Email
			$email = $chat->email;
			if (empty($email)) { $email = 'Unavailable'; }

			$browser = '';
			if ($visitor !== false) {
				// Browser Icon
				if (strpos($visitor->useragent, 'Chrome') !== false) {
					$browser = 'Chrome.png';
				} else if (strpos($visitor->useragent, 'Safari') !== false) {
					$browser = 'Safari.png';
				} else if (strpos($visitor->useragent, 'Opera') !== false) {
					$browser = 'Opera.png';
				} else if (strpos($visitor->useragent, 'Netscape') !== false) {
					$browser = 'Netscape.png';
				} else if (strpos($visitor->useragent, 'Firefox') !== false) {
					$browser = 'Firefox.png';
				} else if (strpos($visitor->useragent, 'MSIE') !== false) {
					$browser = 'InternetExplorer7.png';
				} else {
					$browser = '';
				}
			}

			$visitorhtml = '';
			if ($visitor !== false) {
				$visitorhtml = <<<END
<div id="visitor" class="visitor">
<div><span class="label">Hostname / IP Address:</span> <span id="email" class="label-desc">{$visitor->ipaddress}</span></div>
<div><span class="label">Email:</span> <span id="email" class="label-desc">{$email}</span></div>
<div><span class="label">Web Browser:</span> <span id="useragent" class="label-desc">{$visitor->useragent}</span></div>
<div><span class="label">Resolution:</span> <span id="resolution" class="label-desc">{$visitor->resolution}</span></div>
<div><span class="label">Country:</span> <span id="country" class="label-desc">{$visitor->country}</span></div>
<div><span class="label">Referer:</span> <span id="referer" class="label-desc">{$visitor->referrer}</span></div>
<div><span class="label">Current Page:</span> <span id="page" class="label-desc">{$visitor->url}</span>
<div><span class="label">Page History:</span> <span id="history" class="label-desc">{$visitor->path}</span></div>
</div>
END;
			}

			$html = <<<END
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<style type="text/css">
<!--

div, p {
	font-family: Calibri, Verdana, Arial, Helvetica, sans-serif;
	font-size: 14px;
	color: #000000;
}
#visitor {
	position: relative;
	margin-top: 25px;
	height: 180px;
}
.label {
	position: absolute;
	width: 80px;
	text-align: right;
	color: #666666;
}
.label-desc {
	position: absolute;
	left: 85px;
}

//-->
</style>
</head>

<body>
<div><img src="{$_SETTINGS['CHATTRANSCRIPTHEADERIMAGE']}" alt="{$_LOCALE['chattranscript']}" /></div>
<div><strong>{$_LOCALE['chattranscript']}:</strong></div>
<div>$htmlmessages</div>
$visitorhtml
<div style="position:relative; margin-top:25px"><img src="{$_SETTINGS['CHATTRANSCRIPTFOOTERIMAGE']}" alt="{$_SETTINGS['NAME']}" /></div>
</body>
</html>
END;

			if (!empty($htmlmessages)) {

				$from = $_SETTINGS['EMAIL'];
				if (isset($_SETTINGS['SMTPFROM'])) {
					$from = $_SETTINGS['SMTPFROM'];
				}

				$subject = $_SETTINGS['NAME'] . ' ' . $_LOCALE['chattranscript'] . ' (' . $_LOCALE['autogenerated'] . ')';
				$result = Email::send($_SETTINGS['AUTOEMAILTRANSCRIPT'], $from, $_SETTINGS['NAME'], $subject, $html, EmailType::HTML);
			}
		}
	}
}
?>
