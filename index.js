(function(doc,win,token) {
  var object = win.chmln = { token: token },
    editing = !!localFetch('token', null),
    baseUrl = 'https://cdn.trychameleon.com',
    script = doc.createElement('script');

  script.async = !editing;
  script.src = baseUrl+'/east/'+object.token+'.min.js';
  doc.head.appendChild(script);

  if(editing) {
    var editor = doc.createElement('script');
    editor.async = false;
    editor.src = localFetch('url', baseUrl+'/editor/index.min.js');
    doc.head.appendChild(editor);
  }

  var names = 'setup alias track set'.split(' ');

  for(var i = 0; i<names.length; i++) {
    (function() {
      var calls = object[names[i]+'_a'] = [];
      object[names[i]] = function() {
        calls.push(arguments);
      };
    })();
  }

  function localFetch(name, orReturn) {
    return (win.localStorage && win.localStorage.getItem('chmln:editor-'+name)) || orReturn;
  }
})(document,window,'{{ACCOUNT_ID}}');