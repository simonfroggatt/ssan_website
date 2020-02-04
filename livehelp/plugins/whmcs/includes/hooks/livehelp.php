<?php
use WHMCS\Config\Setting;
use WHMCS\View\Menu\Item;
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

if (!defined('WHMCS')) {
	die('This file cannot be accessed directly');
}

// Report all PHP errors
//error_reporting(E_ALL);

function hook_livehelpclientarea($vars) {

	/** @var WHMCS\Application $whmcs */
	$whmcs = DI::make('app');

	if (method_exists($whmcs, 'getSystemSSLURL')) {
		$server = $whmcs->getSystemSSLURL() ?: $whmcs->getSystemURL();
	} else {
		$server = $whmcs->getSystemURL();
	}

	if (substr($server, -1) != '/') {
		$server = $server . '/';
	}
	$server .= 'modules/';

	$code = <<<END
<!-- Chatstack - https://www.chatstack.com International Copyright - All Rights Reserved //-->
<!--  BEGIN Chatstack - https://www.chatstack.com Messenger Code - Copyright - NOT PERMITTED TO MODIFY COPYRIGHT LINE / LINK //-->
<a href="#" class="LiveHelpButton default"><img src="{$server}livehelp/status.php" id="LiveHelpStatusDefault" name="LiveHelpStatusDefault" border="0" alt="Live Help" class="LiveHelpStatus"/></a>
<!--  END Chatstack - https://www.chatstack.com Messenger Code - Copyright - NOT PERMITTED TO MODIFY COPYRIGHT LINE / LINK //-->
END;

	return array('livehelp' => $code);

}

function hook_livehelpjscode($vars) {

	/** @var WHMCS\Application $whmcs */
	$whmcs = DI::make('app');

	if (method_exists($whmcs, 'getSystemSSLURL')) {
		$server = $whmcs->getSystemSSLURL() ?: $whmcs->getSystemURL();
	} else {
		$server = $whmcs->getSystemURL();
	}

	if (substr($server, -1) != '/') {
		$server = $server . '/';
	}
	$server .= 'modules/';

	$name = (!empty($vars['clientsdetails']['lastname'])) ? $vars['clientsdetails']['firstname'] . ' ' . $vars['clientsdetails']['lastname'] : $vars['clientsdetails']['firstname'];
	$email = (isset($vars['clientsdetails']['email'])) ? $vars['clientsdetails']['email'] : '';
	$locale = (isset($_SESSION['Language'])) ? $_SESSION['Language'] : Setting::getValue('Language');

	$locale = strtolower($locale);
	switch ($locale) {
		case 'czech':
			$locale = 'cs';
			break;
		case 'danish':
			$locale = 'da';
			break;
		case 'dutch':
			$locale = 'nl';
			break;
		case 'french':
			$locale = 'fr';
			break;
		case 'german':
			$locale = 'de';
			break;
		case 'italian':
			$locale = 'it';
			break;
		case 'norwegian':
			$locale = 'no';
			break;
		case 'portuguese-br':
			$locale = 'pt';
			break;
		case 'portuguese-pt':
			$locale = 'pt';
			break;
		case 'russian':
			$locale = 'ru';
			break;
		case 'spanish':
			$locale = 'es';
			break;
		case 'swedish':
			$locale = 'sv';
			break;
		case 'turkish':
			$locale = 'tr';
			break;
		case 'chinese':
			$locale = 'zh';
			break;
		default:
			$locale = 'en';
			break;
	}

	if ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == '443') {	$protocol = 'https://'; } else { $protocol = 'http://'; }
	$server = str_replace(array('http://', 'https://'), '', $server);

	$jscode = <<<END
<!-- Chatstack - https://www.chatstack.com - Copyright - All Rights Reserved //-->
<!--  BEGIN Chatstack - https://www.chatstack.com - Copyright - NOT PERMITTED TO MODIFY COPYRIGHT LINE / LINK //-->
<script type="text/javascript">
<!--
	var Chatstack = {};
	Chatstack.server = '{$server}';
	Chatstack.embedded = true;
	Chatstack.locale = '{$locale}';
	Chatstack.plugin = 'WHMCS';
	Chatstack.name = '{$name}';
	Chatstack.email = '{$email}';
	(function(d, $, undefined) {
		$(window).ready(function() {
			Chatstack.e = []; Chatstack.ready = function (c) { Chatstack.e.push(c); }
			Chatstack.server = Chatstack.server.replace(/[a-z][a-z0-9+\-.]*:\/\/|\/livehelp\/*(\/|[a-z0-9\-._~%!$&'()*+,;=:@\/]*(?![a-z0-9\-._~%!$&'()*+,;=:@]))|\/*$/g, '');
			var b = document.createElement('script'); b.type = 'text/javascript'; b.async = true;
			b.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + Chatstack.server + '/livehelp/scripts/jquery.livehelp.js';
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(b, s);
		});
	})(document, jQuery);
-->
</script>
<!--  END Chatstack - https://www.chatstack.com - Copyright - NOT PERMITTED TO MODIFY COPYRIGHT LINE / LINK //-->
END;
    return $jscode;
}

function hook_livehelpnavbar(Item $primaryNavbar) {
		$primaryNavbar->addChild(
				'Live-Help-Button',
				array(
						'label' => Lang::trans('liveHelp.chatNow'),
						'uri' => '#',
						'order' => '65',
						'attributes' => array('class' => 'LiveHelpButton'),
				)
		);
}

add_hook('ClientAreaPage', 101 , 'hook_livehelpclientarea');
add_hook('ClientAreaHeadOutput', 100, 'hook_livehelpjscode');
add_hook('ClientAreaPrimaryNavbar', 100, 'hook_livehelpnavbar');

?>
