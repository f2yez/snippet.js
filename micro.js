(function(doc,win,accountToken) {
  var chmln = 'chmln',
    names = 'setup identify alias track set show on off custom help _data'.split(' '),
    src = '{{FAST_URL}}/messo/'+accountToken+'/messo.min.js',
    localSrc = win.localStorage && win.localStorage.getItem(chmln+':messo-url');

  win[chmln] || (win[chmln] = {});
  win[chmln].accountToken = accountToken;
  win[chmln].location = window.location.toString();

  for(var i = 0; i<names.length; i++) {
    (function() {
      var calls = win[chmln][names[i]+'_a'] = [];
      win[chmln][names[i]] = function() {
        calls.push(arguments);
      };
    })();
  }

  // TODO we need a way to trigger a refresh of ALL account's messo.min.js file when the code structure of messo.min.js changes

  var script = doc.createElement('script');
  script.src = localSrc || src;
  script.async = true;
  doc.head.appendChild(script);
})(document,window,'{{ACCOUNT_TOKEN}}');
