(function(doc,win,accountId) {
  var chmln = 'chmln', editor = 'editor',
    object = win[chmln] = { token: accountId = (localGet(editor+'-account-id') || accountId) },
    names = 'setup alias track set _data'.split(' ');

  for(var i = 0; i<names.length; i++) {
    (function() {
      var calls = object[names[i]+'_a'] = [];
      object[names[i]] = function() {
        calls.push(arguments);
      };
    })();
  }

  var chmlnURL = indexUrl(chmln),
    shouldEdit = !!fetchCookie('id'),
    editorURL = indexUrl(editor),
    dataURL = indexUrl('accounts', accountId),
    sessionRegex = /[?&#]chmln-editor-session=([^&#]*)/g,
    sessionToken = fetchSessionToken(),
    session = !!sessionToken,
    chmlnLoaded = false,
    chmlnDataLoaded = false;

  var url = win.location.toString().replace(sessionRegex, '');
  win.history && win.history.replaceState && win.history.replaceState(null, null, url);

  newScript(chmlnURL, !shouldEdit && !session, function() {
    chmlnLoaded = true;
    tryChmlnStart();
  });

  if(session) {
    shouldEdit = true;
    newScript(editURL('prehensile', 'login', sessionToken));
  }

  if(shouldEdit) {
    newScript(editorURL);
    newScript(editURL('edit', 'ecosystem'), function() {
      win.chmln.Editor.start();
    });
  } else {
    newScript(dataURL, true, function() {
      chmlnDataLoaded = true;
      tryChmlnStart();
    });
  }

  function newScript(src, async, onload) {
    if(typeof async === 'function') {
      onload = async;
      async = false;
    }

    var script = doc.createElement('script');
    script.src = src;
    script.async = !!async;
    onload && (script.onload = onload);
    doc.head.appendChild(script);
  }

  function localGet(name) {
    return win.localStorage && win.localStorage.getItem(chmln+':'+name);
  }

  function localFetch(name, id) {
    var value = localGet(name+'-url');
    value = (value && id) ? value.replace(':id', id) : value;

    return value;
  }

  function indexUrl(name, token) {
    var id = token ? token+'/' : '';

    return localFetch(name, token) ||
      'https://fast.trychameleon.com/'+name+'/'+id+'index.min.js';
  }

  function editURL(sub, name, token) {
    var id = token ? '/'+token : '';

    return localFetch(name, token) ||
      'https://'+sub+'.trychameleon.com/'+name+id+'.min.js';
  }

  function fetchCookie(name) {
    var editorRegex = new RegExp('chmln-user-'+name+'=([^;]+)');
    var value = editorRegex.exec(doc.cookie);
    return value ? decodeURIComponent(value[1]) : null;
  }

  function fetchSessionToken() {
    var string = sessionRegex.exec(win.location.toString());
    return string ? string[1] : null;
  }

  function tryChmlnStart() {
    if(chmlnLoaded && chmlnDataLoaded) {
      win.chmln.start();
    }
  }
})(document,window,'{{ACCOUNT_ID}}');
