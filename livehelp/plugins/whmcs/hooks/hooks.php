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

use WHMCS\Security\Hash\Password;

if (isset($_PLUGINS) && isset($_PLUGINS['WHMCS'])) {
  require_once dirname(__FILE__) . '/../functions.php';
  require_once dirname(__FILE__) . '/../../../include/class.passwordhash.php';
  require_once dirname(__FILE__) . '/../class.models.php';
}


/*
 * Hook class name must end with Hooks
 * i.e. ExampleHooks or TestHooks
 *
 */
class LiveHelpWHMCSHooks {

  function __construct() {
    // Init Hook
  }

  function CloseChat($args) {

    global $_SETTINGS;

    // Arguments
    list($chat, $name) = $args;

    if ($name === false) {
      return;
    }

    if (isset($_SETTINGS['WHMCSTICKETS']) && $_SETTINGS['WHMCSTICKETS'] == false) {
      return false;
    }

    // Close Chat Event
    $chat = Chat::where_id_is($chat)
      ->order_by_asc('id')
      ->find_one();

    $session = false;
    if (empty($chat->request)) {
      $visitor = ChatVisitor::where('chat', $chat->id)->find_one();
      if ($visitor !== false) {
        $custom = $visitor->custom()->find_one();
        if ($custom !== false) {
          $session = $custom->custom;
        }
      }
    } else {
      if ($chat !== false) {
        $custom = $chat->custom()->find_one();
        if ($custom !== false) {
          $session = $custom->custom;
        }
      }
    }

    if ($session !== false) {

      // Log Chat Ticket
      $seeds = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      $c = null;
      $seeds_count = strlen($seeds) - 1;
      for ($i = 0; 8 > $i; $i++) {
        $c .= $seeds[rand(0, $seeds_count)];
      }

      $ticketdepartment = false;
      if (!empty($chat->department)) {
        // Find Department
        $ticketdepartment = Plugins\WHMCS\TicketDepartment::where('name', $chat->department)
          ->find_one();
      } else {
        // Default Department
        $ticketdepartment = Plugins\WHMCS\TicketDepartment::where('hidden', '')
          ->order_by_asc('order')
          ->find_one();
      }

      if ($ticketdepartment !== false) {
        $department = $ticketdepartment->id;

        // Chat Transcript
        $messages = Message::where('chat', $chat->id)
          ->where_lte('status', 3)
          ->order_by_asc('datetime')
          ->find_many();

        $transcript = ''; $textmessages = '';
        $names = array();

        // Determine EOL
        $server = strtoupper(substr(PHP_OS, 0, 3));
        if ($server == 'WIN') {
          $eol = "\r\n";
        } elseif ($server == 'MAC') {
          $eol = "\r";
        } else {
          $eol = "\n";
        }

        // Language
        $language = file_get_contents(dirname(__FILE__) . '/../../../locale/en/admin.json');
        if (file_exists(dirname(__FILE__) . '/../../../locale/' . LANGUAGE . '/admin.json')) {
          $language = file_get_contents(dirname(__FILE__) . '/../../../locale/' . LANGUAGE . '/admin.json');
        }
        $_LOCALE = json_decode($language, true);

        $transcript .= '[div="chat"]';
        if ($messages !== false) {
          foreach ($messages as $key => $message) {
            $status = (int)$message->status;
            // Operator
            if ($status) {

              if (!empty($message->username) && !array_key_exists($message->username, $names)) {
                // Operator
                $user = Operator::where('username', $message->username)->find_one();
                if ($user !== false) {
                  $names[$message->username] = $user->firstname;
                }
              }

              if (!empty($message->username)) {
                $transcript .= '[div="operator"][div="name"]' . $names[$message->username] . ' says:[/div][div="message"]' . $message->message . '[/div][/div]';
                $textmessages .= $names[$message->username] . ' ' . $_LOCALE['says'] . ':' . $eol . '	' . $message->message . $eol;
              } else {
                $transcript .= '[div="operator"][div="message"]' . $message->message . '[/div][/div]';
                $textmessages .= $message->message . $eol;
              }
            }

            // Guest
            if (!$status) {

              // Replace HTML Code
              $content = str_replace('<', '&lt;', $message->message);
              $content = str_replace('>', '&gt;', $content);

              $transcript .= '[div="visitor"][div="name"]' . $message->username . ' says:[/div][div="message"]' . $content . '[/div][/div]';
              $textmessages .= $message->username . ' ' . $_LOCALE['says'] . ':' . $eol . '	' . $content . $eol;
            }
          }
        }
        $transcript .= '[/div]';
        $transcript = preg_replace("/(\r\n|\r|\n)/", '<br/>', $transcript);

        // Date Format
        $dateformat = 'd/m/Y H:i';
        $setting = Plugins\WHMCS\Setting::where('setting', 'DateFormat')->find_one();
        if ($setting !== false && $setting->value === 'MM/DD/YYYY') {
          $dateformat = 'm/d/Y H:i';
        }

        $datetime = date('Y-m-d H:i:s', time());

        // Insert Live Help Chat
        $ticket = Plugins\WHMCS\Ticket::create();
        $ticket->did = $department;
        $ticket->userid = $session;
        $ticket->c = $c;
        $ticket->date = $datetime;
        $ticket->title = sprintf('Chat Log %s', date($dateformat));
        $ticket->message = $transcript;
        $ticket->status = 'Closed';
        $ticket->urgency = 'Medium';
        $ticket->lastreply = $datetime;

        // WHMCS Version
        $setting = Plugins\WHMCS\Setting::where('setting', 'Version')->find_one();
        if ($setting !== false && version_compare($setting->value, '6.3.0') >= 0) {
          $ticket->editor = 'bbcode';
        }

        $ticket->save();

        // WHMCS Ticket Masking
        $mask = Plugins\WHMCS\genTicketMask($ticket->id);

        $ticket->tid = $mask;
        $ticket->save();

      }
    }
  }


