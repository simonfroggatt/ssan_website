
$(document).ready(function() {

  showMessage();

});

function showMessage(){
  var shouldShow;
  shouldShow = checkToShowXmas();
  if(shouldShow == true){
    $.featherlight("https://www.safetysignsandnotices.co.uk/image/xmas-message-2019.png", configuration);
    Cookies.set('xmasMessage2020', false);
  }

}

function checkToShowXmas() {
  var xmasStatus;

  xmasStatus = Cookies.get('xmasMessage');

  if (typeof xmasStatus == 'undefined')
  {
      Cookies.set('xmasMessage2020', true);
      xmasStatus = true;
  }

  var today = new Date();
  var myDate = new Date(2020, 0, 6);

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
