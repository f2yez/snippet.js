(function(doc,win,token) {
  var object = win.chmln = { token: token},
    editing = !!(win.localStorage && win.localStorage.getItem('chmln:editor-token')),
    script = doc.createElement('script');

  script.async = !editing;
  script.src = 'https://cdn.trychameleon.com/east/'+object.token+'.min.js';
  doc.head.appendChild(script);

  if(editing) {
    var editor = doc.createElement('script');
    editor.async = false;
    editor.src = 'https://cdn.trychameleon.com/editor/index.min.js';
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
})(document,window,'{{ACCOUNT_ID}}');