  function ResponsesCustom($format) {

    // KB URL
    $whmcs = Plugins\WHMCS\whmcsURL(false);
    $kburl = $whmcs . 'knowledgebase.php?action=displayarticle&id=';

    if ($format == 'json') {

      // Custom Responses
      $custom = array();
      $other = array();

      // Output Knowledge Base Links
      $categories = Plugins\WHMCS\KnowledgebaseCategory::where_not_equal('hidden', 'on')->find_many();
      if ($categories !== false) {
        $custom = array();

        foreach ($categories as $key => $category) {
          // KB Links
          $knowledgebaselinks = Plugins\WHMCS\KnowledgebaseLink::where('categoryid', $category->id)->find_many();
          if ($knowledgebaselinks !== false) {
            foreach ($knowledgebaselinks as $key => $link) {
              // Knowledgebase Article
              $article = $link->knowledgebase()->find_one();
              if ($article !== false) {
                // WHMCS Knowledgebase Link
                $custom[] = array('ID' => $article->id, 'Name' => $article->title, 'Content' => $kburl . $article->id, 'Category' => $category->name, 'Type' => 2);
              }
            }
          }
        }
      }

      // Ticket Responses
      $ticketreplies = Plugins\WHMCS\TicketPredefinedReply::find_many();
      if ($ticketreplies !== false) {
        foreach ($ticketreplies as $key => $reply) {
          // Category
          $category = $reply->category()->find_one();
          if ($category !== false) {
            // Predefined Reply with Category
            $custom[] = array('ID' => $reply->id, 'Name' => $reply->name, 'Content' => $reply->reply, 'Category' => $category->name, 'Type' => 1);
          } else {
            // Predefined Reply
            $custom[] = array('ID' => $reply->id, 'Name' => $reply->name, 'Content' => $reply->reply, 'Type' => 1);
          }
        }
      }

      if (!empty($custom)) {
        $other[] = array('Custom' => $custom);
      }

      return $other;

    } else {

      // Output Knowledge Base Links
      $categories = Plugins\WHMCS\KnowledgebaseCategory::where_not_equal('hidden', 'on')->find_many();
      if ($categories !== false) {
?>
    <Custom Description="WHMCS Knowledgebase">
<?php

        foreach ($categories as $key => $category) {

          // KB Links
          $knowledgebaselinks = Plugins\WHMCS\KnowledgebaseLink::where('categoryid', $category->id)->find_many();
          if ($knowledgebaselinks !== false) {
?>
      <Category Name="<?php echo($category->name); ?>">
<?php
            foreach ($knowledgebaselinks as $key => $link) {

              // Knowledgebase Article
              $article = $link->knowledgebase()->find_one();
              if ($article !== false) {
?>
        <Response ID="<?php echo($article->id); ?>" Type="Hyperlink">
          <Name><?php echo(xmlelementinvalidchars($article->title)); ?></Name>
          <Content><?php echo(xmlelementinvalidchars($kburl . $article->id)); ?></Content>
          <Tags/>
        </Response>
<?php
              }
            }

?>
      </Category>
<?php
          }
        }
?>
    </Custom>
<?php
        // Ticket Responses
        $ticketreplies = Plugins\WHMCS\TicketPredefinedReply::find_many();
        if ($ticketreplies !== false) {
?>
    <Custom Description="WHMCS Predefined Ticket Replies">
<?php
          foreach ($ticketreplies as $key => $reply) {
?>
      <Response ID="<?php echo($reply->id); ?>" Type="Text">
        <Name><?php echo(xmlelementinvalidchars($reply->name)); ?></Name>
        <Content><?php echo(xmlelementinvalidchars($reply->reply)); ?></Content>
        <Tags/>
      </Response>
<?php
          }
?>
    </Custom>
<?php
        }
      }
    }
  }

