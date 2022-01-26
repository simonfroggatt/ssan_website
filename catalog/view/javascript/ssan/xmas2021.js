
$(document).ready(function() {

  showMessage();

});

function showMessage(){
  var shouldShow;
  shouldShow = checkToShowXmas();
  if(shouldShow === true){
    $.featherlight("https://www.safetysignsandnotices.co.uk/image/moving.png", configuration);
    Cookies.set('moving2022', false, { secure: true });
  }

}

function checkToShowXmas() {
  var xmasStatus;

  xmasStatus = Cookies.get('moving2022');

  if (typeof xmasStatus == 'undefined')
  {
      Cookies.set('moving2022', true, { secure: true });
      xmasStatus = true;
  }

  var today = new Date();
  var myDate = new Date(2022, 1, 1);

  if(today > myDate){
    xmasStatus = false;
  }

  return xmasStatus;
}

var configuration = ({
  namespace:      'featherlight',
   afterOpen: function(event){
      //code here
   },
   beforeOpen: function(event){
     //code here
   },

});
