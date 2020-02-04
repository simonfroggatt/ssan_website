<?php /* Smarty version 2.6.27, created on 2017-11-18 21:08:33
         compiled from default/header.tpl */ ?>
<?php require_once(SMARTY_CORE_DIR . 'core.load_plugins.php');
smarty_core_load_plugins(array('plugins' => array(array('modifier', 'escape', 'default/header.tpl', 22, false),)), $this); ?>
<!DOCTYPE html>
<html>
<head>
<title><?php echo $this->_tpl_vars['SETTINGS']['NAME']; ?>
</title>
<link href="<?php echo $this->_tpl_vars['basedir']; ?>
templates/<?php echo $this->_tpl_vars['template']; ?>
/styles/bootstrap.min.css" rel="stylesheet" type="text/css"/>
<link href="<?php echo $this->_tpl_vars['basedir']; ?>
templates/<?php echo $this->_tpl_vars['template']; ?>
/styles/flat-ui-pro.min.css" rel="stylesheet" type="text/css"/>
<link href="<?php echo $this->_tpl_vars['basedir']; ?>
styles/styles.php" rel="stylesheet" type="text/css"/>
<link href="<?php echo $this->_tpl_vars['basedir']; ?>
templates/<?php echo $this->_tpl_vars['template']; ?>
/styles/styles.min.css" rel="stylesheet" type="text/css"/>
<script language="JavaScript" type="text/JavaScript" src="<?php echo $this->_tpl_vars['basedir']; ?>
scripts/jquery-latest.js"></script>
<script language="JavaScript" type="text/JavaScript" src="<?php echo $this->_tpl_vars['basedir']; ?>
templates/<?php echo $this->_tpl_vars['template']; ?>
/js/flat-ui-pro.js"></script>
<?php echo '
<script type="text/javascript">
<!--
	var Chatstack = {};
	Chatstack.server = document.location.host + document.location.pathname.substring(0, document.location.pathname.indexOf(\'/livehelp\'));
	Chatstack.visitorTracking = false;
	Chatstack.popup = true;
	Chatstack.sidebar = true;
	Chatstack.embedded = true;
	Chatstack.initiate = false;
	Chatstack.css = false;
	Chatstack.session = '; ?>
'<?php echo ((is_array($_tmp=$this->_tpl_vars['session'])) ? $this->_run_mod_handler('escape', true, $_tmp, 'quotes') : smarty_modifier_escape($_tmp, 'quotes')); ?>
'<?php echo ';
	Chatstack.template = '; ?>
'<?php echo ((is_array($_tmp=$this->_tpl_vars['template'])) ? $this->_run_mod_handler('escape', true, $_tmp, 'quotes') : smarty_modifier_escape($_tmp, 'quotes')); ?>
'<?php echo ';
	Chatstack.department = '; ?>
'<?php echo ((is_array($_tmp=$this->_tpl_vars['department'])) ? $this->_run_mod_handler('escape', true, $_tmp, 'quotes') : smarty_modifier_escape($_tmp, 'quotes')); ?>
'<?php echo ';
	Chatstack.security = '; ?>
'<?php echo ((is_array($_tmp=$this->_tpl_vars['captcha'])) ? $this->_run_mod_handler('escape', true, $_tmp, 'quotes') : smarty_modifier_escape($_tmp, 'quotes')); ?>
'<?php echo ';
	Chatstack.locale = '; ?>
'<?php echo ((is_array($_tmp=$this->_tpl_vars['language'])) ? $this->_run_mod_handler('escape', true, $_tmp, 'quotes') : smarty_modifier_escape($_tmp, 'quotes')); ?>
'<?php echo ';
'; ?>
<?php if ($this->_tpl_vars['connected']): ?><?php echo '	Chatstack.connected = '; ?>
<?php echo $this->_tpl_vars['connected']; ?>
<?php echo ';'; ?>
<?php endif; ?><?php echo '

	(function($) {
		$(function() {
			$(window).ready(function() {
				// JavaScript
				Chatstack.e = []; Chatstack.ready = function (c) { Chatstack.e.push(c); }
				Chatstack.server = Chatstack.server.replace(/[a-z][a-z0-9+\\-.]*:\\/\\/|\\/livehelp\\/*(\\/|[a-z0-9\\-._~%!$&\'()*+,;=:@\\/]*(?![a-z0-9\\-._~%!$&\'()*+,;=:@]))|\\/*$/g, \'\');
				var b = document.createElement(\'script\'); b.type = \'text/javascript\'; b.async = true;
				b.src = (\'https:\' == document.location.protocol ? \'https://\' : \'http://\') + Chatstack.server + \''; ?>
<?php echo $this->_tpl_vars['jspath']; ?>
<?php echo '\';
				var s = document.getElementsByTagName(\'script\')[0];
				s.parentNode.insertBefore(b, s);

				// Select2 Replacement
				$(\'select\').select2({dropdownCssClass: \'dropdown-inverse\'});
			});
		});
	})(jQuery);
-->
</script>
'; ?>

</head>
<body style="background-color: <?php echo $this->_tpl_vars['SETTINGS']['BACKGROUNDCOLOR']; ?>
;" class="LiveHelpPopup">
<div id="LiveHelpContent">