(function(doc,win,accountToken) {
  var chmln = 'chmln',
    names = 'setup alias track set show custom _data'.split(' '),
    src = 'http://localhost:3278/snippet/'+accountToken+'.min.js',
    localSrc = win.localStorage && win.localStorage.getItem(chmln+':snippet-url');

  win[chmln] || (win[chmln] = {});
  win[chmln].accountToken = accountToken;

  for(var i = 0; i<names.length; i++) {
    (function() {
      var calls = win[chmln][names[i]+'_a'] = [];
      win[chmln][names[i]] = function() {
        calls.push(arguments);
      };
    })();
  }

  var script = doc.createElement('script');
  script.src = localSrc || src;
  script.async = true;
  doc.head.appendChild(script);
})(document,window,'{{ACCOUNT_TOKEN}}');
