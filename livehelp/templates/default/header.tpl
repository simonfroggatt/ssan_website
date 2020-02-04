<!DOCTYPE html>
<html>
<head>
<title>{$SETTINGS.NAME}</title>
<link href="{$basedir}templates/{$template}/styles/bootstrap.min.css" rel="stylesheet" type="text/css"/>
<link href="{$basedir}templates/{$template}/styles/flat-ui-pro.min.css" rel="stylesheet" type="text/css"/>
<link href="{$basedir}styles/styles.php" rel="stylesheet" type="text/css"/>
<link href="{$basedir}templates/{$template}/styles/styles.min.css" rel="stylesheet" type="text/css"/>
<script language="JavaScript" type="text/JavaScript" src="{$basedir}scripts/jquery-latest.js"></script>
<script language="JavaScript" type="text/JavaScript" src="{$basedir}templates/{$template}/js/flat-ui-pro.js"></script>
{literal}
<script type="text/javascript">
<!--
	var Chatstack = {};
	Chatstack.server = document.location.host + document.location.pathname.substring(0, document.location.pathname.indexOf('/livehelp'));
	Chatstack.visitorTracking = false;
	Chatstack.popup = true;
	Chatstack.sidebar = true;
	Chatstack.embedded = true;
	Chatstack.initiate = false;
	Chatstack.css = false;
	Chatstack.session = {/literal}'{$session|escape:quotes}'{literal};
	Chatstack.template = {/literal}'{$template|escape:quotes}'{literal};
	Chatstack.department = {/literal}'{$department|escape:quotes}'{literal};
	Chatstack.security = {/literal}'{$captcha|escape:quotes}'{literal};
	Chatstack.locale = {/literal}'{$language|escape:quotes}'{literal};
{/literal}{if $connected}{literal}	Chatstack.connected = {/literal}{$connected}{literal};{/literal}{/if}{literal}

	(function($) {
		$(function() {
			$(window).ready(function() {
				// JavaScript
				Chatstack.e = []; Chatstack.ready = function (c) { Chatstack.e.push(c); }
				Chatstack.server = Chatstack.server.replace(/[a-z][a-z0-9+\-.]*:\/\/|\/livehelp\/*(\/|[a-z0-9\-._~%!$&'()*+,;=:@\/]*(?![a-z0-9\-._~%!$&'()*+,;=:@]))|\/*$/g, '');
				var b = document.createElement('script'); b.type = 'text/javascript'; b.async = true;
				b.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + Chatstack.server + '{/literal}{$jspath}{literal}';
				var s = document.getElementsByTagName('script')[0];
				s.parentNode.insertBefore(b, s);

				// Select2 Replacement
				$('select').select2({dropdownCssClass: 'dropdown-inverse'});
			});
		});
	})(jQuery);
-->
</script>
{/literal}
</head>
<body style="background-color: {$SETTINGS.BACKGROUNDCOLOR};" class="LiveHelpPopup">
<div id="LiveHelpContent">
