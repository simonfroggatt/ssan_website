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

require_once('../include/database.php');
require_once('../include/core.config.php');

// WHMCS Licensing Placeholder

if (!empty($_SETTINGS['FORCESSL']) && $_SETTINGS['FORCESSL'] == true && ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'off') || $_SERVER['SERVER_PORT'] !== '443')) {
  header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
  exit();
}

$server = '.';
if (!empty($_SETTINGS['CDN'])) {
  $admin = '/livehelp/admin';
  if (isset($_SETTINGS['ADMINFOLDER'])) {
    $admin = $_SETTINGS['ADMINFOLDER'];
  }
  $server = 'https://' . $_SETTINGS['CDN'] . $admin;
}

$extension = '.min';
if ($_SERVER['QUERY_STRING'] == 'debug') {
  $extension = '';
  $server = '.';
}

if (!isset($language) || !isset($language['username'])) {
  $language = array();
  $language['username'] = 'Username';
}

?>
<!DOCTYPE html>
<!--[if lt IE 7 ]> <html lang="en" class="no-js ie6"> <![endif]-->
<!--[if IE 7 ]>  <html lang="en" class="no-js ie7">  <![endif]-->
<!--[if IE 8 ]>  <html lang="en" class="no-js ie8">  <![endif]-->
<!--[if IE 9 ]>  <html lang="en" class="no-js ie9">  <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en" class="no-js" aria-label="Content View"> <!--<![endif]-->
  <head>

  <meta charset="utf-8">

  <title><?php echo($_SETTINGS['APPNAME']); ?> Web App</title>
  <meta name="description" content="<?php echo($_SETTINGS['APPNAME']); ?> Web App" />
  <meta name="author" content="Stardevelop Pty Ltd" />

<?php
  if (defined('PRODUCTION')) {
?>
  <!-- Stylesheets -->
  <link rel="stylesheet" type="text/css" href="<?php echo($server); ?>/styles/font-awesome/css/font-awesome<?php echo($extension); ?>.css"/>
  <link rel="stylesheet" type="text/css" href="<?php echo($server); ?>/styles/styles<?php echo($extension); ?>.css"/>
<?php

  } else {

?>
  <!-- Stylesheets -->
  <link rel="stylesheet" type="text/css" href="<?php echo($server); ?>/styles/font-awesome/css/font-awesome<?php echo($extension); ?>.css"/>
  <link rel="stylesheet" type="text/css" href="<?php echo($server); ?>/styles/styles<?php echo($extension); ?>.css"/>

<?php

    if (isset($hooks)) {
      $hooks->output('WebAdministrationStyles');
    }
  }

?>

  <!-- Vendor -->
  <script type="text/javascript" src="<?php echo($server); ?>/scripts/vendor<?php echo($extension); ?>.js"></script>

  <!-- JavaScript -->
  <script type="text/javascript" src="<?php echo($server); ?>/scripts/admin.bundle<?php echo($extension); ?>.js"></script>

  <!-- d3.js -->
  <script type="text/javascript" src="./scripts/d3.v2.js"></script>

  <!-- IE9 Web Application Meta Data -->
  <meta name="application-name" content="<?php echo($_SETTINGS['APPNAME']); ?>" />
  <meta name="msapplication-tooltip" content="<?php echo($_SETTINGS['APPNAME']); ?> Web App" />
  <meta name="msapplication-starturl" content="<?php echo($server); ?>/" />
  <meta name="msapplication-starturl" content="<?php echo($server); ?>/index.php" />
  <meta name="msapplication-navbutton-color" content="#69ABCF" />
<?php
  if (isset($_SETTINGS['TILEIMAGE'])) {
?>
  <meta name="msapplication-TileImage" content="<?php echo($_SETTINGS['TILEIMAGE']); ?>"/>
<?php
  }

  if (isset($_SETTINGS['TILECOLOR'])) {
?>
  <meta name="msapplication-TileColor" content="<?php echo($_SETTINGS['TILECOLOR']); ?>"/>
<?php
  }

  if (isset($_SETTINGS['ITUNES'])) {
?>
  <!-- iOS App -->
  <meta name="apple-itunes-app" content="app-id=<?php echo($_SETTINGS['ITUNES']); ?>"/>
<?php
  }

  if (isset($_SETTINGS['FAVICON'])) {
?>
  <link rel="shortcut icon" href="<?php echo($_SETTINGS['FAVICON']); ?>" />
<?php
  }