  function LoginCustomHash($data) {

    $password = $data['Password'];
    $version = $data['Version'];

    if (is_numeric($version) && $version >= 4.0) {
      $password = md5(htmlspecialchars($password));
    }
    return $password;
  }

  function LoginCompleted($_OPERATOR) {

    global $_PLUGINS;

    // WHMCS Plugin
    if (isset($_PLUGINS) && isset($_PLUGINS['WHMCS']) && isset($_REQUEST['Username']) && isset($_REQUEST['Password'])) {

      // Username Special Characters
      if (isset($_REQUEST['Version']) && $_REQUEST['Version'] >= 4.0) {
        $username = htmlspecialchars($_OPERATOR['USERNAME'], ENT_QUOTES);
      }

      $user = Plugins\WHMCS\Admin::where('username', $username)->find_one();
      if ($user !== false) {

        $username = $_REQUEST['Username'];
        $password = $_REQUEST['Password'];

        // MD5 Password Hash
        if (isset($_REQUEST['Version']) && $_REQUEST['Version'] >= 4.0) {
          $password = md5(htmlspecialchars($password));
        }

        $validhash = false;
        if (class_exists('WHMCS\\Security\\Hash\\Password') || class_exists('WHMCS_Security_Hash_Password')) {
          if (class_exists('WHMCS\\Security\\Hash\\Password')) {
            $whmcshasher = new Password();
          } else {
            $whmcshasher = new \WHMCS_Security_Hash_Password();
          }
          $validhash = $whmcshasher->verify($password, $user->password);
          if ($validhash){
            // Valid WHMCS Admin
            // Generate Live Help Hash for subsequent login attempts
            $livehelphasher = new PasswordHash(8, true);
            $password = $_REQUEST['Password'];
            $hash = $livehelphasher->HashPassword($password);
          }
        } else {
          // Old Hashing prior to WHMCS 5.3.9
          $validhash = ($user->password == $password);
        }

        if ($validhash) {
          $departments = explode(',', $user->supportdepts);

          $departmnts = array();
          foreach ($departments as $key => $id) {
            $department = Plugins\WHMCS\TicketDepartment::where_id_is($id)->find_one();
            if ($department !== false) {
              $departmnts[] = $department->name;
            }
          }
          $department = implode('; ', $departmnts);

          $firstname = htmlspecialchars_decode($user->firstname, ENT_QUOTES);
          $lastname = htmlspecialchars_decode($user->lastname, ENT_QUOTES);

          // Update Account
          $operator = Operator::where_id_is($_OPERATOR['ID'])->find_one();
          if ($operator !== false) {
            $operator->username = $username;
            $operator->password = $hash;
            $operator->firstname = $firstname;
            $operator->lastname = $lastname;
            $operator->email = $user->email;
            $operator->department = $department;
            $operator->custom = $user->id;
            $operator->save();
          }

          $_OPERATOR['USERNAME'] = $user->username;
          $_OPERATOR['PASSWORD'] = $user->password;
          $_OPERATOR['NAME'] = (!empty($lastname)) ? $firstname . ' ' . $lastname : $firstname;
          $_OPERATOR['DEPARTMENT'] = $department;
          return $_OPERATOR;
        }
      } else {

        $operator = Operator::where_id_is($_OPERATOR['ID'])->find_one();
        if ($operator !== false) {
          $_OPERATOR['USERNAME'] = $operator->username;
          $_OPERATOR['PASSWORD'] = $operator->password;
          $_OPERATOR['NAME'] = (!empty($operator->lastname)) ? $operator->firstname . ' ' . $operator->lastname : $operator->firstname;
          $_OPERATOR['DEPARTMENT'] = $operator->department;
        }

        return $_OPERATOR;
      }
    }
    return $_OPERATOR;
  }

