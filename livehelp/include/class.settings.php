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

class Setting extends Model {
	public static $_table = 'settings';
	public static $_id_column = 'name';
	public static $_table_use_short_name = true;

	public static function initializeSettings($settings) {

		global $_SETTINGS;
		global $hooks;

		if (!isset($_SETTINGS)) { $_SETTINGS = array(); } else { reset($_SETTINGS); }
		foreach ($settings as $key => $setting) {
			$key = strtoupper($setting->name);
			if (!array_key_exists($key, $_SETTINGS)) {
				$_SETTINGS[$key] = $setting->value;
			}
		}
		unset($setting);

		// Templates
		$_SETTINGS['TEMPLATES'] = array();
		$templatedir = '../templates/';

		if (is_dir($templatedir)) {
			if ($dh = opendir($templatedir)) {
				while (($file = readdir($dh)) !== false) {
					if (is_dir($templatedir . $file) && $file != '.' && $file != '..' && substr($file, 0, 1) != '.') {

						$name = ucwords(str_replace('-', ' ', $file));

						$template = array('name' => $name, 'value' => $file);
						$_SETTINGS['TEMPLATES'][] = $template;
					}
				}
				closedir($dh);
			}
		}

		if ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == '443') {	$protocol = 'https://'; } else { $protocol = 'http://'; }
		$host = str_replace(array('http://', 'https://'), '', $_SETTINGS['URL']);

		$_SETTINGS['HTMLHEAD'] = <<<END
<!--  BEGIN chatstack.com Live Chat HTML Code -->
<script type="text/javascript">
	var Chatstack = { server: '{$host}' };
	(function(d, undefined) {
		// JavaScript
		Chatstack.e = []; Chatstack.ready = function (c) { Chatstack.e.push(c); }
		var b = d.createElement('script'); b.type = 'text/javascript'; b.async = true;
		b.src = ('https:' == d.location.protocol ? 'https://' : 'http://') + Chatstack.server + '/livehelp/scripts/js.min.js';
		var s = d.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(b, s);
	})(document);
</script>
<!--  END chatstack.com Live Chat HTML Code -->
END;

		$_SETTINGS['HTMLBODY'] = '';

		$_SETTINGS['HTMLIMAGE'] = <<<END
<!--  BEGIN chatstack.com Live Chat HTML Code -->
<a href="#" class="LiveHelpButton default"><img src="{$_SETTINGS['URL']}/livehelp/status.php" id="LiveHelpStatusDefault" name="LiveHelpStatusDefault" border="0" alt="Live Help" class="LiveHelpStatus"/></a>
<!--  END chatstack.com Live Chat HTML Code -->
END;

		// Settings Loaded Hook
		$hooks->run('SettingsLoaded', $_SETTINGS);

		$_SETTINGS['LANGUAGE'] = (isset($_SETTINGS['LOCALE'])) ? $_SETTINGS['LOCALE'] : 'en';

		// Override Language
		$dir = dirname(__FILE__);
		$language = isset($_REQUEST['LANGUAGE']) ? $_REQUEST['LANGUAGE'] : false;
		if (!empty($language) && (strlen($language) == 2 || strlen($language) == 5)) {
			if (file_exists($dir . '/../locale/' . $language . '/guest.php') && file_exists($dir . '/../locale/' . $language . '/admin.json')) {
				$_SETTINGS['LOCALE'] = $language;
			} else if (strlen($language) == 5) {
				$language = substr($language, 0, 2);
				if (file_exists($dir . '/../locale/' . $language . '/guest.php') && file_exists($dir . '/../locale/' . $language . '/admin.json')) {
					$_SETTINGS['LOCALE'] = $language;
				}
			}
		}

		if (empty($_SETTINGS['LOCALE'])) { $_SETTINGS['LOCALE'] = 'en'; }
		define('LANGUAGE', $_SETTINGS['LOCALE']);

		// Default Settings
		if (!isset($_SETTINGS['LIMITHISTORY'])) { $_SETTINGS['LIMITHISTORY'] = 0; }
		if (!isset($_SETTINGS['TRANSCRIPTVISITORALERTS'])) { $_SETTINGS['TRANSCRIPTVISITORALERTS'] = false; }

