{if not $embed}
{include file="$template/header.tpl"}
{/if}

<div id="Logo">
{if $SETTINGS.LOGO}
  <img id="LogoImage" src="{$SETTINGS.LOGO}" alt="{$SETTINGS.NAME}" border="0"/>
{/if}
</div>

{if $embed}
<div style="background:url({$url}images/OfflineBackgroundTop.png) repeat-x; height:4px; margin:0 4px; position:absolute; top:0; z-index:20; width:875px"></div>
{/if}
<div id="LiveHelpOffline" align="center" style="margin-top:10px;{if $embed}min-height:365px{/if}">
{if $embed}
<div style="margin-top:35px">
<div class="LiveHelpOfflineForm" style="position:absolute; right:20px; top:20px; width:149px; height:93px;"></div>
{/if}
<div id="LiveHelpOfflineHeading" style="{if not $embed}display:none; {/if}font-family: 'Source Sans Pro', sans-serif; text-shadow:0 0 1px #ccc; letter-spacing:-1px; font-size:32px; line-height:35px; color:#999; margin:20px">{$LOCALE.sorryofflineemail}</div>
<div id="LiveHelpOfflineCloseButton" class="LiveHelpOfflineSent button" style="display:none; position:relative; margin-top:20px">{$LOCALE.close}</div>
<div id="LiveHelpOfflineError" class="LiveHelpOfflineForm" style="display:none; background:rgba(255, 176, 176, 0.3); height:30px; margin:20px auto 0; padding:15px; width:425px; border-radius: 4px">
  <div style="padding: 0;"><span class="sprite Cross" style="display: inline-block; float: left"></span>{$LOCALE.offlineerrordescription} <em>{$SETTINGS.EMAIL}</em></div>