  function LoginFailed($data) {

    global $_SETTINGS;

    $_OPERATOR = $data['Operator'];
    $password = $data['Password'];

    // Sync WHMCS Account
    $user = Plugins\WHMCS\Admin::where('username', $_OPERATOR['USERNAME'])->find_one();
    if ($user !== false) {

      $validhash = false;
      if (class_exists('WHMCS\\Security\\Hash\\Password') || class_exists('WHMCS_Security_Hash_Password')) {
        if (class_exists('WHMCS\\Security\\Hash\\Password')) {
          $whmcshasher = new Password();
        } else {
          $whmcshasher = new \WHMCS_Security_Hash_Password();
        }
        $validhash = $whmcshasher->verify($password, $user->password);
        if ($validhash){
          // Valid WHMCS Admin
          // Generate Live Help Hash for subsequent login attempts
          $livehelphasher = new PasswordHash(8, true);
          $hash = $livehelphasher->HashPassword($password);
        }
      } else {
        // Old Hashing prior to WHMCS 5.3.9
        $validhash = ($user->password == $password);
      }

      if ($validhash) {
        $departments = explode(',', $user->supportdepts);

        $departmnts = array();
        foreach ($departments as $key => $id) {
          $department = Plugins\WHMCS\TicketDepartment::where_id_is($id)
            ->find_one();

          if ($department !== false) {
            $departmnts[] = $department->name;
          }
        }
        $department = implode('; ', $departmnts);

        // Update Account
        $operator = Operator::where_id_is($_OPERATOR['ID'])
          ->find_one();

        if ($operator !== false) {
          $operator->username = $user->username;
          $operator->password = $user->password;
          $operator->firstname = $user->firstname;
          $operator->lastname = $user->lastname;
          $operator->email = $user->email;
          $operator->department = $department;
          $operator->custom = $user->id;
          $operator->save();
        }

        $_OPERATOR['USERNAME'] = $user->username;
        $_OPERATOR['PASSWORD'] = $user->password;
        $_OPERATOR['NAME'] = (!empty($user->lastname)) ? $user->firstname . ' ' . $user->lastname : $user->firstname;
        $_OPERATOR['DEPARTMENT'] = $department;
        return $_OPERATOR;
      }

    }

    return $_OPERATOR;
  }

