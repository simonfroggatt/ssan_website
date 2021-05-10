<footer>
  <div class="container">
    <div class="row">
      <?php if ($informations) { ?>
      <div class="col-sm-2">
        <h5><?php echo $text_information; ?></h5>
        <ul class="list-unstyled">
          <?php foreach ($informations as $information) { ?>
          <li><a href="<?php echo $information['href']; ?>"><?php echo $information['title']; ?></a></li>
          <?php } ?>
        </ul>
      </div>
      <?php } ?>
      <div class="col-sm-2">
        <h5><?php echo $text_service; ?></h5>
        <ul class="list-unstyled">
          <li><a href="<?php echo $contact; ?>"><?php echo $text_contact; ?></a></li>
          <!-- <li><a href="<?php echo $return; ?>"><?php echo $text_return; ?></a></li> -->
          <li><a href="<?php echo $sitemap; ?>"><?php echo $text_sitemap; ?></a></li>
        </ul>
      </div>

      <div class="col-sm-2">
        <h5><?php echo $text_account; ?></h5>
        <ul class="list-unstyled">
          <li><a href="<?php echo $account; ?>"><?php echo $text_account; ?></a></li>
          <li><a href="<?php echo $order; ?>"><?php echo $text_order; ?></a></li>
        </ul>
      </div>
      <div class="col-sm-1">
        <ul class="list-unstyled">
          <li><script type="text/javascript" src="https://sealserver.trustwave.com/seal.js?code=e0885ece86954c40b85381c8a8c874b6"></script></li>
        </ul>
      </div>

      <div class="col-sm-4">

        <ul class="list-inline payment-methods text-center payment-methods-o payment-methods-1_5">
          <li><i class="pf pf-mastercard-alt"></i></li>
          <li><i class="pf pf-visa"></i></li>
          <li><i class="pf pf-maestro-alt"></i></li>
          <li><i class="pf pf-american-express"></i></li>
          <li><i class="pf pf-paypal"></i></li>

        </ul>
        <ul class="list-inline payment-methods text-center payment-methods-o payment-methods-1_5">
          <li><img src="/image/3rdpartylogo/fsb.svg" alt="FSB logo"> </li>
          <li><img src="/image/3rdpartylogo/comodo-security.svg" height="50" alt="comodo logo"></li>
        </ul>
      </div>
      <div class="col-sm-1">
        <ul class="list-inline payment-methods text-center payment-methods-o payment-methods-1_5">
          <li><img src="/image/3rdpartylogo/mib_living_wage.svg"></li>
        </ul>
      </div>




    </div>
    <p class="text-center"><?php echo $powered; ?></p>
  </div>

</footer>

<script src="catalog/view/javascript/common.js"></script>


<script src="//cdnjs.cloudflare.com/ajax/libs/cookieconsent2/3.0.3/cookieconsent.min.js"></script>

<script src="catalog/view/javascript/cookie/cookie_compliance.js"></script>


<script src="catalog/view/javascript/ssan/bootbox.min.js" ></script>

<!-- scheme.org  -->
<script type="application/ld+json">{"@context": "http://schema.org","@type": "Organization","url": "https://www.safetysignsandnotics.co.uk","logo": "https://www.safetysignsandnotices.co.uk/image/safetysigns_logo.jpg","contactPoint":[{"@type": "ContactPoint","telephone": "+441157270172","contactType": "sales","areaServed": "GB","availableLanguage": "English"}]}</script>
<script type="application/ld+json">{"@context": "http://schema.org","@type": "WebSite","url": "https://www.safetysignsandnotices.co.uk/","potentialAction": {"@type": "SearchAction","target": "https://www.safetysignsandnotices.co.uk/index.php?route=product/search&search={search_term_string}","query-input": "required name=search_term_string"}}</script>



<script src="catalog/view/javascript/ssan/jquery.number.min.js"></script>




<script src="catalog/view/javascript/ssan/pca.js"></script>


<script src="catalog/view/javascript/featherlight/featherlight.min.js" type="text/javascript" charset="utf-8"></script>
<script src="catalog/view/javascript/ssan/xmas2020.js"></script>

<script src="catalog/view/javascript/jquery/rangeslider/rangeslider.js"></script>
   <script src="catalog/view/javascript/ssan/float-label.js"></script>

  <script src="catalog/view/javascript/jquery/owl-carousel-2/owl.carousel.js"></script>

  <script type="text/javascript" src="catalog/view/javascript/lazy/jquery.lazy.min.js"></script>
    <script type="text/javascript" src="catalog/view/javascript/lazy/jquery.lazy.plugins.min.js"></script>


<!-- UKFast's 100% Carbon Neutral Logo Accreditation -->
<script type='text/javascript'>
  (function() {
    function ukfast_cnh_async_load(){
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = 'https://my.ukfast.co.uk/carbon-neutral-hosting/badge_of_honour.js?key=1c5utaf4t4i';
      document.body.appendChild(s);
    }
    if (window.attachEvent) { window.attachEvent('onload', ukfast_cnh_async_load); } else { window.addEventListener('load', ukfast_cnh_async_load, false); }
  })();
</script>

</body></html>
