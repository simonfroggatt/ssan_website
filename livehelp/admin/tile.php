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
require_once('../include/database.php');
require_once('../include/core.config.php');
require_once('../include/class.models.php');
require_once('../include/version.php');
require_once('../include/core.functions.php');

// TODO Add Security Token Setting

if ((function_exists('imagepng') || function_exists('imagejpeg')) && function_exists('imagettftext')) {

	function imagecopymerge_alpha($dst_im, $src_im, $dst_x, $dst_y, $src_x, $src_y, $src_w, $src_h, $pct){
		$cut = imagecreatetruecolor($src_w, $src_h);
		imagecopy($cut, $dst_im, 0, 0, $dst_x, $dst_y, $src_w, $src_h);
		imagecopy($cut, $src_im, 0, 0, $src_x, $src_y, $src_w, $src_h);
		imagecopymerge($dst_im, $cut, $dst_x, $dst_y, 0, 0, $src_w, $src_h, $pct);
	}

	function imagettftextsp($image, $size, $angle, $x, $y, $color, $font, $text, $spacing = 0) {
		if ($spacing == 0) {
			imagettftext($image, $size, $angle, $x, $y, $color, $font, $text);
		} else {
			$temp_x = $x;
			for ($i = 0; $i < strlen($text); $i++) {
				$bbox = imagettftext($image, $size, $angle, $temp_x, $y, $color, $font, $text[$i]);
				$temp_x += $spacing + ($bbox[2] - $bbox[0]);
			}
		}
	}

	function hex2rgb($hex) {
		$color = str_replace('#','',$hex);
		$rgb = array(hexdec(substr($color,0,2)), hexdec(substr($color,2,2)), hexdec(substr($color,4,2)));
		return $rgb;
	}

	// Total Visitors
	$visitors = Visitor::where_gt('refresh', date('Y-m-d H:i:s', time() - $_SETTINGS['VISITORTIMEOUT']))
		->where('status', 0)
		->order_by_asc('id')
		->count();

	if (file_exists('../plugins/cloud/admin.js')) {
		$cloud = Visitor::where('status', 2)
			->order_by_asc('id')
			->count();
		$visitors += $cloud;
	}

	// Chatting Visitors
	$chats = Chat::where_gt('active', 0)
		->where_gt('refresh', date('Y-m-d H:i:s', time() - $_SETTINGS['CONNECTIONTIMEOUT']))
		->order_by_asc('username')
		->count();

	$rgb = hex2rgb('#E2E2E2');
	$image = imagecreatetruecolor(310, 150);
	$bg = imagecolorallocate($image, $rgb[0], $rgb[1], $rgb[2]);
	imagefilledrectangle($image, 0, 0, 310, 150, $bg);

	imagealphablending($image, true);
	imagesavealpha($image, true);

	// Transparent Background
	//imagecolortransparent($image, $bg);

	$insert = imagecreatefrompng('images/Win8TileWide.png');
	$x = imagesx($insert);
	$y = imagesy($insert);
	imagecopymerge_alpha($image, $insert, 0, 0, 0, 0, $x, $y, 100);
	imagedestroy($insert);

	$insert = imagecreatefrompng('images/VisitorsTotal.png');
	$x = imagesx($insert);
	$y = imagesy($insert);
	imagecopymerge_alpha($image, $insert, 130, 90, 0, 0, $x, $y, 100);
	imagedestroy($insert);

	$insert = imagecreatefrompng('images/ChatsTotal.png');
	$x = imagesx($insert);
	$y = imagesy($insert);
	imagecopymerge_alpha($image, $insert, 220, 90, 0, 0, $x, $y, 100);
	imagedestroy($insert);

	// Create Random Angle
	$size = 32;
	$color = imagecolorallocate($image, 170, 170, 170);
	$path = dirname(__FILE__);
	if (substr($path, 0, 2) == '\\\\') { $path = '//' . substr($path, 2); }

	if (substr($path, -1) == '/') {
		$font = $path . '../styles/fonts/SourceSansPro-ExtraLight.ttf';
	} else {
		$font = $path . '/../styles/fonts/SourceSansPro-ExtraLight.ttf';
	}

	// Visitor Total
	imagettftextsp($image, $size, 0, 165, 120, $color, $font, (string)$visitors, 4);

	// Chats Total
	imagettftextsp($image, $size, 0, 260, 120, $color, $font, (string)$chats, 4);

	if (function_exists('imagepng')) {
		// Output GIF Image
		header('Content-Type: image/png');
		imagepng($image);
	}
	elseif (function_exists('imagejpeg')) {
		// Output JPEG Image
		header('Content-Type: image/jpeg');
		imagejpeg($image, '', 100);
	}

	// Destroy the image to free memory
	imagedestroy($image);
	exit();

}
else {

	if (strpos(php_sapi_name(), 'cgi') === false ) { header('HTTP/1.0 404 Not Found'); } else { header('Status: 404 Not Found'); }
	exit;

}

?>
