(function(win,doc,root) {
  var sessionRegex = /[?&#]chmln-editor-session=([^&#]*)/g,
    authOrigin = buildURL('auth', ''),
    loginUrl = fetchLoginUrl(),
    Preview = fetchPreview(),
    shouldPreview = win.chmln.isPreviewing = !!(Preview && Preview.window),
    editorDataLoaded = false;

  if(win.chmln.root) {
    return;
  }

  clearLoginTokens();

  '{{chmln}}';
  var i, keys = Object.keys(root);
  for(i=0; i<keys.length; ++i) {
    if(root.hasOwnProperty(keys[i]) && !win.chmln[keys[i]]) {
      win.chmln[keys[i]] = root[keys[i]];
    }
  }

  if(!shouldPreview) {
    '{{editor}}';
  }

  chmln.isEditing = !!(chmln.Editor || loginUrl || shouldPreview);
  var loggedIn = !!chmln.Editor;

  if(!chmln.isEditing) {
    '{{habitat}}';
  }

  chmlnStart();

  if(loginUrl || (loginUrl = openerLoginUrl())) {
    !chmln.Editor && newScript(buildURL('fast', 'editor/index.min.js'), editorStart);

    newScript(loginUrl, function() {
      loggedIn = true;
      fetchEditorData();
    });
  }

  if(loggedIn) {
    fetchEditorData();
  } else if(!shouldPreview) {
    logCurrentUrl();
  }

  function clearLoginTokens() {
    try { win.history.replaceState(null, null, win.location.href.replace(sessionRegex, '')); } catch(e) { }
  }

  function sayHello() {
    try { win.opener.postMessage('chmln:editor:started', '*'); } catch(e) { } // authOrigin
  }

  function newScript(src, onload) {
    var script = doc.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = onload || function() {};

    doc.head.appendChild(script);
  }

  function buildURL(sub, name) {
    return 'https://'+sub+'.trychameleon.com/'+name;
  }

  function fetchLoginUrl() {
    var location = (root.location || win.chmln.location || win.location.href).toString(),
      token = null;

    try { token = sessionRegex.exec(location)[1]; } catch(e) { }

    return token && buildURL('dashboard', 'login/'+token+'.min.js');
  }

  function openerLoginUrl() {
    var token = null, onMessage,
      tokenRegex = /chmln:editor:token:/;

    try {
      win.addEventListener('message', onMessage = function(event) {
        tokenRegex.test(event.data) && (token = event.data.replace(tokenRegex, ''));
      });
      win.opener.postMessage('chmln:editor:login', '*'); // authOrigin
      win.removeEventListener('message', onMessage);
    } catch(e) { }

    return token && buildURL('dashboard', 'tokens/'+token+'.min.js');
  }

  function fetchPreview() {
    try { return win.opener.chmln.Editor.lib.Preview; } catch(e) { }
  }

  function fetchEditorData() {
    var url = root.accountToken+'/ecosystem.min.js';

    if(chmln.auth) {
      url += '?chmln-user-id='+chmln.auth.user.id;
      url += '&chmln-user-token='+chmln.auth.user.token;
      url += '&chmln-account-id='+chmln.auth.account.id;
    }

    newScript(buildURL('edit', url), function() {
      editorDataLoaded = true;
      editorStart();
    });
  }

  var chmlnStarted = false,
    editorStarted = false;

  function chmlnStart() {
    if(chmlnStarted) return;
    chmlnStarted = true;

    win.chmln.start();

    shouldPreview && (chmln.Preview = Preview).start();
  }

  function editorStart() {
    if(editorStarted) return;
    if(editorDataLoaded && loggedIn) {
      if(chmln.data && chmln.data.account) {
        win.chmln.Editor.start();
        sayHello();
      } else {
        // win.chmln.isEditing = false;
        ////
        // TODO Note you should not be editing when you do not have permission for the account `chmln.data.account`
        // TODO win.chmln.editor404();
        //
      }

      editorStarted = true;
    }
  }

  function logCurrentUrl() {
    var hosts, accountId;

    try {
      hosts = chmln.data.account.get('hosts') || [];
      accountId = chmln.data.account.id;
    } catch(e) { }

    if(accountId && !chmln.adminPreview && hosts.indexOf(win.location.hostname) === -1) {
      newScript(buildURL('wave', 'accounts/'+accountId+'/urls/index.min.js?href='+encodeURIComponent(win.location.href)))
    }
  }
})(window,document,window.chmln);
