(function(doc,win,token) { var object = win.chmln = { token: token };
  var script = doc.createElement('script');
  script.async = true;
  script.src = 'https://cdn.trychameleon.com/east/'+object.token+'.min.js';
  doc.head.appendChild(script);
  var names = 'setup alias track set'.split(' ');
  for(var i = 0; i<names.length; i++) {
    (function(){
      var calls = object[names[i]+'_a'] = [];
      object[names[i]] = function(){
        calls.push(arguments);
      };
    })();
  }
})(document,window,'{{ACCOUNT_ID}}');