		if (!isset($_SETTINGS['CHATWINDOWWIDTH'])) { $_SETTINGS['CHATWINDOWWIDTH'] = 625; }
		if (!isset($_SETTINGS['CHATWINDOWHEIGHT'])) { $_SETTINGS['CHATWINDOWHEIGHT'] = 435; }
		if (!isset($_SETTINGS['TEMPLATE']) || empty($_SETTINGS['TEMPLATE'])) { $_SETTINGS['TEMPLATE'] = 'default'; }
		if (!isset($_SETTINGS['LOCALE'])) { $_SETTINGS['LOCALE'] = 'en'; } elseif (empty($_SETTINGS['LOCALE'])) { $_SETTINGS['LOCALE'] = 'en'; }
		if (!isset($_SETTINGS['EMAILCOPY'])) { $_SETTINGS['EMAILCOPY'] = false; }

		if (!isset($_SETTINGS['OFFLINEEMAILHEADERIMAGE'])) { $_SETTINGS['OFFLINEEMAILHEADERIMAGE'] = $_SETTINGS['URL'] . '/livehelp/templates/' . $_SETTINGS['TEMPLATE'] . '/locale/' . LANGUAGE . '/images/OfflineEmail.png'; }
		if (!isset($_SETTINGS['OFFLINEEMAILFOOTERIMAGE'])) { $_SETTINGS['OFFLINEEMAILFOOTERIMAGE'] = $_SETTINGS['URL'] . '/livehelp/templates/' . $_SETTINGS['TEMPLATE'] . '/locale/' . LANGUAGE . '/images/LogoFooter.png'; }
		if (!isset($_SETTINGS['CHATTRANSCRIPTHEADERIMAGE'])) { $_SETTINGS['CHATTRANSCRIPTHEADERIMAGE'] = $_SETTINGS['URL'] . '/livehelp/templates/' . $_SETTINGS['TEMPLATE'] . '/locale/' . LANGUAGE . '/images/ChatTranscript.png'; }
		if (!isset($_SETTINGS['CHATTRANSCRIPTFOOTERIMAGE'])) { $_SETTINGS['CHATTRANSCRIPTFOOTERIMAGE'] = $_SETTINGS['URL'] . '/livehelp/templates/' . $_SETTINGS['TEMPLATE'] . '/locale/' . LANGUAGE . '/images/LogoFooter.png'; }
		if (!isset($_SETTINGS['PASSWORDRESETHEADERIMAGE'])) { $_SETTINGS['PASSWORDRESETHEADERIMAGE'] = $_SETTINGS['URL'] . '/livehelp/templates/' . $_SETTINGS['TEMPLATE'] . '/locale/' . LANGUAGE . '/images/PasswordReset.png'; }
		if (!isset($_SETTINGS['PASSWORDRESETFOOTERIMAGE'])) { $_SETTINGS['PASSWORDRESETFOOTERIMAGE'] = $_SETTINGS['URL'] . '/livehelp/templates/' . $_SETTINGS['TEMPLATE'] . '/locale/' . LANGUAGE . '/images/LogoFooter.png'; }
		if (!isset($_SETTINGS['FEEDBACKHEADERIMAGE'])) { $_SETTINGS['FEEDBACKHEADERIMAGE'] = $_SETTINGS['URL'] . '/livehelp/templates/' . $_SETTINGS['TEMPLATE'] . '/locale/' . LANGUAGE . '/images/Feedback.png'; }

		if (!isset($_SETTINGS['APPNAME'])) { $_SETTINGS['APPNAME'] = $_SETTINGS['NAME']; }
		if (!isset($_SETTINGS['ITUNES'])) { $_SETTINGS['ITUNES'] = '359282303'; }
		if (!isset($_SETTINGS['TILEIMAGE'])) { $_SETTINGS['TILEIMAGE'] = './images/Win8Tile.png'; }
		if (!isset($_SETTINGS['TILECOLOR'])) { $_SETTINGS['TILECOLOR'] = '#E2E2E2'; }
		if (!isset($_SETTINGS['CONNECTIONTIMEOUT'])) { $_SETTINGS['CONNECTIONTIMEOUT'] = 30; }
		if (!isset($_SETTINGS['VISITORREFRESH'])) { $_SETTINGS['VISITORREFRESH'] = 15; }
		if (!isset($_SETTINGS['FAVICON'])) { $_SETTINGS['FAVICON'] = $_SETTINGS['URL'] . '/livehelp/admin/favicon.ico'; }
		if (!isset($_SETTINGS['INITIATECHATLOGO'])) { $_SETTINGS['INITIATECHATLOGO'] = ''; }
		if (!isset($_SETTINGS['THEME'])) { $_SETTINGS['THEME'] = 'turquoise'; }