  function LoginAccountMissing($data) {

    global $_SETTINGS;

    $username = $data['Username'];
    $password = $data['Password'];

    // Username Special Characters / MD5 Password Hash
    if (isset($_REQUEST['Version']) && $_REQUEST['Version'] >= 4.0) {
      $username = htmlspecialchars($username, ENT_QUOTES);
      $password = md5(htmlspecialchars($password));
    }

    // WHMCS Account
    $user = Plugins\WHMCS\Admin::where('username', $username)->find_one();
    if ($user !== false) {

      // Departments
      $departments = explode(',', $user->supportdepts);
      $departmnts = array();
      foreach ($departments as $key => $id) {
        $department = Plugins\WHMCS\TicketDepartment::where_id_is($id)->find_one();

        if ($department !== false) {
          $departmnts[] = $department->name;
        }
      }
      $department = implode('; ', $departmnts);

      $validhash = false;
      if (class_exists('WHMCS\\Security\\Hash\\Password') || class_exists('WHMCS_Security_Hash_Password')) {
        if (class_exists('WHMCS\\Security\\Hash\\Password')) {
          $whmcshasher = new Password();
        } else {
          $whmcshasher = new \WHMCS_Security_Hash_Password();
        }
        $validhash = $whmcshasher->verify($password, $user->password);
        if ($validhash){
          // Valid WHMCS Admin
          // Generate Live Help Hash for subsequent login attempts
          $livehelphasher = new PasswordHash(8, true);
          $password = $data['Password'];
          $hash = $livehelphasher->HashPassword($password);
        }
      } else {
        // Old Hashing prior to WHMCS 5.3.9
        $validhash = ($user->password == $password);
      }

      // Operator Password
      if ($validhash) {

        // Existing Operator
        $operator = Operator::where('custom', $user->id)->find_one();

        $firstname = htmlspecialchars_decode($user->firstname, ENT_QUOTES);
        $lastname = htmlspecialchars_decode($user->lastname, ENT_QUOTES);

        if ($operator !== false) {

          $operator->username = $data['Username'];
          $operator->password = $hash;
          $operator->firstname = $firstname;
          $operator->lastname = $lastname;
          $operator->email = $user->email;
          $operator->department = $department;
          $operator->save();

        } else {

          $operator = Operator::create();
          $operator->username = $data['Username'];
          $operator->password = $hash;
          $operator->firstname = $firstname;
          $operator->lastname = $lastname;
          $operator->datetime = date('Y-m-d H:i:s', time());
          $operator->email = $user->email;
          $operator->department = $department;
          $operator->image = '';
          $operator->privilege = -1;
          $operator->status = -1;
          $operator->custom = $user->id;
          $operator->save();

        }

        $_OPERATOR['ID'] = $operator->id;
        $_OPERATOR['USERNAME'] = $operator->username;
        $_OPERATOR['PASSWORD'] = $operator->password;
        $_OPERATOR['NAME'] = (!empty($operator->lastname)) ? $operator->firstname . ' ' . $operator->lastname : $operator->firstname;
        $_OPERATOR['DEPARTMENT'] = $operator->department;
        $_OPERATOR['DATETIME'] = $operator->datetime;
        $_OPERATOR['PRIVILEGE'] = $operator->privilege;
        $_OPERATOR['STATUS'] = $operator->status;
        return $_OPERATOR;

      }
    }

    return false;
  }

