<?php /* Smarty version 2.6.27, created on 2017-11-18 21:15:55
         compiled from default/chat.tpl */ ?>
<div class="LiveHelpMobileButton">
	<span class="icon"></span>
	<span class="label"></span>
</div>
<div id="LiveHelpEmbedded" class="closed">
	<div class="sprite embed LiveChatIcon">
		<div class="LiveHelpOnlineIcon" style="display: block;">
			<div class="OperatorImage"></div>
		</div>
	</div>
	<div class="LiveHelpOperator">
		<div class="OperatorImage"></div>
	</div>
	<div id="LiveHelpStatusText"><?php echo $this->_tpl_vars['LOCALE']['online']; ?>
</div>
	<div id="LiveHelpLogo"></div>
	<div id="LiveHelpCampaign"></div>
	<div id="LiveHelpCloseButton" title="Close" class="CloseButton sprite embed expand"></div>
	<div id="LiveHelpNotification" class="sprite Notification"><span></span></div>
	<div id="LiveHelpTab" class="TabBackground"></div>
	<div class="OperatorBackground">
		<div id="LiveHelpOperatorImage"></div>
		<div class="sprite OperatorForeground"></div>
		<div id="LiveHelpOperatorNameBackground">
			<div id="LiveHelpOperatorName"></div>
			<div id="LiveHelpOperatorDepartment"></div>
		</div>
	</div>
	<div id="LiveHelpBody">
		<div id="LiveHelpBackground" class="ChatBackground"></div>
		<div id="LiveHelpCollapseButton" title="Expand" class="sprite Expand"></div>
		<div id="LiveHelpSignedIn">
			<div id="LiveHelpScroll">
				<div id="LiveHelpWaiting" data-lang-key="thankyoupatience"><?php echo $this->_tpl_vars['LOCALE']['thankyoupatience']; ?>
</div>
				<div id="LiveHelpMessages"></div>
				<div id="LiveHelpMessagesEnd">
					<div id="LiveHelpClosedChatMessage"><?php echo $this->_tpl_vars['LOCALE']['closedusermessage']; ?>
 <a href="#"><?php echo $this->_tpl_vars['LOCALE']['restartchat']; ?>
</a></div>
				</div>
			</div>
		</div>
		<div id="LiveHelpConnecting">
			<div class="connecting-container">
				<div class="connecting-text"><?php echo $this->_tpl_vars['LOCALE']['connecting']; ?>
</div>
			</div>
		</div>
		<div id="LiveHelpSignIn">
			<div id="LiveHelpSignInDetails"><?php echo $this->_tpl_vars['LOCALE']['welcome']; ?>
<br/><?php echo $this->_tpl_vars['LOCALE']['enterguestdetails']; ?>
</div>
			<div id="LiveHelpBlockedChatDetails" style="display:none"><?php echo $this->_tpl_vars['LOCALE']['chatsessionblocked']; ?>
</div>
			<div id="LiveHelpError">
				<div id="LiveHelpErrorIcon" class="sprite Cross"></div>
				<div id="LiveHelpErrorText"><?php echo $this->_tpl_vars['LOCALE']['invalidemail']; ?>
</div>
			</div>
			<div id="LiveHelpLogin" class="LiveHelpLogin">
				<div id="Inputs" <?php echo $this->_tpl_vars['rtl']; ?>
>
					<label class="NameLabel" <?php echo $this->_tpl_vars['rtl']; ?>
><?php echo $this->_tpl_vars['LOCALE']['name']; ?>
<br/>
						<div class="LiveHelpInput">
							<input id="LiveHelpNameInput" type="text" tabindex="100" <?php echo $this->_tpl_vars['dir']; ?>
/>
							<div id="LiveHelpNameError" title="Name Required" class="sprite InputError"></div>
						</div>
					</label>
					<label class="EmailLabel" <?php echo $this->_tpl_vars['rtl']; ?>
><?php echo $this->_tpl_vars['LOCALE']['email']; ?>
<br/>
						<div class="LiveHelpInput">
							<input id="LiveHelpEmailInput" type="text" tabindex="101" <?php echo $this->_tpl_vars['dir']; ?>
/>
							<div id="LiveHelpEmailError" title="Email Required" class="sprite InputError"></div>
						</div>
					</label>
					<label id="LiveHelpDepartmentLabel" <?php echo $this->_tpl_vars['rtl']; ?>
><?php echo $this->_tpl_vars['LOCALE']['department']; ?>
<br/>
						<div class="LiveHelpDepartment">
							<select id="LiveHelpDepartmentInput" tabindex="102" <?php echo $this->_tpl_vars['dir']; ?>
></select>
							<div id="LiveHelpDepartmentError" title="Department Required" class="sprite InputError"></div>
						</div>
					</label>
					<label class="QuestionLabel" <?php echo $this->_tpl_vars['rtl']; ?>
><?php echo $this->_tpl_vars['LOCALE']['question']; ?>
<br/>
						<div class="LiveHelpInput">
							<textarea id="LiveHelpQuestionInput" tabindex="103" <?php echo $this->_tpl_vars['dir']; ?>
></textarea>
							<div id="QuestionError" title="Question Required" class="sprite InputError"></div>
						</div>
					</label>
					<div style="text-align: center; margin-top: 10px">
						<div id="LiveHelpConnectButton" class="button" tabindex="104"><?php echo $this->_tpl_vars['LOCALE']['connect']; ?>
