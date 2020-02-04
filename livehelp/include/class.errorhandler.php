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

class ErrorHandler {

	// User defined error handling function
	static function handler($errno, $errmsg, $filename, $linenum, $vars) {

		global $logfile;

		// Define an assoc array of error string
		// in reality the only entries we should
		// consider are 2,8,256,512 and 1024
		$errortype = array (
			1 => 'Error',
			2 => 'Warning',
			4 => 'Parsing Error',
			8 => 'Notice',
			16 => 'Core Error',
			32 => 'Core Warning',
			64 => 'Compile Error',
			128 => 'Compile Warning',
			256 => 'User Error',
			512 => 'User Warning',
			1024 => 'User Notice',
			2048 => 'Strict Error',
			4096 => 'Recoverable Error',
			8192 => 'Depreciated',
			16384 => 'User Depreciated',
			30719 => 'All Errors',
			32767 => 'All Errors'
		);

		$date = date('Y-m-d H:i:s');
		$trace = debug_backtrace();

		$file = ''; $line = ''; $function = '';
		foreach ($trace as $key => $value) {
			if (is_array($value)) {
				if (isset($value['file'])) { $file = $value['file']; }
				if (isset($value['line'])) { $line = $value['line']; }
				if (isset($value['function'])) { $function = $value['function']; }
			}
		}

		$data = array(
			'date' => $date,
			'error' => array('type' => $errortype, 'code' => $errno),
			'message' => $errmsg,
			'filename' => $filename,
			'line' => $linenum
		);

		$error = "$date PHP {$errortype[$errno]}: $errmsg $filename at line $linenum";
		if (!empty($file) && !empty($line)) {
			$error .= " (Debug Trace: $function() at line $line within $file)";
			$data['trace'] = array(
				'function' => $function,
				'filename' => $file,
				'line' => $line
			);
		}

		if (isset($_SERVER['HTTP_HOST']) && isset($_SERVER['REQUEST_URI'])) {
			$error .= sprintf(' from %s/%s', $_SERVER['HTTP_HOST'], $_SERVER['REQUEST_URI']);
			$data['host'] = $_SERVER['HTTP_HOST'];
			$data['uri'] = $_SERVER['REQUEST_URI'];
		}
		$error .= "\n";

		// Save Error
		if (!empty($logfile)) {
			error_log($error, 3, $logfile);
		}

	}
}

?>