  function SettingsLoaded($_SETTINGS = false) {

    global $_SETTINGS;

    if (!empty($settings)) {
      $_SETTINGS = $settings;
    }

    $config = array();
    $settings = Plugins\WHMCS\Setting::find_many();
    if ($settings !== false) {
      foreach ($settings as $key => $setting) {
        $config[$setting->setting] = $setting->value;
      }
    }

    $domain = '';
    if (!empty($config['SystemSSLURL'])) {
      $domain = trim($config['SystemSSLURL']);
    } else {
      $domain = trim($config['SystemURL']);
    }
    if (substr($domain, -1) != '/') { $domain = $domain . '/'; }

    $host = str_replace(array('http://', 'https://'), '', $domain);

    $_SETTINGS['HTMLHEAD'] = <<<END
<!-- Chatstack - https://www.chatstack.com International Copyright - All Rights Reserved //-->
<!--  BEGIN Chatstack - https://www.chatstack.com Messenger Code - Copyright - NOT PERMITTED TO MODIFY COPYRIGHT LINE / LINK //-->
<script type="text/JavaScript" src="{$domain}modules/livehelp/scripts/jquery-latest.js"></script>
<script type="text/javascript">
<!--
  var Chatstack = {};
  Chatstack.server = '{$host}';

  (function(d, $, undefined) {
    $(window).ready(function() {
      Chatstack.e = []; Chatstack.ready = function (c) { Chatstack.e.push(c); }
      var b = d.createElement('script'); b.type = 'text/javascript'; b.async = true;
      b.src = ('https:' == d.location.protocol ? 'https://' : 'http://') + Chatstack.server + '/livehelp/scripts/jquery.livehelp.js';
      var s = d.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(b, s);
    });
  })(document, jQuery);
-->
</script>
<!--  END Chatstack - https://www.chatstack.com Messenger Code - Copyright - NOT PERMITTED TO MODIFY COPYRIGHT LINE / LINK //-->
END;

    $_SETTINGS['HTMLBODY'] = '';

    $_SETTINGS['HTMLIMAGE'] = <<<END
<!-- Chatstack - https://www.chatstack.com International Copyright - All Rights Reserved //-->
<!--  BEGIN Chatstack - https://www.chatstack.com Messenger Code - Copyright - NOT PERMITTED TO MODIFY COPYRIGHT LINE / LINK //-->
<a href="#" class="LiveHelpButton"><img src="{$domain}modules/livehelp/status.php" id="LiveHelpStatusDefault" name="LiveHelpStatusDefault" border="0" alt="Live Help" class="LiveHelpStatus"/></a>
<!--  END Chatstack - https://www.chatstack.com Messenger Code - Copyright - NOT PERMITTED TO MODIFY COPYRIGHT LINE / LINK //-->
END;

    return $_SETTINGS;

  }

  function SettingsPlugin($json) {

    global $customadminpath;

    if (!$json) {
?>
<Plugin ID="WHMCS">
<?php
      // WHMCS SSL URL
      $setting = Plugins\WHMCS\Setting::where_id_is('SystemSSLURL')->find_one();
      $address = $setting->value;
      if (empty($address)) {
        $setting = Plugins\WHMCS\Setting::where_id_is('SystemURL')->find_one();
        $address = $setting->value;
      }

      if (substr($address, -1) != '/') {
        $address = $address . '/';
      }

      require_once __DIR__ . '/../../../../../configuration.php';

      if (!isset($customadminpath) && empty($customadminpath)) { $customadminpath = 'admin'; }
      $address .= $customadminpath . '/';
?>
<QuickLinks Address="<?php echo($address); ?>">
<Link Name="Summary" Image="card-address">clientssummary.php?userid={0}</Link>
<Link Name="Orders" Image="shopping-basket">orders.php?client={0}</Link>
<Link Name="Products / Services" Image="box">clientshosting.php?userid={0}</Link>
<Link Name="Domains" Image="globe-medium-green">clientsdomains.php?userid={0}</Link>
<Link Name="Invoices" Image="document-invoice">clientsinvoices.php?userid={0}</Link>
<Link Name="Add Order" Image="shopping-basket--plus">ordersadd.php?userid={0}</Link>
<Link Name="Create Invoice" Image="document--plus">invoices.php?action=createinvoice&amp;userid={0}</Link>
<Link Name="Quotes" Image="documents-text">clientsquotes.php?userid={0}</Link>
<Link Name="Tickets" Image="ticket">supporttickets.php?view=any&amp;client={0}</Link>
<Link Name="Emails" Image="mail-open-document">clientsemails.php?userid={0}</Link>
</QuickLinks>
</Plugin>
<?php
    }
  }

