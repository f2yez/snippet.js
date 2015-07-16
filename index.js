(function(doc,win,token) {
  var chmln = 'chmln', editor = 'editor',
    object = win[chmln] = { token: token },
    chmlnURL = indexUrl(chmln),
    editorToken = fetchCookie('token'),
    editing = !!editorToken,
    editorURL = indexUrl(editor),
    dataURL = indexUrl('accounts', token),
    loginToken = fetchParameter('login'),
    login = !!loginToken;

  var names = 'setup alias track set _data'.split(' ');

  for(var i = 0; i<names.length; i++) {
    (function() {
      var calls = object[names[i]+'_a'] = [];
      object[names[i]] = function() {
        calls.push(arguments);
      };
    })();
  }

  newScript(chmlnURL, !editing && !login);

  if(login) {
    newScript(editURL('logins', loginToken));
  }

  editorToken = fetchCookie('token');
  editing = !!editorToken;

  if(editing) {
    newScript(editorURL);
    newScript(editURL('tokens', editorToken));
  } else {
    newScript(dataURL, true);
  }

  function newScript(src, async) {
    var script = doc.createElement('script');
    script.src = src;
    script.async = !!async;
    doc.head.appendChild(script);
  }

  function localFetch(name, id) {
    var value = (win.localStorage && win.localStorage.getItem(chmln+':'+name+'-url'));
    value = (value && id) ? value.replace(':id', id) : value;

    return value;
  }

  function indexUrl(name, token) {
    var id = token ? token+'/' : '';

    return localFetch(name, token) ||
      'https://fast.trychameleon.com/'+name+'/'+id+'index.min.js';
  }

  function editURL(name, token) {
    return localFetch(name, token) ||
      'https://edit.trychameleon.com/'+name+'/'+token+'.min.js';
  }

  function fetchCookie(name) {
    var re = new RegExp('chmln-editor-'+name+'=([^;]+)');
    var value = re.exec(doc.cookie);
    return value ? decodeURIComponent(value[1]) : null;
  }

  function fetchParameter(name) {
    var href = win.location.toString();
    var reg = new RegExp('[?&#]chmln-editor-' + name + '=([^&#]*)', 'i');
    var string = reg.exec(href);
    return string ? string[1] : null;
  }
})(document,window,'{{ACCOUNT_ID}}');
