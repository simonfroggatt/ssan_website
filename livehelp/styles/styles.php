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

$installed = false;
$database = require_once('../include/database.php');
if ($database) {
	include('../include/spiders.php');
	require_once('../include/class.aes.php');
	include('../include/class.cookie.php');
	$installed = require_once('../include/core.config.php');
} else {
	$installed = false;
}

if ($installed == false) {
	header('Location: ./default.php');
}

header('Content-type: text/css');

if (defined('LANGUAGE')) {
	include('../locale/' . LANGUAGE . '/guest.php');
} else {
	include('../locale/en/guest.php');
}

if (!isset($_SETTINGS['DIRECTION'])) { $_SETTINGS['DIRECTION'] = 'ltr'; }
?>
html, body {
	height: 100%;
	margin: 0;
}
div, p, td {
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	font-size: <?php echo($_SETTINGS['FONTSIZE']); ?>;
	color: <?php echo($_SETTINGS['FONTCOLOR']); ?>;
	direction: <?php echo($_SETTINGS['DIRECTION']); ?>;
}
body {
	background-color: <?php echo($_SETTINGS['BACKGROUNDCOLOR']); ?>;
	color: <?php echo($_SETTINGS['FONTCOLOR']); ?>;
	min-width: 100%;
	width: 100%;
}
input, textarea {
	font-family:<?php echo($_SETTINGS['CHATFONT']); ?>;
    font-size: <?php echo($_SETTINGS['CHATFONTSIZE']); ?>;
}
a.normlink:link, a.normlink:visited, a.normlink:active {
	color: <?php echo($_SETTINGS['LINKCOLOR']); ?>;
	text-decoration: none;
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	border-bottom-width: 0.05em;
	border-bottom-style: solid;
	border-bottom-color: #CCCCCC;
}
a.normlink:hover {
	color: <?php echo($_SETTINGS['LINKCOLOR']); ?>;
	text-decoration: none;
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	border-bottom-width: 0.05em;
	border-bottom-style: solid;
	border-bottom-color: <?php echo($_SETTINGS['LINKCOLOR']); ?>;
}
.heading {
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	font-size: 16px;
}
.small {
	font-size: 10px;
}
.headingusers {
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	font-size: 18px;
}
.smallusers {
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	font-size: 10px;
	color: #CBCBCB;
}
.message {
	font-family: <?php echo($_SETTINGS['CHATFONT']); ?>;
	font-size: <?php echo($_SETTINGS['CHATFONTSIZE']); ?>;
}
a:link, a:visited, a:active {
	color: <?php echo($_SETTINGS['LINKCOLOR']); ?>;
	text-decoration: none;
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	border-bottom-width: 0.05em;
	border-bottom-style: solid;
	border-bottom-color: #CCCCCC;
}
a:hover {
	color: <?php echo($_SETTINGS['LINKCOLOR']); ?>;
	text-decoration: none;
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	border-bottom-width: 0.05em;
	border-bottom-style: solid;
	border-bottom-color: <?php echo($_SETTINGS['LINKCOLOR']); ?>;
}
.message {
	font-family: <?php echo($_SETTINGS['CHATFONT']); ?>;
	font-size: <?php echo($_SETTINGS['CHATFONTSIZE']); ?>;
	margin: 0px;
	margin-bottom: 5px;
}
a.message:link, a.message:visited, a.message:active {
	color: <?php echo($_SETTINGS['LINKCOLOR']); ?>;
	text-decoration: none;
	font-family: <?php echo($_SETTINGS['CHATFONT']); ?>;
	font-size: <?php echo($_SETTINGS['CHATFONTSIZE']); ?>;
	border-bottom-width: 0.05em;
	border-bottom-style: solid;
	border-bottom-color: #CCCCCC;
}
a.message:hover {
	color: <?php echo($_SETTINGS['LINKCOLOR']); ?>;
	text-decoration: none;
	font-family: <?php echo($_SETTINGS['CHATFONT']); ?>;
	font-size: <?php echo($_SETTINGS['CHATFONTSIZE']); ?>;
	border-bottom-width: 0.05em;
	border-bottom-style: solid;
	border-bottom-color: <?php echo($_SETTINGS['LINKCOLOR']); ?>;
}
a.tooltip {
	position: relative;
	font-family: <?php echo($_SETTINGS['FONT']); ?>;
	font-size: 10px;
	z-index: 100;
	color: #000000;
	text-decoration: none;
	border-bottom-width: 0.05em;
	border-bottom-style: dashed;
	border-bottom-color: #CCCCCC;
}
a.tooltip:hover {
	z-index: 150;
	background-color: #FFFFFF;
}
a.tooltip span {
	display: none
}
a.tooltip:hover span {
    display: block;
    position: absolute;
    top: 15px;
	left: -100px;
	width: 175px;
	padding: 5px;
	margin: 10px;
    border: 1px dashed #339;
    background-color: #E8EAFC;
	color: #000000;
    text-align: center
}
.box {
	background: #FAF6F7;
	border: 1px solid #ddd;
	padding: 5px;
	font-family: Verdana, Arial, Helvetica, sans-serif;
	font-size: 11px;
	text-align: justify;
	width: 95%;
	margin: 5px;
}


