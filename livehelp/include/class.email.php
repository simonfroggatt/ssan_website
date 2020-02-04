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

use PHPMailer;

// PHPMailer
include(dirname(__FILE__) . '/phpmailer/class.smtp.php');
include(dirname(__FILE__) . '/phpmailer/class.phpmailer.php');

abstract class EmailType {
	const HTML = 0;
	const TEXT = 1;
}

class Email {

	function Email() {
	}

	static function send($to, $from, $name, $subject, $content, $type, $replyto = false) {

		global $_SETTINGS;

		$mail = new PHPMailer(true);

		if (!empty($_SETTINGS['SMTPHOST'])) {
			$mail->IsSMTP();
			$mail->Host = $_SETTINGS['SMTPHOST'];
			$mail->Port = $_SETTINGS['SMTPPORT'];

			if (!empty($_SETTINGS['SMTPUSERNAME']) && !empty($_SETTINGS['SMTPPASSWORD'])) {
				$mail->SMTPAuth = true;
				$mail->Username = $_SETTINGS['SMTPUSERNAME'];
				$mail->Password = $_SETTINGS['SMTPPASSWORD'];
			}
			$mail->SMTPSecure = $_SETTINGS['SMTPSECURE'];
		}

		try {
			$mail->CharSet = 'UTF-8';

			if ($replyto == false) {
				$mail->AddReplyTo($from, $name);
			} else {
				$mail->AddReplyTo($replyto, $name);
			}

			$mail->AddAddress($to);
			$mail->SetFrom($from, $name);
			$mail->Subject = $subject;

			if ($type == EmailType::HTML) {
				$mail->MsgHTML($content);
			} else {
				$mail->Body = $content;
			}

			$mail->Send();
			$result = true;
		} catch (phpmailerException $e) {
			trigger_error('Email Error: ' . $e->errorMessage(), E_USER_ERROR);
			$result = false;
		} catch (Exception $e) {
			trigger_error('Email Error: ' . $e->getMessage(), E_USER_ERROR);
			$result = false;
		}

		return $result;

	}

}

?>
