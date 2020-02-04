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
require_once('./include/core.config.php');
require_once('./include/class.models.php');
require_once('./include/core.functions.php');
require_once('./include/version.php');

$_REQUEST = array_change_key_case($_REQUEST, CASE_LOWER);

if (!isset($_REQUEST['id'])){ $_REQUEST['id'] = 0; }
if (!isset($_REQUEST['size'])){ $_REQUEST['size'] = -1; }
if (!isset($_REQUEST['default'])){ $_REQUEST['default'] = ''; }
if (!isset($_REQUEST['department'])){ $_REQUEST['department'] = ''; }

// Account Image Options Override Hook
$options = $hooks->run('ProfileImageOptionsOverride');

// Hook Options
if (isset($options['id'])) {
	$id = $options['id'];
}
if (isset($options['round'])) {
	$round = $options['round'];
}
if (isset($options['override'])) {
	$override = $options['override'];
}
if (isset($options['size'])) {
	$size = $options['size'];
}

// Default Options
$user = false;
$id = (!isset($id)) ? $_REQUEST['id'] : $id;
$size = (!isset($size)) ? $_REQUEST['size'] : $size;
$default = $_REQUEST['default'];

if (!isset($round)) {
	$round = (isset($_REQUEST['round'])) ? true : false;
}

if (!isset($override)) {
	$override = isset($_REQUEST['override']) ? true : false;
}

if (isset($_SETTINGS['INITIATECHATLOGO']) && strlen($_SETTINGS['INITIATECHATLOGO']) > 0) {
	$_SETTINGS['DEFAULTUSERIMAGE'] = $_SETTINGS['INITIATECHATLOGO'];
}

$updated = '';
$department = trim($_REQUEST['department']);

if (!isset($_SETTINGS['DEFAULTUSERIMAGE'])) {
	$_SETTINGS['DEFAULTUSERIMAGE'] = './images/User.png';
}

if ($id > 0) {
	$user = Operator::where_id_is($id)->find_one();
} else {

	// Operators
	$id = 0;
	$online = array();
	$offline = array();

	// Online Operators
	$users = Operator::find_many();
	foreach ($users as $key => $user) {
		if ($user->status() == 1) {
			if (!empty($department) && $user->has_department($user, $department)) {
				$online[] = $user->id;
			} else {
				$online[] = $user->id;
			}
		} else {
			if (!empty($department) && $user->has_department($user, $department)) {
				$offline[] = $user->id;
			} else {
				$offline[] = $user->id;
			}
		}
	}

	if (count($online) > 0) {
		$id = $online[array_rand($online)];
		$user = Operator::where_id_is($id)->find_one();
	} else if (count($offline) > 0) {
		$id = $offline[array_rand($offline)];
		$user = Operator::where_id_is($id)->find_one();

		// Override Default Image
		if (isset($_SETTINGS['OVERRIDEDEFAULTUSERIMAGE'])) {
			$override = true;
			$_SETTINGS['DEFAULTUSERIMAGE'] = $_SETTINGS['OVERRIDEDEFAULTUSERIMAGE'];
		}
	}

}

$im = false;
$image = false;
if ($user !== false && !empty($user->image)) {
	$image = $user->image;
	$updated = $user->updated;
}

// Force Default
if ($override) {
	$image = '';
}

// Cache Image
$updated = strtotime($updated);
header('Cache-Control: public');
header('Expires: ' . date(DATE_RFC822, strtotime('+2 day')));
header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $updated) . ' GMT', true, 200);

// Last Modified
if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) && (strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']) == $updated)) {
	header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $updated) . ' GMT', true, 304);
	exit();
}

if (!empty($image)) {
	if (strpos($image, 'https://') !== false) {
		if ($size <= 100) {
			$image = str_replace('.png', '-100px.png', $image);
		}
		header('Location: ' . $image);
		exit;
	} else {
		$im = imagecreatefromstring(base64_decode($image));
	}
} else {
	if ($default == '404') {
		header('HTTP/1.0 404 Not Found');
		exit();
	}
	$im = @imagecreatefrompng($_SETTINGS['DEFAULTUSERIMAGE']);
}

if ($im == false) {
	if ($default == '404') {
		header('HTTP/1.0 404 Not Found');
		exit();
	}
	$im = @imagecreatefrompng($_SETTINGS['DEFAULTUSERIMAGE']);
}

if ($im != false) {
	if ($size > 0) {
		$width = imagesx($im);
		$height = imagesy($im);
		$aspect = $height / $width;

		if ($width <= $size) {
			$neww = $width;
			$newh = $height;
		} else {
			$neww = $size;
			$newh = abs($neww * $aspect);
		}

		# Round Image
		if ($round == true) {
			do {
				$r = rand(0, 255);
				$g = rand(0, 255);
				$b = rand(0, 255);
			}
			while (imagecolorexact($im, $r, $g, $b) < 0);

			$mask = imagecreatetruecolor($width, $height);
			$alphamaskcolor = imagecolorallocate($mask, $r, $g, $b);
			imagecolortransparent($mask, $alphamaskcolor);
			imagefilledellipse($mask, $width / 2, $height / 2, $width, $height, $alphamaskcolor);
			imagecopymerge($im, $mask, 0, 0, 0, 0, $width, $height, 100);

			imagedestroy($mask);

			$alphacolor = imagecolorallocatealpha($im, $r, $g, $b, 127);
			imagefill($im, 0, 0, $alphacolor);
			imagefill($im, $width - 1, 0, $alphacolor);
			imagefill($im, 0, $height - 1, $alphacolor);
			imagefill($im, $width - 1, $height - 1, $alphacolor);
			imagecolortransparent($im, $alphacolor);

		}

		$profile = imagecreatetruecolor($neww, $newh);

		imagealphablending($profile, false);
		imagesavealpha($profile, true);

		// Preserve Transparency
		//imagecolortransparent($profile, imagecolorallocate($profile, 0, 0, 0));

		# Resize
		imagecopyresampled($profile, $im, 0, 0, 0, 0, $neww, $newh, $width, $height);

		# Content Type Header
		header('Content-Type: image/png');

		# Output the image
		imagepng($profile);

		# Free Memory
		imagedestroy($im);
		imagedestroy($profile);


	} else {

		# Content Type Header
		header('Content-Type: image/png');

		imagealphablending($im, false);
		imagesavealpha($im, true);

		# Output the image
		imagepng($im);

		# Free Memory
		imagedestroy($im);

	}
} else {
	if ($default == '404') {
		header('HTTP/1.0 404 Not Found');
		exit();
	}
	header('Location: ' . $_SETTINGS['DEFAULTUSERIMAGE']);
	exit();
}

?>