/* BubbleTip CSS */
.bubbletip {
	position: absolute;
	z-index: 90000000;
	width: auto;
	border-collapse: collapse;
	margin: 0;
	border: none;
	-webkit-border-radius: 0; -moz-border-radius: 0; border-radius: 0;
}
.bubbletip td, .bubbletip th, .bubbletip table, .bubbletip table td, .bubbletip table th {
	border: none;
	margin: 0;
	padding: 0;
	width: auto;
	line-height: normal;
}
.bubbletip td.bt-topleft {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll 0px 0px;
	height: 33px;
	width: 33px;
}
.bubbletip td.bt-top {
	background: transparent url(../images/bubbletip/bubbletip-T-B.png) repeat-x scroll 0px 0px;
	height: 33px;
}
.bubbletip td.bt-topright {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll -73px 0px;
	height: 33px;
	width: 33px;
}
.bubbletip td.bt-left-tail div.bt-left, .bubbletip td.bt-left {
	background: transparent url(../images/bubbletip/bubbletip-L-R.png) repeat-y scroll 0px 0px;
	width: 33px;
}
.bubbletip td.bt-left-tail div.bt-left-tail {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll 0px -33px;
	width: 33px;
	height: 40px;
}
.bubbletip td.bt-right-tail div.bt-right, .bubbletip td.bt-right {
	background: transparent url(../images/bubbletip/bubbletip-L-R.png) repeat-y scroll -33px 0px;
	width: 33px;
}
.bubbletip td.bt-right-tail div.bt-right-tail {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll -73px -33px;
	width: 33px;
	height: 40px;
}
.bubbletip td.bt-bottomleft {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll 0px -73px;
	height: 33px;
	width: 33px;
}
.bubbletip td.bt-bottom {
	background: transparent url(../images/bubbletip/bubbletip-T-B.png) repeat-x scroll 0px -33px;
	height: 33px;
}
.bubbletip td.bt-bottomright {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll -73px -73px;
	height: 33px;
	width: 33px;
}
.bubbletip table.bt-top, .bubbletip table.bt-bottom {
	width: 100%;
}
.bubbletip table.bt-top th {
	width: 50%;
	background: transparent url(../images/bubbletip/bubbletip-T-B.png) repeat-x scroll 0px 0px;
}
.bubbletip table.bt-bottom th {
	width: 50%;
	background: transparent url(../images/bubbletip/bubbletip-T-B.png) repeat-x scroll 0px -33px;
}
.bubbletip table.bt-top td div {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll -33px 0px;
	width: 40px;
	height: 33px;
}
.bubbletip table.bt-bottom td div {
	background: transparent url(../images/bubbletip/bubbletip.png) no-repeat scroll -33px -73px;
	width: 40px;
	height: 33px;
}
.bubbletip td.bt-content {
	background-color: #fff;
	vertical-align: middle;
}
#SmiliesTooltip span, .Smilie {
	display: inline-block;
	margin: 1px;
}

/* Flat UI Override Styles */
.form-group {
	margin-bottom: 6px;
}
.input-error {
	display: none;
	position: absolute;
	right: 5px;
	top: 5px;
}
.select-default .select2-choice {
	color: #b6bcce;
  background-color: #fff;
  border: 2px solid #bdc3c7;
  border-radius: 6px;
}
.select-default .select2-choice .select2-arrow {
  border-top-color: #bdc3c7;
}
.select-default .select2-choice:hover, .select-default .select2-choice.hover, .select-default .select2-choice:focus, .select-default .select2-choice:active {
	color: #8f9396;
  background-color: #fff;
  border: 2px solid #8f9396;
}