</div>
  <form method="post" id="OfflineMessageForm" class="LiveHelpOfflineForm" style="padding:0px; margin:0px;">
    <table border="0" align="center" cellpadding="2" cellspacing="2">
      <tr>
        <td>&nbsp;</td>
        <td colspan="2" valign="bottom"><div id="LiveHelpOfflineDescription" align="center">{$LOCALE.unfortunatelyoffline}<br/>{$LOCALE.filldetailsbelow}:</div></td>
      </tr>
	  {if isset($error) && $error}
      <tr>
        <td>&nbsp;</td>
        <td colspan="2" valign="bottom"><div align="center"><strong>{$error}</strong></div></td>
      </tr>
	  {elseif $disabled}
      <tr>
        <td>&nbsp;</td>
        <td colspan="2" valign="bottom"><div align="center"><strong>{$LOCALE.featuredisabled}</strong></div></td>
      </tr>
      {/if}
      <tr>
        <td>&nbsp;</td>
        <td align="right" valign="middle"><label style="display:inline" for="NAME">{$LOCALE.name}</label></td>
        <td><div style="position:relative; background:#FBFBFB; border:1px solid #E5E5E5; height:35px; padding:0 3px; width:{$SETTINGS.CHATWINDOWWIDTH-225}px"><input name="NAME" type="text" id="NAME" value="{$name}" size="40" tabindex="10" style="background:#FBFBFB; color:#555; border:none; outline:none; margin:0; padding:0; width:{$SETTINGS.CHATWINDOWWIDTH-250}px; -webkit-box-shadow:none; -moz-box-shadow:none; -box-shadow:none; font-family:{$SETTINGS.CHATFONT}; font-size:16px" {if $disabled}disabled="disabled"{/if}/>
          <div id="NameError" title="Name Required" class="sprite" style="display:none; position:absolute; right:5px; top:5px"></div></div></td>
      </tr>
      <tr>
        <td>&nbsp;</td>
        <td align="right" valign="middle"><label style="display:inline" for="EMAIL">{$LOCALE.email}</label></td>
        <td><div style="position:relative; background:#FBFBFB; border:1px solid #E5E5E5; height:35px; padding:0 3px; width:{$SETTINGS.CHATWINDOWWIDTH-225}px"><input name="EMAIL" type="text" id="EMAIL" value="{$email}" size="40" tabindex="11" style="background:#FBFBFB; color:#555; border:none; outline:none; margin:0; padding:0; width:{$SETTINGS.CHATWINDOWWIDTH-250}px;; -webkit-box-shadow:none; -moz-box-shadow:none; -box-shadow:none; font-family:{$SETTINGS.CHATFONT}; font-size:16px" {if $disabled}disabled="disabled"{/if}/>
          <div id="EmailError" title="Email Required" class="sprite" style="display:none; position:absolute; right:5px; top:5px"></div></div></td>
      </tr>
      <tr>
        <td>&nbsp;</td>
        <td align="right" valign="top"><label style="display:inline" for="MESSAGE">{$LOCALE.message}</label></td>
        <td align="right" valign="top"><div align="left">
            <div style="position:relative; background:#FBFBFB; border:1px solid #E5E5E5; height:{$SETTINGS.CHATWINDOWHEIGHT-370}px; padding:3px; width:{$SETTINGS.CHATWINDOWWIDTH-225}px"><textarea name="MESSAGE" cols="30" rows="6" id="MESSAGE" tabindex="12" style="background:#FBFBFB; color:#555; border:none; outline:none; margin:0; padding:0 3px; font-size:16px; width:{$SETTINGS.CHATWINDOWWIDTH-250}px; height:{$SETTINGS.CHATWINDOWHEIGHT-380}px; vertical-align:middle; font-family:{$SETTINGS.CHATFONT}; resize:none; overflow:auto; -webkit-box-shadow:none; -moz-box-shadow:none; -box-shadow:none" {if $disabled}disabled="disabled"{/if}>{$message}</textarea>
            <input x-webkit-speech="x-webkit-speech" id="MESSAGESPEECH" style="font-size: 15px; width: 15px; height: 15px; cursor:pointer; border: none; position: absolute; right: -20px; margin-left: 5px; outline: none; background-color: transparent; color: transparent; -webkit-box-shadow: none; -moz-box-shadow: none; box-shadow: none" />
            <div id="MessageError" title="Message Required" class="sprite" style="display:none; position:absolute; right:5px; top:5px"></div></div></td>
      </tr>
	  {if $security}
      <tr>
        <td>&nbsp;</td>
        <td align="right" valign="middle"><label style="display:inline" for="CAPTCHA">{$LOCALE.securitycode}</label></td>
        <td align="left" valign="middle"><span style="height:30px; vertical-align:middle">
		<div style="position:relative; background:#FBFBFB; border:1px solid #E5E5E5; width:125px; height:35px; padding:3px; margin: 0">
			<input name="CAPTCHA" type="text" id="CAPTCHA" value="" size="6" tabindex="13" style="background:#FBFBFB; color:#555; border:none; outline:none; margin:0; padding:0px; width:100px; -webkit-box-shadow:none; -moz-box-shadow:none; -box-shadow:none; font-family:{$SETTINGS.CHATFONT}; font-size:16px" maxlength="5" {if $disabled}disabled="disabled"{/if}/>
			<div id="SecurityError" title="Security Code Required" class="sprite" style="display:none; position:absolute; right:5px; top:5px"></div>
			<img id="LiveHelpOfflineSecurity" src="{$url}security.php?{$time}{if $captcha}&SECURITY={$captcha}{/if}{if $embed}&EMBED{/if}" style="position:absolute; left:135px; top:0; width:80px; height:30px; vertical-align:middle" alt="Security Code"/><div id="LiveHelpOfflineSecurityRefresh" class="sprite Refresh" style="position:absolute; left:210px; top:0; cursor:pointer"></div>
		</div>
        </span></td>
      </tr>
	  {/if}
      <tr>
        <td>&nbsp;</td>
        <td colspan="2" align="right" valign="top">
			<div align="center"><input name="BCC" id="BCC" type="checkbox" value="1" tabindex="14" {if $disabled}disabled="disabled"{/if}/><label style="display:inline; padding-left:3px" for="BCC">{$LOCALE.sendcopy}</label></div>
		</td>
      </tr>
      <tr>
        <td>&nbsp;</td>
        <td colspan="2" align="right" valign="top"><div align="center">
			      <input name="LANGUAGE" type="hidden" id="LANGUAGE" value="{$language}"/>
      <div align="center">
				<div id="LiveHelpOfflineButton" class="button" style="position:relative; margin-top:5px">{$LOCALE.sendmsg}</div>
			</div>
{if $embed}
			<div class="LiveHelpOfflineForm" style="margin: auto 0; margin:25px 0; background: url({$url}images/OfflineSuggestions.png); width:344px; height:27px"></div>
{/if}
		</td>
      </tr>
    </table>
  </form>
</div>
{if not $embed}
{include file="$template/footer.tpl"}
{else}
</div>
{if $LOCALE.stardevelopcopyright}
<a href="http://livehelp.stardevelop.com/" target="_blank" title="Powered by Live Chat Software"><div class="LiveHelpOfflinePoweredBy sprite PoweredByLiveHelp" style="position:absolute; right:20px; bottom:10px"></div></a>
{/if}
<div style="background:url({$url}images/OfflineBackgroundBottom.png) repeat-x; height:4px; position:relative; left:0; right:0; bottom:0; margin:0 3px; z-index:20"></div>
{/if}
