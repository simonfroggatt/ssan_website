
$(document).ready(function() {

  showMessage();

});

function showMessage(){
  var shouldShow;
  shouldShow = checkToShowXmas();
  if(shouldShow){
    $.featherlight("/image/xmas-message-2020.png", configuration);
    Cookies.set('xmasMessage2021', false);
  }

}

function checkToShowXmas() {
  var xmasStatus;

  xmasStatus = Cookies.get('xmasMessage2021');

  if (typeof xmasStatus == 'undefined')
  {
      Cookies.set('xmasMessage2021', true);
      xmasStatus = true;
  }

  var today = new Date();
  var myDate = new Date(2021, 0, 4);

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
