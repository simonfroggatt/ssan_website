
<link rel="stylesheet" href="catalog/view/javascript/skeuocard/styles/skeuocard.reset.css" />
<link rel="stylesheet" href="catalog/view/javascript/skeuocard/styles/skeuocard.css" />
<script src="catalog/view/javascript/skeuocard/javascripts/vendor/cssua.min.js"></script>
<script src="catalog/view/javascript/skeuocard/javascripts/skeuocard.js"></script>
<h3>Just type on the card to fill out your details</h3>
<div class="credit-card-input no-js card-wrapper" id="skeuocard">
  <p class="no-support-warning">
    Either you have Javascript disabled, or you're using an unsupported browser, amigo! That's why you're seeing this old-school credit card input form instead of a fancy new Skeuocard. On the other hand, at least you know it gracefully degrades...
  </p>
  <label for="cc_type">Card Type</label>
  <select name="cc_type" id="input-cc_type">
    <option value="">...</option>
    <option value="visa">Visa</option>
    <option value="discover">Discover</option>
    <option value="mastercard">MasterCard</option>
    <option value="maestro">Maestro</option>
    <option value="jcb">JCB</option>
    <option value="unionpay">China UnionPay</option>
    <option value="amex">American Express</option>
    <option value="dinersclubintl">Diners Club</option>
  </select>
  <label for="cc_number">Card Number</label>
  <input type="text" name="cc_number" id="input-cc_number" placeholder="XXXX XXXX XXXX XXXX" maxlength="19" size="19">
  <label for="cc_exp_month">Expiration Month</label>
  <input type="text" name="cc_exp_month" id="input-cc_exp_month" placeholder="00">
  <label for="cc_exp_year">Expiration Year</label>
  <input type="text" name="cc_exp_year" id="input-cc_exp_year" placeholder="00">
  <label for="cc_name">Cardholder's Name</label>
  <input type="text" name="cc_name" id="input-cc_name" placeholder="<?php echo $name_for_card; ?>">
  <label for="cc_cvc">Card Validation Code</label>
  <input type="text" name="cc_cvc" id="input-cc_cvc" placeholder="123" maxlength="3" size="3">
</div>
<!--
<form class="form-horizontal">
  <fieldset id="payment">
    <legend><?php echo $text_credit_card; ?></legend>
    <div class="form-group required">
      <label class="col-sm-2 control-label" for="input-cc-type"><?php echo $entry_cc_type; ?></label>
      <div class="col-sm-10">
        <select name="cc_type" id="input-cc-type" class="form-control">
          <?php foreach ($cards as $card) { ?>
          <option value="<?php echo $card['value']; ?>"><?php echo $card['text']; ?></option>
          <?php } ?>
        </select>
      </div>
    </div>
    <div class="form-group required">
      <label class="col-sm-2 control-label" for="input-cc-number"><?php echo $entry_cc_number; ?></label>
      <div class="col-sm-10">
        <input type="text" name="cc_number" value="" placeholder="<?php echo $entry_cc_number; ?>" id="input-cc-number" class="form-control" />
      </div>
    </div>
    <div class="form-group">
      <label class="col-sm-2 control-label" for="input-cc-start-date"><span data-toggle="tooltip" title="<?php echo $help_start_date; ?>"><?php echo $entry_cc_start_date; ?></span></label>
      <div class="col-sm-3">
        <select name="cc_start_date_month" id="input-cc-start-date" class="form-control">
          <?php foreach ($months as $month) { ?>
          <option value="<?php echo $month['value']; ?>"><?php echo $month['text']; ?></option>
          <?php } ?>
        </select>
      </div>
      <div class="col-sm-3">
        <select name="cc_start_date_year" class="form-control">
          <?php foreach ($year_valid as $year) { ?>
          <option value="<?php echo $year['value']; ?>"><?php echo $year['text']; ?></option>
          <?php } ?>
        </select>
      </div>
    </div>
    <div class="form-group required">
      <label class="col-sm-2 control-label" for="input-cc-expire-date"><?php echo $entry_cc_expire_date; ?></label>
      <div class="col-sm-3">
        <select name="cc_expire_date_month" id="input-cc-expire-date" class="form-control">
          <?php foreach ($months as $month) { ?>
          <option value="<?php echo $month['value']; ?>"><?php echo $month['text']; ?></option>
          <?php } ?>
        </select>
      </div>
      <div class="col-sm-3">
        <select name="cc_expire_date_year" class="form-control">
          <?php foreach ($year_expire as $year) { ?>
          <option value="<?php echo $year['value']; ?>"><?php echo $year['text']; ?></option>
          <?php } ?>
        </select>
      </div>
    </div>
    <div class="form-group required">
      <label class="col-sm-2 control-label" for="input-cc-cvv2"><?php echo $entry_cc_cvv2; ?></label>
      <div class="col-sm-10">
        <input type="text" name="cc_cvv2" value="" placeholder="<?php echo $entry_cc_cvv2; ?>" id="input-cc-cvv2" class="form-control" />
      </div>
    </div>
    <div class="form-group">
      <label class="col-sm-2 control-label" for="input-cc-issue"><span data-toggle="tooltip" title="<?php echo $help_issue; ?>"><?php echo $entry_cc_issue; ?></span></label>
      <div class="col-sm-10">
        <input type="text" name="cc_issue" value="" placeholder="<?php echo $entry_cc_issue; ?>" id="input-cc-issue" class="form-control" />
      </div>
    </div>
  </fieldset>
</form>
-->
<div class="buttons">
  <div class="pull-right">
    <input type="button" value="<?php echo $button_confirm; ?>" id="button-confirm" data-loading-text="<?php echo $text_loading; ?>" class="btn btn-primary" />
  </div>
</div>

</script>

<script type="text/javascript"><!--

$(document).ready(function(){
  var isBrowserCompatible =
    $('html').hasClass('ua-ie-10') ||
    $('html').hasClass('ua-webkit') ||
    $('html').hasClass('ua-firefox') ||
    $('html').hasClass('ua-opera') ||
    $('html').hasClass('ua-chrome');

  if(isBrowserCompatible){
    window.card = new Skeuocard($("#skeuocard"), {
      debug: true

    });
  }
});


$('#button-confirm').bind('click', function() {
	$.ajax({
		url: 'index.php?route=extension/payment/pp_pro/send',
		type: 'post',
		data: $('#skeuocard :input'),
		dataType: 'json',
		beforeSend: function() {
			$('#button-confirm').attr('disabled', true);
			$('#payment').before('<div class="alert alert-info"><i class="fa fa-info-circle"></i> <?php echo $text_wait; ?></div>');
		},
		complete: function() {
			$('.alert').remove();
			$('#button-confirm').attr('disabled', false);
		},
		success: function(json) {
			if (json['error']) {
				alert(json['error']);
			}

			if (json['success']) {
				location = json['success'];
			}
		}
	});
});
//--></script>
