/*

  var Chatstack = { server: 'www.safetysignsandnotices.co.uk' };
  (function(d, undefined) {
    // JavaScript
    Chatstack.e = []; Chatstack.ready = function (c) { Chatstack.e.push(c); }
    var b = d.createElement('script'); b.type = 'text/javascript'; b.async = true;
    b.src = ('https:' == d.location.protocol ? 'https://' : 'https://') + Chatstack.server + '/livehelp/scripts/jquery.livehelp.min.js';
    var s = d.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(b, s);
  })(document);

  Chatstack.colors = {tab: {normal: '#999999', hover: '#c9cacc'}};
  Chatstack.theme = 'dark';
*/


  var Chatstack = { server: 'www.safetysignsandnotices.co.uk' };
  (function(d, undefined) {
  // JavaScript
  Chatstack.e = []; Chatstack.ready = function (c) { Chatstack.e.push(c); }
  var b = d.createElement('script'); b.type = 'text/javascript'; b.async = true;
  b.src = ('https:' == d.location.protocol ? 'https://' : 'http://') + Chatstack.server + '/livehelp/scripts/js.min.js';
  var s = d.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(b, s);
})(document);
