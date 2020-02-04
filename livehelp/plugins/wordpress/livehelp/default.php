<?php
/*
Plugin Name: Chatstack
Plugin URI: http://livehelp.stardevelop.com/
Description: Chatstack allows you to easily add the live chat HTML code to your WordPress blog.  The JavaScript code will be added and you can also use the Chatstack widget to display the Online / Offline button. Requires the Chatstack Server Software starting at US$99.
Author: Stardevelop Pty Ltd
Version: 2.0
Author URI: http://livehelp.stardevelop.com/
*/

// WordPress JavaScript Action
add_action('wp_print_scripts', 'livehelp_js');
add_action('wp_head', 'livehelp_head');

// Chatstack JavaScript
function livehelp_js()
{
	if (is_admin() || is_feed()) { return; }

	$embedded = true;
	$options = get_option('livehelp_options');

	if ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == '443') {	$protocol = 'https://'; } else { $protocol = 'http://'; }
	if (isset($options['url'])) { $url = $options['url']; }
	if (isset($options['embedded'])) { $embedded = $options['embedded']; }

	// Default Site URL
	if (empty($url)) {
		$url = $protocol . $_SERVER['HTTP_HOST'];
	} else {
		$protocols = array('http://', 'https://');
		$url = str_replace($protocols, $protocol, $url);
	}

}

function livehelp_head()
{

	// Default Site URL
	$url = $_SERVER['HTTP_HOST'];
	$embedded = true;

	$options = get_option('livehelp_options');
	if (isset($options['url'])) { $url = $options['url']; }
	if (isset($options['embedded'])) { $embedded = $options['embedded']; }

	if (empty($url)) {
		$url = $_SERVER['HTTP_HOST'];
	} else {
		$protocols = array('http://', 'https://');
		$url = str_replace($protocols, '', $url);
	}

	echo '<script type="text/javascript">' . "\n";
	echo 'var Chatstack = {};' . "\n";
	echo 'Chatstack.server = \'' . $url . '\';' . "\n";

	// Live Chat Embedded
	if ($embedded == true) {
		echo 'Chatstack.embedded = true;' . "\n";
	}

	echo '(function(d, undefined) {' . "\n";
	echo '	Chatstack.e = []; Chatstack.ready = function (c) { Chatstack.e.push(c); }' . "\n";
	echo '	Chatstack.server = Chatstack.server.replace(/[a-z][a-z0-9+\-.]*:\/\/|\/livehelp\/*(\/|[a-z0-9\-._~%!$&\'()*+,;=:@\/]*(?![a-z0-9\-._~%!$&\'()*+,;=:@]))|\/*$/g, \'\');' . "\n";
	echo '	var b = d.createElement(\'script\'); b.type = \'text/javascript\'; b.async = true;' . "\n";
	echo '	b.src = (\'https:\' == d.location.protocol ? \'https://\' : \'http://\') + Chatstack.server + \'/livehelp/scripts/js.min.js\';' . "\n";
	echo '	var s = d.getElementsByTagName(\'script\')[0];' . "\n";
	echo '	s.parentNode.insertBefore(b, s);' . "\n";
	echo '})(document);' . "\n";
	echo '</script>' . "\n";

}

// Chatstack HTML Code
function livehelp_code()
{
	$options = get_option('livehelp_options');
	$url = $options['url'];

	$code= <<<EOD
<!-- Chatstack - https://www.chatstack.com - Copyright - All Rights Reserved //-->
<!-- BEGIN Chatstack HTML Code - NOT PERMITTED TO MODIFY IMAGE MAP/CODE/LINKS //-->
<a href="#" class="LiveHelpButton" style="border:none"><img src="{$url}/livehelp/status.php" id="LiveHelpStatus" name="LiveHelpStatus" border="0" alt="Live Chat" title="Live Chat" class="LiveHelpStatus"/></a>
<!-- END Chatstack HTML Code - NOT PERMITTED TO MODIFY IMAGE MAP/CODE/LINKS //-->
EOD;
	return $code;
}


/**
 * Chatstack Widget Class
 */
class LiveHelpWidget extends WP_Widget {
    /** constructor */
    function LiveHelpWidget() {
		$opts = array('description' => 'Your Chatstack Online / Offline Chat Button');
        parent::WP_Widget(false, $name = 'Chatstack', $opts);
    }

    /** @see WP_Widget::widget */
    function widget($args, $instance) {
        extract($args);
		if (empty($instance['title'])) { $instance['title'] = ''; }

		$title = apply_filters('widget_title', $instance['title']);
		echo $before_widget;

		if (!empty($title)) {
			echo $before_title . $title . $after_title;
		}
		echo livehelp_code();
		echo $after_widget;
    }

    /** @see WP_Widget::update */
    function update($new_instance, $old_instance) {
        return $new_instance;
    }

    /** @see WP_Widget::form */
    function form($instance) {
		$title = '';
		if (!empty($instance['title'])) {
			$title = esc_attr($instance['title']);
		}
        ?>
            <p><label for="<?php echo $this->get_field_id('title'); ?>"><?php _e('Title:'); ?> <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo $title; ?>" /></label></p>
        <?php
    }

}

