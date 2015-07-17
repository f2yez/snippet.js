(function(doc,win,accountId) {
  var chmln = 'chmln', editor = 'editor', token = 'token',
    object = win[chmln] = { token: accountId = (localGet(editor+'-account-id') || accountId)},
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
    editorToken = fetchCookie(token),
    editing = !!editorToken,
    editorURL = indexUrl(editor),
    dataURL = indexUrl('accounts', accountId),
    sessionRegex = /[?&#]chmln-editor-session=([^&#]*)/g,
    sessionToken = fetchSessionToken(),
    session = !!sessionToken;

  var url = win.location.toString().replace(sessionRegex, '');
  win.history && win.history.replaceState && win.history.replaceState(null, null, url);

  newScript(chmlnURL, !editing && !session);

  if(session) {
    newScript(editURL('prehensile', 'sessions', sessionToken));
  }

  editorToken = fetchCookie(token);
  editing = !!editorToken;

  if(editing) {
    newScript(editorURL);
    newScript(editURL('edit', token+'s', editorToken));
  } else {
    newScript(dataURL, true);
  }

  function newScript(src, async) {
    var script = doc.createElement('script');
    script.src = src;
    script.async = !!async;
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
    return localFetch(name, token) ||
      'https://'+sub+'.trychameleon.com/'+name+'/'+token+'.min.js';
  }

  function fetchCookie(name) {
    var re = new RegExp('chmln-editor-'+name+'=([^;]+)');
    var value = re.exec(doc.cookie);
    return value ? decodeURIComponent(value[1]) : null;
  }

  function fetchSessionToken() {
    var href = win.location.toString();
    var string = sessionRegex.exec(href);
    return string ? string[1] : null;
  }
})(document,window,'{{ACCOUNT_ID}}');