  function VisitorCustomDetails($visitor) {

    global $_OPERATOR;

    // Custom Integration Details
    $custom = Custom::where('request', $visitor->id)->find_one();
    if ($custom !== false) {
      if (!property_exists($visitor, 'name')) {
        $visitor->name = $custom->name;
      }
      if (!property_exists($visitor, 'email')) {
        $visitor->email = $custom->custom;
      }
      $visitor->reference = $custom->reference;

      // Client
      $custom = array();
      $client = Plugins\WHMCS\Client::where('email', $visitor->email)->find_one();
      if ($client !== false) {
        $address = new Address();
        $address->address1 = $client->address1;
        $address->address2 = $client->address2;
        $address->city = $client->city;
        $address->state = $client->state;
        $address->postcode = $client->postcode;
        $country = Country::where_id_is($client->country)->find_one();
        if ($country !== false) {
          $address->country = ucwords(strtolower($country->country));
        }
      }

      $visitor->company = $client->companyname;
      $visitor->address = $address;
      $visitor->telephone = $client->phonenumber;

      $group = new VisitorGroup();
      $group->id = 'whmcs';
      $group->name = 'WHMCS';
      $group->position = 'address';

      $section = new VisitorSection();
      $section->id = 'products';
      $section->name = 'Products & Services';
      $hosting = $client->hosting()->find_many();
      if ($hosting !== false) {
        foreach ($hosting as $key => $plan) {
          $product = $plan->product()->find_one();
          if ($product !== false) {
            $productgroup = $product->group()->find_one();
            if ($productgroup !== false) {
              $item = new VisitorItem();
              $item->value = sprintf('%s, %s (%s)', $product->name, $productgroup->name, $plan->domain);
              $section->items[] = $item;
            }
          }
        }
      }
      $group->sections[] = $section;

      // Notes
      $section = new VisitorSection();
      $section->id = 'notes';
      $section->name = 'Notes';

      $item = new VisitorItem();
      $item->value = $client->notes;
      $section->items[] = $item;
      $group->sections[] = $section;

      // Security Question
      $securityquestion = $client->securityquestion()->find_one();
      if ($securityquestion !== false) {
        $securityquestion = Plugins\WHMCS\decryptPassword($securityquestion->question, $_OPERATOR['USERNAME']);
        $securityanswer = Plugins\WHMCS\decryptPassword($client->securityqans, $_OPERATOR['USERNAME']);
        if ($securityquestion !== false && $securityanswer !== false) {

          $section = new VisitorSection();
          $section->id = 'securityquestion';
          $section->name = 'Security Question';

          $item = new VisitorItem();
          $item->value = $securityquestion;
          $section->items[] = $item;
          $group->sections[] = $section;

          $section = new VisitorSection();
          $section->id = 'securityanswer';
          $section->name = 'Security Answer';

          $item = new VisitorItem();
          $item->value = $securityanswer;
          $section->items[] = $item;
          $group->sections[] = $section;
        }
      }

      $visitor->groups[] = $group;
      $visitor->custom = true;
      return $visitor;
    }

    return false;
  }

  function DepartmentsLoaded($departments) {

    $departs = $departments;
    $departments = array();
    if (is_array($departs)) {
      foreach ($departs as $key => $department) {
        // WHMCS Department
        $ticketdepartment = Plugins\WHMCS\TicketDepartment::where('name', $department)->find_one();
        if ($ticketdepartment !== false) {
          if ($ticketdepartment->hidden != 'on') {
            $departments[] = $ticketdepartment->name;
          }
        } else {
          $departments[] = $department;
        }
      }
      sort($departments);
      return $departments;
    }
    return $departs;
  }

