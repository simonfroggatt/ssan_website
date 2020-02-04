
<form id="form-header-search" name="form-header-search">
    <div class="typeahead__container">
        <div class="typeahead__field">
          <!--  <span class="typeahead__query"> -->
                <input class="js-typeahead-header-search input-lg" name="search" type="search" placeholder="Start typing to Search...e.g Fire Exit Left--" autocomplete="off">
        <!--    </span> -->
           <!-- <span class="typeahead__button"> -->
                <button type="submit" class="btn btn-default btn-lg">
                    <i class="fa fa-search fa-2x"></i>
                </button>
       <!--     </span> -->
        </div>
    </div>
</form>


<script>


$.typeahead({
    input: '.js-typeahead-header-search',
    minLength: 3,
    maxItem: 0,
    dynamic: true,
    delay: 200,
    correlativeTemplate: true,
    searchOnFocus: true,
    cancelButton: true,
    highlight: "any",

    href: "index.php?route=product/search&search={{query}}&description=true",
    group: true,

    generateOnLoad: false,
    source: {
      category: {
        href: "index.php?route=product/category&path={{path}}",
        display: "title",
        template: "{{title}}",
          ajax: function (query) {
              return {
                  type: "GET",
                  url: "catalog/view/theme/safetysignsandnotices/template/ssan/search_data_2.php",
                  path: "data.category",
                  data: {
                      q: "{{query}}"
                  }
              }
          }

      },
      product: {
        display: ['title','code', 'desc', 'keywords', 'price'],
        href: "index.php?route=product/product&path={{category_path}}&product_id={{path}}",
        //template: '<div class="row"><div class="col-md-3"><img src="http://www.safetysignsandnotices.net/image/{{image}}" height="20px"></div></div>',
        //template: function (query, item) {
          //              return "<img src='http://www.safetysignsandnotices.net/image/{{image}}' height='20px'>";
            //        },
        template: "{{title}}   <img src='https://www.safetysignsandnotices.co.uk/image/{{image}}' height='30px'> from £{{price}}",
          ajax: function (query) {
              return {
                  type: "GET",
                  url: "catalog/view/theme/safetysignsandnotices/template/ssan/search_data_2.php",
                  path: "data.product",
                  data: {
                      q: "{{query}}"
                  }
              }
          }

      }
    },
    callback: {
      /*onLayoutBuiltBefore: function (node, query, result, resultHtmlList) {
            resultHtmlList.find('li[data-search-group="product"]').remove();
            return resultHtmlList;
        }*/
        onSubmit: function (node, form, items, event) {
          //  alert('submit');
            event.preventDefault();
            window.location = "index.php?route=product/search&search=" + this.query + "&description=true";

        },
        onClickAfter: function (node, a, item, event) {
        //  alert('afterclick');
          event.preventDefault();
          window.location = item.href;
          /*  event.preventDefault();

            var r = confirm("You will be redirected to:\n" + item.href + "\n\nContinue?");
            if (r == true) {
                window.open(item.href);
            }

            $('#result-container').text('');
*/
        }
    },
    debug: true
});



</script>