?>
  <link rel="apple-touch-icon" href="<?php echo($server); ?>/apple-touch-icon.png" />

  </head>

  <body class="body">

    <!-- Alert -->
    <div class="alert"></div>

    <!-- Notifications -->
    <div class="notification">
      <div class="icon sprite-admin ChatNotification"></div>
      <div class="notify"></div>
      <div class="close sprite-admin CloseButtonWhite"></div>
    </div>

    <!-- Login -->
    <div class="loading content">
      <div class="parent">
        <div class="progressring">
          <img src="<?php echo($server); ?>/images/ProgressRing.gif" alt="Loading"/>
        </div>
        <div class="text">
          <div class="title">Loading Live Help</div>
          <div class="description">Thank you for your patience</div>
        </div>
      </div>
    </div>
    <div class="login">
      <div class="logo"></div>
      <div class="inputs">
        <div class="signin container">
          <div class="signin error">
            <span class="text">Incorrect <?php echo $language['username']; ?> / Password</span>
          </div>
          <div class="form signin">
            <div class="server">
              <label for="server">Server</label>
              <input id="server" name="server" type="text" />
            </div>
            <div class="username">
              <label for="username"><?php echo $language['username']; ?></label>
              <input id="username" name="username" type="text" tabindex="1" />
            </div>
            <div class="password">
              <label for="password">Password <a href="#" class="reset password" tabindex="8">Reset Password</a></label>
              <input id="password" name="password" type="password" tabindex="2" />
            </div>
            <label for="status">Status Mode</label>
            <select id="status" name="status" class="status" tabindex="3">
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="BRB">Be Right Back</option>
              <option value="Away">Away</option>
            </select>
            <div class="ssl">
              <input id="ssl" name="ssl" type="checkbox" tabindex="4" />
              <label for="ssl">Secure (SSL)</label>
            </div>
            <div class="remember">
              <input id="remember" name="remember" type="checkbox" tabindex="5" />
              <label for="remember">Remember for 14 days</label>
            </div>
          </div>
          <div class="form reset">
            <div class="header">Reset Password</div>
            <div>We'll email you instructions on how to reset your password.</div>
            <label for="username" class="username"><?php echo $language['username']; ?></label>
            <input id="username" name="username" type="text" class="username" />
            <label for="email" class="email">Email</label>
            <input id="email" name="email" type="text" class="email" />
          </div>
          <div class="form twofactor">
            <div class="twofactor signin">
              <div class="header">Enter your security code</div>
              <div>Open your Google Authenticator or Microsoft Authenticator app to view your security code.</div>
              <div class="error">
                <span class="text">Invalid Security Code</span>
              </div>
              <div class="security">
                <label for="security">Security Code</label>
                <input id="security" name="security" type="password" />
                <div>Lost your mobile device? <a href="#" class="disable twofactor" tabindex="8">Disable verification</a></div>
              </div>
            </div>
            <div class="twofactor disable">
              <div class="header">Disable two-step verification</div>
              <div>Enter your emergency backup code to disable two-step verification.</div>
              <div class="backup error">
                <span class="text">Invalid Backup Code</span>
              </div>
              <div class="signin error">
                <span class="text">Incorrect <?php echo $language['username']; ?> / Password</span>
              </div>
              <label for="username"><?php echo $language['username']; ?></label>
              <input id="username" name="username" type="text" />
              <label for="password">Password</label>
              <input id="password" name="password" type="password" />
              <label for="backupcode">Backup Code</label>
              <input id="backupcode" name="backupcode" type="text" />
            </div>
          </div>
        </div>
        <div class="btn-toolbar signin">
          <button class="btn btn-large clear" tabindex="7">Clear</button>
          <button class="btn btn-large btn-info signin" tabindex="6">Sign In</button>
        </div>
        <div class="btn-toolbar reset">
          <button class="btn btn-large back">&larr; Back to Sign In</button>
          <button class="btn btn-large btn-info reset">Reset Password</button>
        </div>
      </div>
      <div class="browsers">Please use the latest version of Internet Explorer (9 or above), Google Chrome, Firefox or Safari</div>
      <div class="footer"></div>
    </div>

    <div class="dashboard content dark">

      <!-- Visitor / Chats Totals -->
      <!--
      <div class="totals">
        <div title="Browsing Visitors" class="sprite-admin VisitorsTotal"></div>
        <div id="visitortotal" class="visitors" title="Browsing Visitors">0</div>
        <div title="Chatting Visitors" class="sprite-admin ChatsTotal"></div>
        <div id="chatstotal" class="chats" title="Chatting Visitors">0</div>
      </div>
      -->

      <!-- Chatting / Pending Visitors -->
      <div class="sidebar">
        <!-- Operator -->
        <div class="operator">
          <div class="photo"></div>
          <div class="name">Administrator Account</div>
          <div class="btn-group dropup">
            <div class="dropdown-toggle dropup" data-toggle="dropdown">
              <span class="mode"></span><span class='status'>Online</span> <span class="caret sprite-admin sort-desc"></span>
            </div>
            <ul class="dropdown-menu statusmode">
              <li class="online"><a href="#" class="Online" data-lang-key="online">Online</a></li>
              <li class="offline"><a href="#" class="Offline" data-lang-key="offline">Offline</a></li>
              <li class="brb"><a href="#" class="BRB" data-lang-key="brb">Be Right Back</a></li>
              <li class="away"><a href="#" class="Away" data-lang-key="away">Away</a></li>
              <li class="divider"></li>
              <li><a href="#" class="Accounts" data-lang-key="accounts">Accounts</a></li>
              <li><a href="#" class="History" data-lang-key="history">History</a></li>
              <li><a href="#" class="Responses" data-lang-key="responses">Responses</a></li>
              <li><a href="#" class="Settings" data-lang-key="settings">Settings</a></li>
              <li class="divider"></li>
              <li><a href="#" class="Signout" data-lang-key="signout">Sign Out</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="logo"></div>
      <div class="sidebar-icons">
        <a href="#" data-type="home" class="home menu"><div class="icon" title="Home"></div></a>
        <a href="#" data-type="statistics" class="statistics menu"><div class="icon" title="Statistics"></div></a>
        <a href="#" data-type="history" class="history menu"><div class="icon" title="History"></div></a>
        <a href="#" data-type="responses" class="responses menu"><div class="icon" title="Pre-typed Responses"></div></a>
        <a href="#" data-type="accounts" class="accounts menu"><div class="icon" title="Accounts"></div></a>
        <a href="#" data-type="settings" class="settings menu"><div class="icon" title="Settings"></div></a>
      </div>
      <div id="chat-list" class="scroll chat-list">
        <div class="chat-list-heading pending"><span data-lang-key="pendingvisitors">Waiting Customers</span><div class="expander sprite-admin sort-asc"></div></div>
        <div id="pending" class="pending list" data-height="38">
          <div class="no-visitor">
            <span data-lang-key="novisitors">No Visitors</span>
          </div>
        </div>
        <div class="chat-list-heading chatting"><span data-lang-key="customers">Customers</span><div class="expander sprite-admin sort-asc"></div></div>
        <div id="chatting" class="chatting list" data-height="38">
          <div class="no-visitor">
            <span data-lang-key="novisitors">No Visitors</span>
          </div>
        </div>
        <div class="chat-list-heading other-chatting"><span data-lang-key="otherchattingvisitors">Other Customers</span><div class="expander sprite-admin sort-desc"></div></div>
        <div id="other-chatting" class="other-chatting list" data-height="38">
          <div class="no-visitor">
            <span data-lang-key="novisitors">No Visitors</span>
          </div>
        </div>
        <div class="chat-list-heading operators"><span data-lang-key="teammembers">Operators</span><div class="expander sprite-admin sort-asc"></div></div>
        <div id="operators" class="operators list" data-height="38">
          <div class="no-visitor">
            <span data-lang-key="nooperators">No Operators</span>
          </div>
        </div>
        <div class="empty">Hmm? Looks like there's no chats here</div>
      </div>

      <!-- Current Chat -->
      <div id="chat-stack" class="chat-stack">
        <div class="messages input">
          <div class="search button">
            <i class="fa fa-search"></i>
          </div>
          <textarea class="input-xlarge" id="message"></textarea>
          <div class="btn-smilies">
            <div class="smilies parent">
              <div class="smilies button sprite-admin Smilies" title="Smilies"></div>
            </div>
            <input type="text" class="emoji" />
          </div>
        </div>
        <div class="closing-chat dialog">
          <div class="progressring">
            <img src="<?php echo($server); ?>/images/ProgressRing.gif" alt="Loading"/>
          </div>
          <div style="position:absolute; top: 30px; left:50px">
            <div class="title">Closing Chat</div>
            <div class="description">One moment while the chat is closed.</div>
          </div>
          <div class="btn unblock" title="Unblock Chat" style="position: absolute; right: 15px; bottom: 15px; display:none">Unblock Chat</div>
        </div>
        <div class="chat loading"></div>
        <div class="confirm-close dialog">
          <div class="progressring">
            <img src="<?php echo($server); ?>/images/ProgressRing.gif" alt="Loading"/>
          </div>
          <div style="position:absolute; top:10px; left:50px">
            <div class="title">Confirm Close Chat</div>
            <div class="description">Are you sure that you wish to close this chat?</div>
          </div>
          <div style="position:absolute; bottom:15px; right:15px" class="buttons">
            <div class="accept-button delete sprite-admin AcceptButton" style="position: relative; margin:3px; display: inline-block" title="Delete"></div>
            <div class="cancel-button cancel sprite-admin CancelButton" style="position: relative; margin:3px; display: inline-block" title="Cancel"></div>
          </div>
        </div>
        <div id="SmiliesTooltip">
          <div><span title="Laugh" class="sprite-admin Laugh Small"></span><span title="Smile" class="sprite-admin Smile Small"></span><span title="Sad" class="sprite-admin Sad Small"></span><span title="Money" class="sprite-admin Money Small"></span><span title="Impish" class="sprite-admin Impish Small"></span><span title="Sweat" class="sprite-admin Sweat Small"></span><span title="Cool" class="sprite-admin Cool Small"></span><br/><span title="Frown" class="sprite-admin Frown Small"></span><span title="Wink" class="sprite-admin Wink Small"></span><span title="Surprise" class="sprite-admin Surprise Small"></span><span title="Woo" class="sprite-admin Woo Small"></span><span title="Tired" class="sprite-admin Tired Small"></span><span title="Shock" class="sprite-admin Shock Small"></span><span title="Hysterical" class="sprite-admin Hysterical Small"></span><br/><span title="Kissed" class="sprite-admin Kissed Small"></span><span title="Dizzy" class="sprite-admin Dizzy Small"></span><span title="Celebrate" class="sprite-admin Celebrate Small"></span><span title="Angry" class="sprite-admin Angry Small"></span><span title="Adore" class="sprite-admin Adore Small"></span><span title="Sleep" class="sprite-admin Sleep Small"></span><span title="Quiet" class="sprite-admin Stop Small"></span></div>
        </div>
      </div>

      <!-- Home -->
      <div class="visitors container">
        <div class="visitors-grid"></div>
        <div class="visitors-empty">
          <div>No Browsing Visitors</div>
        </div>
        <div class="visitors-menu">
          <div class="visitors-list button selected" title="Visitors List"></div>
          <div class="visitors-map button" title="Vistors Map"></div>
        </div>
        <div class="worldmap"></div>
      </div>

      <!-- Statistics -->
      <div id="statistics" class="statistics container">

        <!--
        <div class="chat-rating heading" data-lang-key="chatratingfeedback">Chat Rating / Feedback</div>
        <div style="position: relative; width: 400px; height: 60%; top: 0; bottom: 0" class="chart-container">
          <div id="rating-chart"></div>
          <div id="rating-empty">
            <div>No Ratings</div>
          </div>
        </div>
        -->

        <!--
        <div class="rating-histogram">
          <div style="margin-bottom: 5px" title="Excellent">
            <div class="sprite-admin RatingHighlight"></div>
            <div class="sprite-admin RatingHighlight"></div>
            <div class="sprite-admin RatingHighlight"></div>
            <div class="sprite-admin RatingHighlight"></div>
            <div class="sprite-admin RatingHighlight"></div>
            <span class="rating histogram">
              <span class="value excellent"></span>
            </span>
          </div>
          <div style="margin-bottom: 5px" title="Very Good">
            <div class="sprite-admin RatingHighlight"></div>
            <div class="sprite-admin RatingHighlight"></div>
            <div class="sprite-admin RatingHighlight"></div>
            <div class="sprite-admin RatingHighlight"></div>
            <div class="sprite-admin Rating"></div>
            <span class="rating histogram">
              <span class="value verygood"></span>
            </span>
          </div>
          <div style="margin-bottom: 5px" title="Good">
            <div class="sprite-admin RatingHighlight"></div>
            <div class="sprite-admin RatingHighlight"></div>
            <div class="sprite-admin RatingHighlight"></div>
            <div class="sprite-admin Rating"></div>
            <div class="sprite-admin Rating"></div>
            <span class="rating histogram">
              <span class="value good"></span>
            </span>
          </div>
          <div style="margin-bottom: 5px" title="Poor">
            <div class="sprite-admin RatingHighlight"></div>
            <div class="sprite-admin RatingHighlight"></div>
            <div class="sprite-admin Rating"></div>
            <div class="sprite-admin Rating"></div>
            <div class="sprite-admin Rating"></div>
            <span class="rating histogram">
              <span class="value poor"></span>
            </span>
          </div>
          <div style="margin-bottom: 5px" title="Very Poor">
            <div class="sprite-admin RatingHighlight"></div>
            <div class="sprite-admin Rating"></div>
            <div class="sprite-admin Rating"></div>
            <div class="sprite-admin Rating"></div>
            <div class="sprite-admin Rating"></div>
            <span class="rating histogram">
              <span class="value verypoor"></span>
            </span>
          </div>
          <div style="margin-bottom: 5px" title="Unrated">
            <div class="sprite-admin Rating"></div>
            <div class="sprite-admin Rating"></div>
            <div class="sprite-admin Rating"></div>
            <div class="sprite-admin Rating"></div>
            <div class="sprite-admin Rating"></div>
            <span class="rating histogram">
              <span class="value unrated"></span>
            </span>
          </div>
        </div>
        -->

        <!-- Visitor Chart -->
        <!--
        <div class="metro-pivot">
          <div class="pivot-item">
            <h3 data-lang-key="chats">chats</h3>
            <div>
              <div id="chat-chart" style="height: 200px; opacity: 1.0; z-index: 10"></div>
              <div id="chat-empty" style="position: relative; top: -200px; height: 200px; text-align: center; z-index: 20; display: none">
                <div>No Chat Data</div>
              </div>
            </div>
          </div>
          <div class="pivot-item">
            <h3 data-lang-key="visitors">visitors</h3>
            <div>
              <div id="visitor-chart" style="height:200px; opacity:1.0"></div>
              <div id="visitor-empty" style="position: relative; top: -200px; height: 200px; text-align: center; z-index: 20; display: none">
                <div>No Visitor Data</div>
              </div>
            </div>
          </div>
        </div> -->

      </div>

      <!-- History Calendar -->
      <div class="history container">
        <div class="menu">
          <div class="title"><span class="text"></span><div class="expander sprite-admin sort-desc"></div></div>
        </div>
        <div class="side">
          <div id="calendar"></div>
          <div class="chart">
            <div style="font-size:22px; color: #999; margin: 10px 0 0 0; text-align: center" data-lang-key="recentchats">Recent Chats - Last 7 Days</div>
            <div style="position: relative; width: 300px; height: 200px; top: 0; bottom: 0">
              <div id="history-chart" style="position: absolute; top: 0; width: 300px; height: 200px; z-index: 10"></div>
              <div id="history-empty" style="position: absolute; top: 0; text-align: center; width: 300px; height: 200px; z-index: 20; display:none">
                <div style="background: #eeedee; opacity: 0.75; width: 100%; height: 100%"></div>
                <div style="font-size: 26px; font-weight: 100; color: #999; vertical-align: middle; margin: 0 auto; position: absolute; top: 40%; left: 15%; background: #eeedee; opacity: 1.0; padding: 15px 10px; border-radius: 10px" data-lang-key="nochathistory">No Chat History</div>
              </div>
            </div>
          </div>
        </div>
        <div class="search parent">
          <input id="search" type="text" placeholder="Search Chat History" />
          <div class="search button sprite-admin Search" title="Search History"></div>
        </div>
        <div class="grid">
          <div class="history-grid"></div>
          <div class="history-empty">
            <div data-lang-key="nochathistory">No Chat History</div>
          </div>
        </div>
      </div>

      <!-- History Chat -->
      <div id="history-chat" class="slider right">
        <div class="back sprite-admin BackButtonLarge"></div>
        <div class="name">Steve</div>
        <div class="scroll">
          <div class="messages"></div>
        </div>
        <div class="blocked-chat dialog" style="position: absolute; bottom: -145px; left: 1px; width: 100%; background-color: #e5e5e5; height: 145px; z-index: 600; display: none;">
          <div style="position:absolute; bottom: 55px; left:25px" class="progressring">
            <div class="sprite-admin Block" style="opacity: 0.5"></div>
          </div>
          <div style="position:absolute; top: 30px; left:50px">
            <div class="title">Chat Session Blocked</div>
            <div class="description">The chat session is blocked and inactive.</div>
          </div>
          <div class="btn btn-default unblock" title="Unblock Chat" style="position: absolute; right: 15px; bottom: 15px">Unblock Chat</div>
        </div>
      </div>

      <!-- Pre-typed Responses -->
      <div id="responses" class="slider right responses">
        <div class="details">
          <div class="top">
            <span class="header" data-lang-key="pretypedresponses">Pre-typed Responses</span>
          </div>
          <div class="empty"></div>
          <div class="scroll">
            <div id="response-list"></div>
            <div id="add-response">
              <input id="ResponseID" type="hidden" value="" />
              <div class="label" data-lang-key="name">Name</div>
              <div class="LiveHelpInput">
                <input id="ResponseName" type="text" value="" />
                <span id="ResponseNameError" title="Name Required" class="sprite-admin InputError"></span>
              </div>
              <div class="label category" data-lang-key="category">Category</div>
              <div class="LiveHelpInput category">
                <input id="ResponseCategory" type="text" value="" />
                <span id="ResponseCategoryError" title="Category Required" class="sprite-admin InputError"></span>
              </div>
              <div class="label type" data-lang-key="type">Type</div>
              <div class="LiveHelpInput checkbox type">
                <input id="ResponseTypeText" name="type" data-type="Text" value="0" type="radio" style="top: -2px" checked="checked" class="text" />
                <label for="ResponseTypeText" data-lang-key="text" class="text">Text</label>
                <input id="ResponseTypeHyperlink" name="type" data-type="Hyperlink" value="-1" type="radio" style="top: -2px" class="hyperlink" />
                <label for="ResponseTypeHyperlink" data-lang-key="hyperlink" class="hyperlink">Hyperlink</label>
                <input id="ResponseTypeImage" name="type" data-type="Image" value="-1" type="radio" style="top: -2px" class="image" />
                <label for="ResponseTypeImage" data-lang-key="image" class="image">Image</label>
                <input id="ResponseTypePUSH" name="type" data-type="PUSH" value="-1" type="radio" style="top: -2px" class="push" />
                <label for="ResponseTypePUSH" data-lang-key="push" class="push">PUSH</label>
                <input id="ResponseTypeJavaScript" name="type" data-type="JavaScript" value="-1" type="radio" style="top: -2px" class="javascript" />
                <label for="ResponseTypeJavaScript" data-lang-key="javascript" class="javascript">JavaScript</label>
              </div>
              <div class="URL">
                <div class="label" data-lang-key="url">URL</div>
                <div class="LiveHelpInput">
                  <input id="ResponseURL" type="text" value="" />
                  <span id="ResponseURLError" title="URL Required" class="sprite-admin InputError"></span>
                </div>
              </div>
              <div class="Content">
                <div class="label" data-lang-key="content">Content</div>
                <div class="LiveHelpInput">
                  <textarea id="ResponseContent" style="width:400px; height:150px; resize:none; margin: 0 3px 5px 3px"></textarea>
                  <span id="ResponseContentError" title="Content Required" class="sprite-admin InputError"></span>
                </div>
              </div>
              <div class="label" data-lang-key="tags">Tags</div>
              <div class="LiveHelpInput">
                <input id="ResponseTags" type="text" value="" />
                <div class="add-tag"></div>
                <span id="ResponseTagsError" title="Tags Required" class="sprite-admin InputError"></span>
                <div class="add-response tags"></div>
              </div>
            </div>
          </div>
          <div class="search" style="position:absolute; left:25px; bottom:10px; width:100%">
            <input id="search" type="text" placeholder="Search Pre-typed Responses" />
            <div class="search button sprite-admin Search" title="Search Responses" style="top:6px"></div>
            <div class="add-small button sprite-admin Add" title="Add Response" style="top:6px"></div>
          </div>
        <div class="button-toolbar add">
          <div class="add button">
            <div class="add-button sprite-admin AddButton"></div>
            <div class="text" data-lang-key="add">add</div>
          </div>
        </div>
        <div class="button-toolbar save" style="display: none; text-align: center; margin: 0 auto; position: absolute; z-index: 10">
          <div class="save button">
            <div class="save-button sprite-admin SaveButton"></div>
            <div class="text" data-lang-key="save">save</div>
          </div>
          <div class="delete button">
            <div class="delete-button sprite-admin DeleteButton"></div>
            <div class="text" data-lang-key="delete">delete</div>
          </div>
          <div class="cancel button">
            <div class="cancel-button sprite-admin CancelButton"></div>
            <div class="text" data-lang-key="cancel">cancel</div>
          </div>
        </div>
        <div class="button-toolbar edit" style="display: none; text-align: center; margin: 0 auto; position: absolute; z-index: 10">
          <div class="delete button">
            <div class="delete-button sprite-admin DeleteButton"></div>
            <div class="text" data-lang-key="delete">delete</div>
          </div>
          <div class="save button">
            <div class="save-button sprite-admin SaveButton"></div>
            <div class="text" data-lang-key="save">save</div>
          </div>
          <div class="cancel button">
            <div class="cancel-button sprite-admin CancelButton"></div>
            <div class="text" data-lang-key="cancel">cancel</div>
          </div>
        </div>
        <div class="confirm-delete dialog">
          <div class="progressring">
            <img src="<?php echo($server); ?>/images/ProgressRing.gif" alt="Loading"/>
          </div>
          <div style="position:absolute; top:10px; left:50px">
            <div class="title">Confirm Response Delete</div>
            <div class="description">Are you sure that you wish to delete this response?</div>
          </div>
          <div style="position:absolute; bottom:15px; right:15px" class="buttons">
            <div class="accept-button delete sprite-admin AcceptButton" style="position: relative; margin:3px; display: inline-block" title="Delete"></div>
            <div class="cancel-button cancel sprite-admin CancelButton" style="position: relative; margin:3px; display: inline-block" title="Cancel"></div>
          </div>
        </div>
        </div>
      </div>

      <!-- Account Details -->
      <div id="account-details" class="slider right accounts">
        <div id="account-dropzone" style="position: absolute; height: 100%; width: 200px; right: 0px; z-index: 500; display: none"></div>
        <div class="details">
          <div>
            <div class="header-parent">
              <span class="header" data-lang-key="addeditaccounts">Add / Edit Accounts</span>
              <span class="header account"></span>
              <div class="btn-group">
                <div class="dropdown-toggle btn btn-default" data-toggle="dropdown"><span class="status" data-lang-key="online">Online</span> <span class="caret"></span></div>
                <ul class="dropdown-menu statusmode">
                  <li class="online"><a href="#" class="Online" data-lang-key="online">Online</a></li>
                  <li class="offline"><a href="#" class="Offline" data-lang-key="offline">Offline</a></li>
                  <li class="brb"><a href="#" class="BRB" data-lang-key="brb">Be Right Back</a></li>
                  <li class="away"><a href="#" class="Away" data-lang-key="away">Away</a></li>
                </ul>
              </div>
            </div>
            <div class="image" id="account-image" style="display: none; float: right; margin-right: 15px"></div>
            <div class="upload sprite-admin AccountDragDrop"></div>
            <div id="account-upload">
              <div class="image">
                <span class="edit">Change</span>
                <input type="file" name="files[]" />
              </div>
            </div>
          </div>
          <div class="accounts-grid"></div>
          <div class="scroll">
            <input id="AccountID" type="hidden" value="" />
            <div class="label" data-lang-key="username">Username</div>
            <div class="value username">guest</div>
            <div class="LiveHelpInput">
              <input id="AccountUsername" type="text" value="" />
              <span id="AccountUsernameError" title="Username Required" class="sprite-admin InputError"></span>
            </div>
            <div class="label" data-lang-key="firstname">Firstname</div>
            <div class="value firstname">Guest</div>
            <div class="LiveHelpInput">
              <input id="AccountFirstname" type="text" value="" />
              <span id="AccountFirstnameError" title="Firstname Required" class="sprite-admin InputError"></span>
            </div>
            <div class="label" data-lang-key="lastname">Lastname</div>
            <div class="value lastname">Account</div>
            <div class="LiveHelpInput">
              <input id="AccountLastname" type="text" value="" />
              <span id="AccountLastnameError" title="Lastname Required" class="sprite-admin InputError"></span>
            </div>
            <div class="label" data-lang-key="email">Email</div>
            <div class="value email">guest@example.com</div>
            <div class="LiveHelpInput">
              <input id="AccountEmail" type="text" value="" />
              <span id="AccountEmailError" title="Email Required" class="sprite-admin InputError"></span>
            </div>
            <div class="label" data-lang-key="department">Department</div>
            <div class="value department">
              <div class="tagsinput">
                <div class="tagsinput-add-container">
                  <div class="tagsinput-add"></div>
                </div>
              </div>
              <span class="none">No Departments Assigned</span>
            </div>
            <div class="LiveHelpInput">
              <input id="AccountDepartment" type="text" value="" />
              <span id="AccountDepartmentError" title="Department Required" class="sprite-admin InputError"></span>
            </div>
            <div class="password">
              <div class="label" data-lang-key="password">Password</div>
              <div class="LiveHelpInput">
                <input id="AccountPassword" type="password" value="" />
                <span id="AccountPasswordError" title="Password Required" class="sprite-admin InputError"></span>
              </div>
              <div class="label" data-lang-key="confirmpassword">Confirm Password</div>
              <div class="LiveHelpInput">
                <input id="AccountPasswordConfirm" type="password" value="" />
                <span id="AccountPasswordConfirmError" title="Confirm Password Required" class="sprite-admin InputError"></span>
              </div>
            </div>
            <div class="label" data-lang-key="accesslevel">Access Level</div>
            <div class="value accesslevel">Guest</div>
            <div class="LiveHelpInput">
              <select id="AccountAccessLevel">
                <option value="0">Full Administrator</option>
                <option value="1">Department Administrator</option>
                <option value="2">Limited Administrator</option>
                <option value="3">Sales / Support Staff</option>
                <option value="4">Guest</option>
              </select>
              <span id="AccountAccessLevelError" title="Access Level Required" class="sprite-admin InputError"></span>
            </div>
            <div class="label" data-lang-key="accountstatus">Account Status</div>
            <div class="value accountstatus">Enabled</div>
            <div class="LiveHelpInput checkbox">
              <input id="AccountStatusEnable" name="account" value="0" type="radio" style="top: -2px" />
              <label for="AccountStatusEnable">Enable</label>
              <input id="AccountStatusDisable" name="account" value="-1" type="radio" style="top: -2px" />
              <label for="AccountStatusDisable">Disable</label>
            </div>
            <div class="label devices" data-lang-key="devices">Devices</div>
            <div class="value devices"></div>
            <div class="label twofactor" data-lang-key="twostepverification">Two-step verification</div>
            <div class="value twofactor">
              <span class="status">Disabled</span>
              <button class="btn btn-default">Enable</button>
            </div>
          </div>
        </div>
        <div class="button-toolbar add account" style="text-align: center; margin: 0 auto; position: absolute">
          <div class="add button">
            <div class="add-button account sprite-admin AddButton"></div>
            <div class="text" data-lang-key="add">add</div>
          </div>
        </div>
        <div class="button-toolbar edit account" style="display: none; text-align: center; margin: 0 auto; position: absolute">
          <div class="edit button">
            <div class="edit-button sprite-admin EditButton"></div>
            <div class="text" data-lang-key="edit">edit</div>
          </div>
          <div class="delete button">
            <div class="delete-button sprite-admin DeleteButton"></div>
            <div class="text" data-lang-key="delete">delete</div>
          </div>
          <div class="cancel button">
            <div class="cancel-button account sprite-admin CancelButton"></div>
            <div class="text" data-lang-key="cancel">cancel</div>
          </div>
        </div>
        <div class="button-toolbar save account" style="display: none; text-align: center; margin: 0 auto; position: absolute; z-index: 10">
          <div class="save button">
            <div class="save-button account sprite-admin SaveButton"></div>
            <div class="text" data-lang-key="save">save</div>
          </div>
          <div class="cancel button">
            <div class="cancel-button account sprite-admin CancelButton"></div>
            <div class="text" data-lang-key="cancel">cancel</div>
          </div>
        </div>
        <div class="confirm-delete dialog">
          <div class="progressring">
            <img src="<?php echo($server); ?>/images/ProgressRing.gif" alt="Loading"/>
          </div>
          <div style="position:absolute; top:10px; left:50px">
            <div class="title">Confirm Account Delete</div>
            <div class="description">Are you sure that you wish to delete this account?</div>
          </div>
          <div style="position:absolute; bottom:15px; right:15px" class="buttons">
            <div class="accept-button delete sprite-admin AcceptButton" style="position: relative; margin:3px; display: inline-block" title="Delete"></div>
            <div class="cancel-button cancel sprite-admin CancelButton" style="position: relative; margin:3px; display: inline-block" title="Cancel"></div>
          </div>
        </div>
        <div class="departments dialog">
          <div class="heading">
            <div class="title">Select a department</div>
            <div class="description">Select a department to assign the department to the current operator.</div>
          </div>
          <div class="scroll">
            <div id="department-list" class="departments list"></div>
          </div>
          <div class="edit department form">
            <input id="DepartmentID" type="hidden" value="" />
            <div class="label" data-lang-key="name">Name</div>
            <div class="LiveHelpInput">
              <input id="DepartmentName" type="text" value="" />
              <span id="DepartmentNameError" title="Name Required" class="sprite-admin InputError"></span>
            </div>
            <div class="label" data-lang-key="email">Email</div>
            <div class="LiveHelpInput">
              <input id="DepartmentEmail" type="text" value="" />
              <span id="DepartmentEmailError" title="Email Required" class="sprite-admin InputError"></span>
            </div>
            <div class="label" data-lang-key="departmentstatus">Department Status</div>
            <div class="LiveHelpInput checkbox">
              <input id="DepartmentPublic" name="status" value="0" type="radio" style="top: -2px" checked="checked" />
              <label for="DepartmentPublic">Public</label>
              <input id="DepartmentHidden" name="status" value="-1" type="radio" style="top: -2px" />
              <label for="DepartmentHidden">Hidden</label>
            </div>
          </div>
          <div class="button-toolbar departments add" style="text-align: center; margin: 0 auto; position: absolute">
            <div class="add button">
              <div class="add-button sprite-admin AddButton"></div>
              <div class="text" data-lang-key="add">add</div>
            </div>
            <div class="save button">
              <div class="save-button sprite-admin SaveButton"></div>
              <div class="text" data-lang-key="save">save</div>
            </div>
            <div class="delete button">
              <div class="delete-button sprite-admin DeleteButton"></div>
              <div class="text" data-lang-key="delete">delete</div>
            </div>
            <div class="cancel button">
              <div class="cancel-button sprite-admin CancelButton"></div>
              <div class="text" data-lang-key="cancel">cancel</div>
            </div>
          </div>
        </div>
        <div class="account dialog">
          <div class="progressring">
            <img src="<?php echo($server); ?>/images/ProgressRing.gif" alt="Loading"/>
          </div>
          <div style="position:absolute; top:10px; left:50px">
            <div class="title">Adding Account</div>
            <div class="description">One moment while your account is created.</div>
          </div>
        </div>
      </div>

      <!-- Visitor Details -->
      <div id="visitor-details" class="slider right">
        <div class="details">
          <div class="scroll">

            <div class="group user">
              <div class="section">
                <div class="image">
                  <img src="<?php echo($server); ?>/images/Placeholder.png" class="avatar"/>
                </div>
                <div class="name">User - 127.0.0.1.example.com</div>
                <div class="company hidden"></div>
                <div class="bio hidden"></div>
              </div>
              <div class="section social icons">
                <div class="icon facebook" title="Facebook">
                  <a href="#" target="_blank" data-type="facebook"><i class="fa fa-facebook-official"></i></a>
                </div>
                <div class="icon twitter" title="Twitter">
                  <a href="#" target="_blank" data-type="twitter"><i class="fa fa-twitter"></i></a>
                </div>
                <div class="icon linkedin" title="LinkedIn">
                  <a href="#" target="_blank" data-type="linkedin"><i class="fa fa-linkedin-square"></i></a>
                </div>
                <div class="icon google-plus" title="Google+">
                  <a href="#" target="_blank" data-type="googleplus"><i class="fa fa-google-plus"></i></a>
                </div>
                <div class="icon github" title="GitHub">
                  <a href="#" target="_blank" data-type="github"><i class="fa fa-github"></i></a>
                </div>
                <div class="icon foursquare" title="Foursquare">
                  <a href="#" target="_blank" data-type="foursquare"><i class="fa fa-foursquare"></i></a>
                </div>
                <div class="icon angellist" title="AngelList">
                  <a href="#" target="_blank" data-type="angellist"><i class="fa fa-angellist"></i></a>
                </div>
              </div>
            </div>

            <div class="group address">
              <div class="section address">
                <div class="address address1 hidden"></div>
                <div class="address address2 hidden"></div>
                <div class="address city hidden"></div>
                <div class="address region">
                  <span class="address state hidden"></span>
                  <span class="address postcode hidden"></span>
                </div>
                <div class="address country hidden"></div>
              </div>
            </div>

            <div class="group visitor">
              <div class="section ipaddress">
                <div class="icon">
                  <i class="fa fa-wifi"></i>
                </div>
                <div class="label">IP Address</div>
                <div class="value ipaddress"></div>
              </div>
              <div class="section email">
                <div class="icon">
                  <i class="fa fa-envelope"></i>
                </div>
                <div class="label">Email</div>
                <div class="value email">
                  <a id="email" href="#" target="_blank"></a>
                </div>
              </div>
              <div class="section website">
                <div class="icon">
                  <i class="fa fa-globe"></i>
                </div>
                <div class="label">Website</div>
                <div class="value website">
                  <a id="website" href="#" target="_blank"></a>
                </div>
              </div>
              <div class="section location">
                <div class="icon">
                  <i class="fa fa-map-marker"></i>
                </div>
                <div class="label">Location</div>
                <div class="value">
                  <span id="country">United Kingdom</span><span id="country-image" class="sprite-admin uk" style="margin-left:5px; display:inline-block"></span>
                </div>
              </div>
              <div class="section useragent">
                <div class="icon">
                  <i class="fa fa-globe"></i>
                </div>
                <div class="label">Web Browser</div>
                <div class="value useragent">
                  <span id="useragent">Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.168 Safari</span>
                </div>
              </div>
              <div class="section referrer">
                <div class="icon">
                  <i class="fa fa-bookmark"></i>
                </div>
                <div class="label">Referrer</div>
                <div class="value" id="referrer"><a href="#" target="_blank"></a><span class="direct">Direct Visit / Bookmark</span></div>
              </div>
              <div class="section resolution">
                <div class="icon">
                  <i class="fa fa-desktop"></i>
                </div>
                <div class="label">Resolution</div>
                <div class="value" id="resolution">1920 x 1080</div>
              </div>
              <div class="section currentpage">
                <div class="icon">
                  <i class="fa fa-globe"></i>
                </div>
                <div class="label">Current Page</div>
                <div class="value" id="currentpage"><a href="http://livehelp.stardevelop.com/" target="_blank">http://www.example.com/</a></div>
              </div>
              <div class="section chatstatus">
                <div class="label">Chat Status</div>
                <div class="value" id="chatstatus">Browsing</div>
              </div>
              <div class="section operator hidden">
                <div class="label">Operator</div>
                <div class="value" id="operator">Unavailable</div>
              </div>
              <div class="section department hidden">
                <div class="label">Department</div>
                <div class="value" id="department">Unavailable</div>
              </div>
              <div class="section pagehistory">
                <div class="label">Page History</div>
                <div class="value" id="pagehistory">/</div>
              </div>
            </div>
          </div>
          <div class="section initiate">
            <div class="btn btn-default initiate">Initiate Chat</div>
          </div>
        </div>
      </div>

      <!-- Settings -->
      <div class="settings container">
        <div id="settings" class="settings dropdown">
          <div id="settingsmenu" class="settingsmenu">
            <div id="general"><span data-lang-key="general">General</span></div>
            <div id="appearance"><span data-lang-key="appearance">Appearance</span></div>
            <div id="alerts"><span data-lang-key="alerts">Alerts</span></div>
            <div id="images"><span data-lang-key="images">Images</span></div>
            <div id="startup"><span>Start-up</span></div>
            <div id="htmlcode"><span data-lang-key="htmlcode">HTML Code</span></div>
            <div id="email"><span data-lang-key="email">Email</span></div>
            <div id="filetransfer"><span>File Transfer</span></div>
            <div id="initiatechat"><span data-lang-key="initiatechat">Initiate Chat</span></div>
            <div id="privacy"><span data-lang-key="privacy">Privacy</span></div>
          </div>
          <div class="sections">
            <div class="button-toolbar save" style="position:absolute; bottom:-90px; right:15px; width:95px; z-index:100">
              <div class="save button">
                <div class="save-button sprite-admin SaveButton"></div>
                <div class="text" data-lang-key="save">save</div>
              </div>
              <div class="cancel button">
                <div class="cancel-button sprite-admin CancelButton"></div>
                <div class="text" data-lang-key="cancel">cancel</div>
              </div>
            </div>
            <div class="settings-general section" style="display: block">
              <label for="siteaddress" data-lang-key="siteaddress" class="siteaddress">Site Address</label>
              <input id="siteaddress" name="siteaddress" type="text" class="siteaddress"/>
              <label for="livehelpname" data-lang-key="livehelpname" class="livehelpname">Live Help Name</label>
              <input id="livehelpname" name="livehelpname" type="text" class="livehelpname" />
              <label for="visitortracking-enable" data-lang-key="visitortracking" class="visitortracking">Visitor Tracking</label>
              <div class="checkbox toggle visitortracking">
                <div class="radios">
                  <input id="visitortracking-enable" name="visitortracking" type="radio" class="enable"/>
                  <label for="visitortracking-enable" data-lang-key="enable">Enable</label>
                  <input id="visitortracking-disable" name="visitortracking" type="radio" class="disable"/>
                  <label for="visitortracking-disable" data-lang-key="disable">Disable</label>
                </div>
              </div>
              <label for="departments-enable" data-lang-key="departments" class="departments">Departments</label>
              <div class="checkbox toggle departments">
                <div class="radios">
                  <input id="departments-enable" name="departments" type="radio" class="enable"/>
                  <label for="departments-enable" data-lang-key="enable">Enable</label>
                  <input id="departments-disable" name="departments" type="radio" class="disable"/>
                  <label for="departments-disable" data-lang-key="disable">Disable</label>
                </div>
              </div>
              <label for="welcomenote" data-lang-key="welcomenote" class="welcomenote">Welcome Note</label>
              <input id="welcomenote" name="welcomenote" type="text" class="welcomenote" />
              <label for="language" data-lang-key="language" class="language">Language</label>
              <select id="language" name="language" class="language">
                <option value="en">English</option>
              </select>
              <label for="supportaddress" data-lang-key="supportdocumentationaddress" class="supportaddress">Support / Documentation Address</label>
              <input id="supportaddress" name="supportaddress" type="text" class="supportaddress"/>
            </div>
            <div class="settings-appearance section">
              <div class="layout">
                <label for="layout" data-lang-key="layout">Chat Layout</label>
                <label class="description" data-lang-key="layoutdescription">Change the position of the customer chat with a tab or sidebar</label>
                <div class="option tab selected"></div>
                <div class="option docked"></div>
              </div>
              <div class="theme">
                <label for="theme" data-lang-key="layout">Chat Theme</label>
                <label class="description" data-lang-key="layoutdescription">Change the theme of the chat tab or sidebar</label>
                <div id="themes" class="themes">
                  <span class="theme option default" title="Default" data-type="default"></span>
                  <span class="theme option green" title="Green" data-type="green"></span>
                  <span class="theme option turquoise" title="Turquoise" data-type="turquoise"></span>
                  <span class="theme option blue" title="Blue" data-type="blue"></span>
                  <span class="theme option purple" title="Purple" data-type="purple"></span>
                  <span class="theme option pink" title="Pink" data-type="pink"></span>
                  <span class="theme option orange" title="Orange" data-type="orange"></span>
                </div>
              </div>
              <div class="button-image">
                <label for="button-image" data-lang-key="layout">Chat Button Image</label>
                <label class="description" data-lang-key="layoutdescription">Change the image on the chat button (sidebar layout only)</label>
                <div id="button-images" class="button-images">
                  <div class="button-example custom" data-type="custom"></div>
                  <div class="button-example chatstack" data-type="default"></div>
                  <div class="button-example send" data-type="send"></div>
                  <div class="button-example envelope" data-type="envelope"></div>
                  <div class="button-example happy" data-type="happy"></div>
                </div>
              </div>
              <label for="chatbuttonimage" data-lang-key="chatbuttonimage">Custom Chat Button Image (150px by 150px)</label>
              <label class="description" data-lang-key="chatbuttonimagedescription">Override the chat button image with a custom image</label>
              <input id="chatbuttonimage" name="chatbuttonimage" type="text" />
              <!--
              <label for="backgroundcolor" data-lang-key="backgroundcolor">Background Color</label>
              <input id="backgroundcolor" name="backgroundcolor" type="text" />
              <label for="generalfont" data-lang-key="generalfont">General Font</label>
              <input id="generalfont" name="generalfont" type="text" style="width:350px" />
              <select id="generalfontsize" name="generalfontsize" style="width:75px">
                <option value="8px">8px</option>
                <option value="9px">9px</option>
                <option value="10px">10px</option>
                <option value="11px">11px</option>
                <option value="12px">12px</option>
                <option value="13px">13px</option>
                <option value="14px">14px</option>
              </select>
              <div>
                <div style="display: inline-block">
                  <label for="generalfontcolor" style="display: inline-block" data-lang-key="fontcolor">Font Color</label><br/>
                  <input id="generalfontcolor" name="generalfontcolor" type="text" />
                </div>
                <div style="display: inline-block; margin-left: 50px">
                  <label for="generalfontlinkcolor" style="display: inline-block" data-lang-key="fontlinkcolor">Font Link Color</label><br/>
                  <input id="generalfontlinkcolor" name="generalfontlinkcolor" type="text" />
                </div>
              </div>
              <label for="guestchatfont" data-lang-key="guestchatfont">Guest Chat Font</label>
              <input id="guestchatfont" name="guestchatfont" type="text" style="width:350px" />
              <select id="guestchatfontsize" name="guestchatfontsize" style="width:75px">
                <option value="8px">8px</option>
                <option value="9px">9px</option>
                <option value="10px">10px</option>
                <option value="11px">11px</option>
                <option value="12px">12px</option>
                <option value="13px">13px</option>
                <option value="14px">14px</option>
              </select>
              <div>
                <div style="display: inline-block">
                  <label for="sentcolor" style="display: inline-block" data-lang-key="sentcolor">Sent Color</label><br/>
                  <input id="sentcolor" name="sentcolor" type="text" />
                </div>
                <div style="display: inline-block; margin-left: 50px">
                  <label for="receivedcolor" style="display: inline-block" data-lang-key="receivedcolor">Received Color</label><br/>
                  <input id="receivedcolor" name="receivedcolor" type="text" />
                </div>
              </div>
              -->
              <label for="smilies-enable" data-lang-key="smilies">Smilies</label>
              <div class="checkbox toggle smilies">
                <div class="radios">
                  <input id="smilies-enable" name="smilies" type="radio" class="enable"/>
                  <label for="smilies-enable" data-lang-key="enable">Enable</label>
                  <input id="smilies-disable" name="smilies" type="radio" class="disable"/>
                  <label for="smilies-disable" data-lang-key="disable">Disable</label>
                </div>
              </div>
              <label for="template" data-lang-key="template">Template</label>
              <select id="template" name="template">
                <option value="default">Default</option>
              </select>
              <label for="chatwindowsize" data-lang-key="chatwindowsize">Chat Window Size</label>
              <select id="chatwindowsize" name="chatwindowsize">
                <option value="625 x 435">625 x 435</option>
                <option value="725 x 535">725 x 535</option>
                <option value="825 x 635">825 x 635</option>
              </select>
            </div>
            <div class="settings-alerts section">
              <div class="html5-notifications">
                <label for="html5-notifications-enable" data-lang-key="html5notifications">HTML5 Notifications</label>
                <div class="checkbox toggle html5-notifications">
                  <div class="radios">
                    <input id="html5-notifications-enable" name="notification" type="radio" class="enable"/>
                    <label for="html5-notifications-enable">Enable</label>
                    <input id="html5-notifications-disable" name="notification" type="radio" class="disable"/>
                    <label for="html5-notifications-disable">Disable</label>
                  </div>
                </div>
                <label style="font-size:13px; margin-top:5px" data-lang-key="html5notificationdescription">Supports Google Chrome, Firefox and Safari 6.0 (Mac OS X 10.8 Notification Center)</label>
              </div>
            </div>
            <div class="settings-images section">
              <label for="logo" data-lang-key="livehelplogo">Live Help Logo</label>
              <input id="logo" name="logo" type="text" />
              <label for="initiatechatlogo" data-lang-key="initiatechatlogo">Initiate Chat Logo (150px by 150px)</label>
              <label class="description" data-lang-key="initiatechatlogodescription">Override the initiate chat operator images with an image</label>
              <input id="initiatechatlogo" name="initiatechatlogo" type="text" />
              <label for="feedbacklogo" data-lang-key="feedbacklogo">Feedback Logo (150px by 150px)</label>
              <label class="description" data-lang-key="feedbacklogodescription">The image for the floating customer satisfaction / feedback feature</label>
              <input id="feedbacklogo" name="feedbacklogo" type="text" />
              <label for="campaignimage" data-lang-key="campaignimage">Campaign Image</label>
              <input id="campaignimage" name="campaignimage" type="text" />
              <label for="campaignlink" data-lang-key="campaignlink">Campaign Link</label>
              <input id="campaignlink" name="campaignlink" type="text" />
              <label for="onlineimage" data-lang-key="onlineimage">Online Image</label>
              <input id="onlineimage" name="onlineimage" type="text" />
              <label for="offlineimage" data-lang-key="offlineimage">Offline Image</label>
              <input id="offlineimage" name="offlineimage" type="text" />
              <label for="berightbackimage" data-lang-key="brbimage" class="berightbackimage">Be Right Back Image</label>
              <input id="berightbackimage" name="berightbackimage" type="text" />
              <label for="awayimage" data-lang-key="awayimage" class="awayimage">Away Image</label>
              <input id="awayimage" name="awayimage" type="text" />
            </div>
            <div class="settings-htmlcode section">
              <div class="htmlcodestep1">
                <div class="copy step1"><span class="sprite-admin Copy" style="display:inline-block"></span><span>Copy Code</span></div>
                <label for="htmlcodestep1" data-lang-key="htmlcodestep1">HTML Code - Step 1</label>
                <div style="margin-top: 10px" data-lang-key="htmlcodestep1description">The HTML code below is used to track your site visitors and setup the Live Chat system. Please insert this code between your &lt;head&gt; and &lt;/head&gt; tags.</div>
                <textarea id="htmlcodestep1" style="margin-bottom: 15px" spellcheck="false"></textarea>
              </div>
              <div class="htmlcodestep2">
                <div class="copy step2"><span class="sprite-admin Copy" style="display:inline-block"></span><span>Copy Code</span></div>
                <label for="htmlcodestep2" data-lang-key="htmlcodestep2">HTML Code - Step 2 (Optional)</label>
                <div style="margin-top: 10px" data-lang-key="htmlcodestep2description">The HTML code below is used to display the Live Help Online / Offline button. Please place this code where you wish the button to appear.</div>
                <textarea id="htmlcodestep2" spellcheck="false"></textarea>
              </div>
            </div>
            <div class="settings-email section">
              <div class="emailaddress">
                <label for="emailaddress" data-lang-key="offlineemailaddress">Offline Email Address</label>
                <label class="description" data-lang-key="emailaddressdescription">Email address where your offline messages will be sent</label>
                <input id="emailaddress" name="emailaddress" type="text" />
              </div>
              <div class="telephone">
                <label for="telephone" data-lang-key="telephone">Telephone</label>
                <input id="telephone" name="telephone" type="text" />
              </div>
              <div class="address">
                <label for="address" data-lang-key="address">Address</label><br/>
                <input id="address" name="address" type="text" />
              </div>
              <div class="offlineurlredirection">
                <label for="offlineurlredirection" data-lang-key="offlineurlredirection">Offline URL Redirection</label>
                <label class="description" data-lang-key="offlineurlredirectiondescription">Open a website address for your own contact page instead of using the inbuilt offline email</label>
                <input id="offlineurlredirection" name="offlineurlredirection" type="text" placeholder="https://www.example.com/contact" />
              </div>
              <div class="email-enable">
                <label for="email-enable" data-lang-key="offlineemail">Offline Email</label>
                <div class="checkbox toggle email">
                  <div class="radios">
                    <input id="email-enable" name="email" type="radio" class="enable"/>
                    <label for="email-enable" data-lang-key="enable">Enable</label>
                    <input id="email-disable" name="email" type="radio" class="disable"/>
                    <label for="email-disable" data-lang-key="disable">Disable</label>
                  </div>
                </div>
              </div>
              <label for="securitycode-enable" data-lang-key="securitycode">Security Code</label>
              <div class="checkbox toggle securitycode">
                <div class="radios">
                  <input id="securitycode-enable" name="securitycode" type="radio" class="enable"/>
                  <label for="securitycode-enable" data-lang-key="enable">Enable</label>
                  <input id="securitycode-disable" name="securitycode" type="radio" class="disable"/>
                  <label for="securitycode-disable" data-lang-key="disable">Disable</label>
                </div>
              </div>
            </div>
            <div class="settings-initiatechat section">
              <label for="autoinitiatechat-enable" data-lang-key="autoinitiatechat">Auto Initiate Chat</label>
              <div class="checkbox toggle autoinitiatechat">
                <div class="radios">
                  <input id="autoinitiatechat-enable" name="autoinitiatechat" type="radio" class="enable"/>
                  <label for="autoinitiatechat-enable" data-lang-key="enable">Enable</label>
                  <input id="autoinitiatechat-disable" name="autoinitiatechat" type="radio" class="disable"/>
                  <label for="autoinitiatechat-disable" data-lang-key="disable">Disable</label>
                </div>
              </div>
              <div class="autoinitiate-pageviews" style="margin-bottom: 25px">
                <label for="autoinitiatechat-pages" data-lang-key="autoinitiatechatafterpages">Auto Initiate Chat After Page Views</label>
                <select id="autoinitiatechat-pages" name="autoinitiatechat-pages">
                  <option value="1">After 1 Pageview</option>
                  <option value="2">After 2 Pageviews</option>
                  <option value="3">After 3 Pageviews</option>
                  <option value="4">After 4 Pageviews</option>
                  <option value="5">After 5 Pageviews</option>
                  <option value="6">After 6 Pageviews</option>
                  <option value="7">After 7 Pageviews</option>
                  <option value="8">After 8 Pageviews</option>
                  <option value="9">After 9 Pageviews</option>
                  <option value="10">After 10 Pageviews</option>
                  <option value="11">After 11 Pageviews</option>
                  <option value="12">After 12 Pageviews</option>
                  <option value="13">After 13 Pageviews</option>
                  <option value="14">After 14 Pageviews</option>
                  <option value="15">After 15 Pageviews</option>
                </select>
              </div>
              <div class="initiatechatdelay" style="margin-bottom: 25px">
                <label for="initiatechatdelay" data-lang-key="initiatechatdelay">Initiate Chat Delay</label>
                <label class="description" data-lang-key="initiatechatdelaydescription">Display the initiate chat <span class="seconds">after <span class="initiatechatdelay-value">30</span> seconds</span><span class="immediately">immediately</span></label>
                <input id="initiatechatdelay" type="range" min="0" max="180" step="5" value="30" />
              </div>
              <div class="verticalalignment">
                <label for="verticalalignment" data-lang-key="verticalalignment">Vertical Alignment</label>
                <select id="verticalalignment" name="verticalalignment">
                  <option value="Top">Top</option>
                  <option value="Center">Center</option>
                  <option value="Bottom">Bottom</option>
                </select>
              </div>
              <div class="horizontalalignment">
                <label for="horizontalalignment" data-lang-key="horizontalalignment">Horizontal Alignment</label>
                <select id="horizontalalignment" name="horizontalalignment">
                  <option value="Left">Left</option>
                  <option value="Middle">Middle</option>
                  <option value="Right">Right</option>
                </select>
              </div>
            </div>
            <div class="settings-privacy section">
              <label for="guestlogindetails-enable" data-lang-key="showprechatdetails" class="guestlogindetails">Show Pre-chat Details</label>
              <div class="checkbox toggle guestlogindetails">
                <div class="radios">
                  <input id="guestlogindetails-enable" name="guestlogindetails" type="radio" class="enable"/>
                  <label for="guestlogindetails-enable" data-lang-key="enable">Enable</label>
                  <input id="guestlogindetails-disable" name="guestlogindetails" type="radio" class="disable"/>
                  <label for="guestlogindetails-disable" data-lang-key="disable">Disable</label>
                </div>
              </div>
              <label for="guestlogindetailsrequired-enable" data-lang-key="guestlogindetailsrequired" class="guestlogindetailsrequired">Require Completed Pre-chat Details</label>
              <div class="checkbox toggle guestlogindetailsrequired">
                <div class="radios">
                  <input id="guestlogindetailsrequired-enable" name="guestlogindetailsrequired" type="radio" class="enable"/>
                  <label for="guestlogindetailsrequired-enable" data-lang-key="enable">Enable</label>
                  <input id="guestlogindetailsrequired-disable" name="guestlogindetailsrequired" type="radio" class="disable"/>
                  <label for="guestlogindetailsrequired-disable" data-lang-key="disable">Disable</label>
                </div>
              </div>
              <label for="guestemailaddress-enable" data-lang-key="guestemailaddress" class="guestemailaddress">Ask for Email Address</label>
              <div class="checkbox toggle guestemailaddress">
                <div class="radios">
                  <input id="guestemailaddress-enable" name="guestemailaddress" type="radio" class="enable"/>
                  <label for="guestemailaddress-enable" data-lang-key="enable">Enable</label>
                  <input id="guestemailaddress-disable" name="guestemailaddress" type="radio" class="disable"/>
                  <label for="guestemailaddress-disable" data-lang-key="disable">Disable</label>
                </div>
              </div>
              <label for="guestquestion-enable" data-lang-key="guestquestion" class="guestquestion">Ask for a Pre-chat Question</label>
              <div class="checkbox toggle guestquestion">
                <div class="radios">
                  <input id="guestquestion-enable" name="guestquestion" type="radio" class="enable"/>
                  <label for="guestquestion-enable" data-lang-key="enable">Enable</label>
                  <input id="guestquestion-disable" name="guestquestion" type="radio" class="disable"/>
                  <label for="guestquestion-disable" data-lang-key="disable">Disable</label>
                </div>
              </div>
            </div>
            <div class="settings-integrations section">
              <div>
                <div class="heading">Integrations</div>
                <div class="description">Integrations allow you to automatically pull information related to your customers into Helloify so you can help customers faster.  This includes data from tools that you use outside Helloify.</div>
                <div class="warning"><strong>Hey <span class="name">there</span>!</strong> To enable integrations you will need to <a href="#" class="upgrade">upgrade to a paid plan.</a></div>
              </div>
              <div class="infusionsoft">
                <div class="logo"></div>
                <div class="integration">
                  <label for="infusionsoft-enable" data-lang-key="infusionsoft" class="infusionsoft">Infusionsoft</label>
                  <div class="checkbox toggle infusionsoft">
                    <div class="radios">
                      <input id="infusionsoft-enable" name="infusionsoft" type="radio" class="enable"/>
                      <label for="infusionsoft-enable" data-lang-key="enable">Enable</label>
                      <input id="infusionsoft-disable" name="infusionsoft" type="radio" class="disable"/>
                      <label for="infusionsoft-disable" data-lang-key="disable">Disable</label>
                    </div>
                  </div>
                  <label for="infusionsoft-tags" data-lang-key="infusionsoft-tags" class="infusionsoft-tags">Infusionsoft Tags (Comma Separated)</label>
                  <input id="infusionsoft-tags" name="infusionsoft-tags" type="text" class="infusionsoft-tags" />
                </div>
              </div>
              <div class="stripe">
                <div class="logo"></div>
                <div class="integration">
                  <label for="stripe-enable" data-lang-key="stripe" class="stripe">Stripe - Coming Soon</label>
                  <div class="checkbox toggle stripe disabled">
                    <div class="radios">
                      <input id="stripe-enable" name="stripe" type="radio" class="enable"/>
                      <label for="stripe-enable" data-lang-key="enable">Enable</label>
                      <input id="stripe-disable" name="stripe" type="radio" class="disable" checked="checked"/>
                      <label for="stripe-disable" data-lang-key="disable">Disable</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="settings dialog">
            <div class="progressring">
              <img src="<?php echo($server); ?>/images/ProgressRing.gif" alt="Loading"/>
            </div>
            <div class="text">
              <div class="title">Saving Settings</div>
              <div class="description">One moment while your settings are saved.</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </body>
</html>