</div>
					</div>
				</div>
				<div id="BlockedChat" style="display:none; text-align:center">
					<div style="margin-top:5px; left:15px">
						<div style="font-family: 'Source Sans Pro', sans-serif; padding:5px 0; text-shadow:0 0 1px #ccc; letter-spacing:-1px; font-size:22px; line-height:normal; color:#999"><?php echo $this->_tpl_vars['LOCALE']['accessdenied']; ?>
<br/><?php echo $this->_tpl_vars['LOCALE']['blockedchatsession']; ?>
</div>
						<div style="text-align: center; margin: 10px 0">
							<div id="LiveHelpCloseBlockedButton" class="button"><?php echo $this->_tpl_vars['LOCALE']['closechat']; ?>
</div>
						</div>
					</div>
				</div>
			</div>
			<div id="LiveHelpSocialLogin">
				<div>or</div>
				<div id="LiveHelpTwitterButton" class="sprite Twitter"></div><br/><div id="LiveHelpFacebookButton" class="sprite Facebook"></div>
			</div>
			<a href="https://www.chatstack.com" target="_blank" class="brand" style="display: <?php echo $this->_tpl_vars['style']; ?>
"><div></div></a>
		</div>
	</div>
	<div id="LiveHelpToolbar">
		<div id="LiveHelpEmailChatToolbarButton" title="<?php echo $this->_tpl_vars['LOCALE']['emailchat']; ?>
" class="sprite Email"></div>
		<div id="LiveHelpSoundToolbarButton" title="<?php echo $this->_tpl_vars['LOCALE']['togglesound']; ?>
" class="sprite SoundOn"></div>
		<div id="LiveHelpSwitchPopupToolbarButton" title="<?php echo $this->_tpl_vars['LOCALE']['switchpopupwindow']; ?>
" class="sprite Popup"></div>
		<div id="LiveHelpFeedbackToolbarButton" title="<?php echo $this->_tpl_vars['LOCALE']['feedback']; ?>
" class="sprite Feedback"></div>
		<div id="LiveHelpDisconnectToolbarButton" title="<?php echo $this->_tpl_vars['LOCALE']['disconnect']; ?>
" class="sprite Disconnect"></div>
	</div>
	<div id="LiveHelpInput" class="MessageBackground">
		<div id="LiveHelpTyping">
			<div class="sprite Typing"></div>
			<span></span>
		</div>
		<textarea id="LiveHelpMessageTextarea" placeholder="<?php echo $this->_tpl_vars['LOCALE']['enteryourmessage']; ?>
" <?php echo $this->_tpl_vars['dir']; ?>
></textarea>
		<div id="LiveHelpSmiliesButton" title="Smilies" class="sprite SmilieButton"></div>
		<div id="LiveHelpSendFileButton" class="sprite SmilieButton"></div>
		<div id="LiveHelpSendButton" class="sprite SendButton">
			<div><?php echo $this->_tpl_vars['LOCALE']['send']; ?>
</div>
		</div>
		<a href="https://www.chatstack.com" target="_blank" class="brand" style="display: <?php echo $this->_tpl_vars['style']; ?>
"><div></div></a>
	</div>
	<div id="SmiliesTooltip"><div><span title="Laugh" class="sprite Laugh"></span><span title="Smile" class="sprite Smile"></span><span title="Sad" class="sprite Sad"></span><span title="Money" class="sprite Money"></span><span title="Impish" class="sprite Impish"></span><span title="Sweat" class="sprite Sweat"></span><span title="Cool" class="sprite Cool"></span><br/></span><span title="Frown" class="sprite Frown"></span><span title="Wink" class="sprite Wink"></span><span title="Surprise" class="sprite Surprise"></span><span title="Woo" class="sprite Woo"></span><span title="Tired" class="sprite Tired"></span><span title="Shock" class="sprite Shock"></span><span title="Hysterical" class="sprite Hysterical"></span><br/></span><span title="Kissed" class="sprite Kissed"></span><span title="Dizzy" class="sprite Dizzy"></span><span title="Celebrate" class="sprite Celebrate"></span><span title="Angry" class="sprite Angry"></span><span title="Adore" class="sprite Adore"></span><span title="Sleep" class="sprite Sleep"></span><span title="Quiet" class="sprite Stop"></span></div></div>
	<iframe id="LiveHelpFileDownload" name="FileDownload" frameborder="0" height="0" width="0"></iframe>
	<div id="LiveHelpFileTransfer"><div id="FileTransferActionText" class="sprite FileTransferActionText"></div><div class="FileTransferDropTarget"><div id="FileTransferText"></div></div></div>
	<div id="LiveHelpDisconnect">
		<div id="LiveHelpDisconnectTitle"><?php echo $this->_tpl_vars['LOCALE']['disconnecttitle']; ?>
</div><br/>
		<span><?php echo $this->_tpl_vars['LOCALE']['disconnectdescription']; ?>
</span>
		<div id="LiveHelpDisconnectButton" class="flat-button blue"><?php echo $this->_tpl_vars['LOCALE']['disconnect']; ?>
</div>
		<div id="LiveHelpCancelButton" class="flat-button white"><?php echo $this->_tpl_vars['LOCALE']['cancel']; ?>
</div>
	</div>
</div>