		// DO NOT CHANGE
		if (!isset($_SETTINGS['VISITORTIMEOUT'])) { $_SETTINGS['VISITORTIMEOUT'] = $_SETTINGS['VISITORREFRESH'] * 4.5; }

		// Auto-detect cookie domain / TLD
		if ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == '443') {	$protocol = 'https://'; } else { $protocol = 'http://'; }
		$host = str_replace(array('http://', 'https://'), '', $_SETTINGS['URL']);
		$_SETTINGS['URL'] = $protocol . $host;

		if ($_REQUEST['SERVER'] != '' && $_SERVER['HTTP_HOST'] != 'localhost') {
			$server = $_REQUEST['SERVER'];
			if ($server == '//') {
				$server = '';
			}
		}
		else {

			// Change Server HTTP / HTTPS
			$protocols = array('http://', 'https://');
			if ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == '443') {
				$protocol = 'https://';
				$server = str_replace('http://', $protocol, $_SETTINGS['URL']);
			}
			else {
				$protocol = 'http://';
				$server = str_replace('https://', $protocol, $_SETTINGS['URL']);
			}
		}

		// Override Templates
		if (isset($_REQUEST['TEMPLATE']) && file_exists('templates/' . $_REQUEST['TEMPLATE'] . '/')) {
			$_SETTINGS['TEMPLATE'] = $_REQUEST['TEMPLATE'];
		}
		if (empty($_SETTINGS['TEMPLATE'])) { $_SETTINGS['TEMPLATE'] = 'default'; }
		define('TEMPLATE', $_SETTINGS['TEMPLATE']);

		$language_directory = '/livehelp/locale/' . LANGUAGE . '/images/';
		if (isset($_REQUEST['IMAGES']) && $_REQUEST['IMAGES'] !=''){ $language_directory = $_REQUEST['IMAGES']; }

		$_SETTINGS['LOGO'] = preg_replace('%/?livehelp/locale/[a-zA-Z]{2}/images/%', $language_directory, $_SETTINGS['LOGO']);
		$_SETTINGS['CAMPAIGNIMAGE'] = preg_replace('%/?livehelp/locale/[a-zA-Z]{2}/images/%', $language_directory, $_SETTINGS['CAMPAIGNIMAGE']);
		$_SETTINGS['OFFLINELOGO'] = preg_replace('%/?livehelp/locale/[a-zA-Z]{2}/images/%', $language_directory, $_SETTINGS['OFFLINELOGO']);
		$_SETTINGS['ONLINELOGO'] = preg_replace('%/?livehelp/locale/[a-zA-Z]{2}/images/%', $language_directory, $_SETTINGS['ONLINELOGO']);
		$_SETTINGS['OFFLINEEMAILLOGO'] = preg_replace('%/?livehelp/locale/[a-zA-Z]{2}/images/%', $language_directory, $_SETTINGS['OFFLINEEMAILLOGO']);
		$_SETTINGS['BERIGHTBACKLOGO'] = preg_replace('%/?livehelp/locale/[a-zA-Z]{2}/images/%', $language_directory, $_SETTINGS['BERIGHTBACKLOGO']);
		$_SETTINGS['AWAYLOGO'] = preg_replace('%/?livehelp/locale/[a-zA-Z]{2}/images/%', $language_directory, $_SETTINGS['AWAYLOGO']);

		$timezone = (function_exists('date_default_timezone_get')) ? date_default_timezone_get() : ini_get('date.timezone');
		if (empty($timezone)) {
			if (function_exists('date_default_timezone_set')) {
				if ($_SETTINGS['TIMEZONE'] == 0) {
					$timezone = 'GMT';
				} else {
					$sign = substr($_SETTINGS['TIMEZONE'], 0, 1);
					$hours = substr($_SETTINGS['TIMEZONE'], 1, 2);

					if ($sign == '+') { $sign = '-'; } else { $sign = '+';}
					$timezone = 'Etc/GMT' . $sign . sprintf("%01d", $hours);
				}
				date_default_timezone_set($timezone);
				unset($timezone);
			}
		}
		$_SETTINGS['SERVERTIMEZONE'] = date('O');
	}

}

Setting::$_table = TABLEPREFIX . 'settings';

?>
