(function(doc,win,token) {
  var chmln = 'chmln',
    names = 'setup identify alias track set show on off custom help _data'.split(' ');

  win[chmln] || (win[chmln] = {});
  win[chmln].accountToken = token;
  win[chmln].location = win.location.href.toString();

  for(var i = 0; i<names.length; i++) {
    (function() {
      var calls = win[chmln][names[i]+'_a'] = [];
      win[chmln][names[i]] = function() {
        calls.push(arguments);
      };
    })();
  }

  var script = doc.createElement('script');
  script.src = '{{FAST_URL}}/messo/'+token+'/messo.min.js';
  script.async = true;
  doc.head.appendChild(script);
})(document,window,'{{ACCOUNT_TOKEN}}');