// Register Widget widget
add_action('widgets_init', create_function('', 'return register_widget("LiveHelpWidget");'));

// Resister Chatstack Shortcode
add_shortcode('livehelp', 'livehelp_code');

// Chatstack Installation Missing
function livehelp_admin_notices() {

	// Options
	$options = get_option('livehelp_options');
	$url = $options['url'];

	if (empty($url)) {
		// Site URL
		if ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == '443') {	$protocol = 'https://'; } else { $protocol = 'http://'; }
		$url = $protocol . $_SERVER['HTTP_HOST'];
	}

	$script = $url . '/livehelp/scripts/js.min.js';

	// Check URL with cURL etc.
	if (function_exists('curl_init')) {

		$ch = curl_init($script);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		$result = curl_exec($ch);
		$info = @curl_getinfo($ch);
				curl_close ($ch);
				if ($info['http_code'] != 404) {
			return;
		}
		echo '<div class="updated"><p><a href="options-general.php?page=livehelp">Chatstack</a> needs attention: Could not locate the Chatstack Installation at ' . $url . '/livehelp/. Please enter the URL where Chatstack is installed within the Settings.</p></div>';
		return;

	} else {

		if (@fopen($script, 'r') == true) {
			return;
		}
		echo '<div class="error"><p><a href="options-general.php?page=livehelp">Chatstack</a> needs attention: Could not locate the Chatstack Installation at ' . $url . '/livehelp/. Please enter the URL where Chatstack is installed within the Settings.</p></div>';
		return;
	}
}

function livehelp_admin_menu() {
	// Admin Notices
	add_action('admin_notices', 'livehelp_admin_notices');
	add_options_page('Chatstack', 'Chatstack', 'manage_options', 'livehelp', 'livehelp_options_page');
}

// Administration
add_action('admin_menu', 'livehelp_admin_menu');

function livehelp_options_page(){
	echo '<div class="wrap">';
	screen_icon();
	echo '<h2>Chatstack</h2>';
	echo '<form action="options.php" method="post">';
	settings_fields('livehelp_options');
	do_settings_sections('livehelp');
	echo '<input name="Submit" class="button-primary" type="submit" value="'. esc_attr('Save Changes') .'" /></form></div>';
}

// Fill the Menu page with content
function livehelp_admin_init(){

	// Register Settings
	register_setting('livehelp_options', 'livehelp_options', 'livehelp_options_validate');

	// General Settings
	add_settings_section('the_livehelp', '', 'livehelp_details_text', 'livehelp');
	add_settings_field('livehelp_field', 'Chatstack Installation URL', 'livehelp_url_field_display', 'livehelp', 'the_livehelp');
	add_settings_field('livehelp_embedded_field', 'Embedded Chat', 'livehelp_embedded_field_display', 'livehelp', 'the_livehelp');

}
add_action('admin_init', 'livehelp_admin_init');

function livehelp_url_field_display(){

	$options = get_option('livehelp_options');
	$url = $options['url'];

	// Site URL
	if (empty($url)) {
		if ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == '443') {	$protocol = 'https://'; } else { $protocol = 'http://'; }
		$url = $protocol . $_SERVER['HTTP_HOST'];
	}

	$fields = "<input id='livehelp_field' name='livehelp_options[url]' size='40' type='text' value='$url' /> /livehelp/ <span class='description'><br/> Example: <code>http://chat.yourdomain.com/livehelp/</code><br/> The default is <code>$url</code></span>";
	echo $fields;
}

function livehelp_embedded_field_display(){

	$options = get_option('livehelp_options');
	if (!isset($options['embedded'])) {

		echo "<fieldset><label><input id='livehelp_embedded_field' name='livehelp_options[embedded]' type='radio' value='1' checked='checked' />Enabled</label><br/>";
		echo "<label><input id='livehelp_embedded_field' name='livehelp_options[embedded]' type='radio' value='0' />Disabled</label></fieldset>";

	} else {

		if ((bool)$options['embedded'] == true) {
			$enabled = 'checked="checked"';
			$disabled = '';
		} else {
			$enabled = '';
			$disabled = 'checked="checked"';
		}

		echo "<fieldset><label><input id='livehelp_embedded_field' name='livehelp_options[embedded]' type='radio' value='1' $enabled />Enabled</label><br/>";
		echo "<label><input id='livehelp_embedded_field' name='livehelp_options[embedded]' type='radio' value='0' $disabled />Disabled</label></fieldset>";
	}
}

function livehelp_details_text(){

	// Site URL
	if ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || $_SERVER['SERVER_PORT'] == '443') {	$protocol = 'https://'; } else { $protocol = 'http://'; }
	$url = $protocol . $_SERVER['HTTP_HOST'] . '/livehelp';

	echo "<p>Enter the URL where Chatstack is installed.  You only need to setup the URL if your Chatstack is installed on a different server or sub-domain.</p>";
}

function livehelp_options_validate($input){

	// Site URL
	$newinput['url'] = esc_url_raw(trim($input['url']));

	// Live Chat Embedded
	if ($input['embedded'] == '0' || $input['embedded'] == '1') {
		$newinput['embedded'] = (bool)$input['embedded'];
	}

	return $newinput;
}

?>