  function VisitorCustomDetailsInitialised($args) {

    global $_SETTINGS;

    // Arguments
    $request = $args['request'];
    $custom = $args['custom'];
    $plugin = $args['plugin'];

    // Confirm Numeric ID
    if ($plugin == 'WHMCS') {

      // WHMCS Account Name
      if (empty($name)) {

        // Client
        $client = Plugins\WHMCS\Client::where('email', $custom)->find_one();
        if ($client !== false) {
          $name = $client->firstname . ' ' . $client->lastname;

          // Charset Setting
          $setting = Plugins\WHMCS\Setting::where_id_is('Charset')->find_one();
          if ($setting !== false) {
            $charset = $setting->value;
            if (!empty($charset) && $charset != 'utf-8') {
              $name = iconv($charset, 'UTF-8', $name);
            }
          }
        }
      }

      $exists = Custom::where('request', $request)
        ->where('reference', $plugin)
        ->find_one();

      if ($exists !== false) {

        // Update Custom Integration
        $exists->custom = $custom;
        $exists->name = $name;
        $exists->save();

      } else {

        // Custom Integration
        $integration = Custom::create();
        $integration->request = $request;
        $integration->custom = $custom;
        $integration->name = $name;
        $integration->reference = $plugin;
        $integration->save();

        $chatdetails = false;
        if (is_numeric($request) && (int)$request > 0 && $_SETTINGS['DATABASEVERSION'] < 11) {
          $chatdetails = Chat::where('request', $request)->find_one();
        } else if ($_SETTINGS['DATABASEVERSION'] > 10) {
          $chatvisitor = ChatVisitor::where('visitor', $request)->find_one();
          if ($chatvisitor !== false) {
            $chat = $chatvisitor->chat()->find_one();
          }
        }

        if ($chatdetails !== false && !empty($chatdetails->username)) {

          $messagedetails = Message::where('chat', $chat)
            ->where('status', -4)
            ->find_one();

          if ($messagedetails !== false) {
            // Integration Message Alert
            $message = Message::create();
            $message->chat = $chat;
            $message->username = $chatdetails->username;
            $message->datetime = date('Y-m-d H:i:s', time());
            $message->message = sprintf('%s has just signed into %s', $chatdetails->username, $plugin);
            $message->align = $id;
            $message->status = -2;
            $message->save();
          }
        }
      }
    }

  }

  function VisitorAdded($args) {

    $visitor = $args;

    // WHMCS Integration / Quick Links
    if ($visitor !== false && (isset($_COOKIE['WHMCSUID']) || isset($_SESSION['uid']))) {
      $id = (isset($_COOKIE['WHMCSUID']) ? $_COOKIE['WHMCSUID'] : $_SESSION['uid']);
      $reference = 'WHMCS';
      $name = '';

      if (is_numeric($id)) {

        $client = Plugins\WHMCS\Client::where_id_is($id)->find_one();
        if ($client !== false) {
          $name = $client->firstname . ' ' . $client->lastname;

          $custom = Custom::create();
          $custom->request = (int)$visitor->id;
          $custom->custom = $email;
          $custom->name = $name;
          $custom->reference = $reference;
          $custom->save();
        }
      }
    }
  }

}

// Add Hook Functions
// $hooks->add('ExampleHooks', 'EventName', 'FunctionName');
$class = 'LiveHelpWHMCSHooks';

if (isset($_PLUGINS) && isset($_PLUGINS['WHMCS'])) {
  $hooks->add($class, 'CloseChat', 'CloseChat');
  $hooks->add($class, 'LoginCustomHash', 'LoginCustomHash');
  $hooks->add($class, 'LoginCompleted', 'LoginCompleted');
  $hooks->add($class, 'LoginFailed', 'LoginFailed');
  $hooks->add($class, 'LoginAccountMissing', 'LoginAccountMissing');
  $hooks->add($class, 'SettingsLoaded', 'SettingsLoaded');
  $hooks->add($class, 'SettingsPlugin', 'SettingsPlugin');
  $hooks->add($class, 'ResponsesCustom', 'ResponsesCustom');
  $hooks->add($class, 'DepartmentsLoaded', 'DepartmentsLoaded');
  $hooks->add($class, 'VisitorCustomDetails', 'VisitorCustomDetails');
  $hooks->add($class, 'VisitorCustomDetailsInitialised', 'VisitorCustomDetailsInitialised');
  $hooks->add($class, 'VisitorAdded', 'VisitorAdded');
}

?>
