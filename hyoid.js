(function(win,doc,root) {
  var sessionRegex = /[?&#]chmln-editor-session=([^&#]*)/g,
    tokenRegex = /[?&#]chmln-editor-token=([^&#]*)/g,
    loginUrl = fetchLoginUrl(),
    launcherWindow = null,
    Preview = fetchPreview(),
    shouldPreview = win.chmln.isPreviewing = !!(Preview && Preview.window),
    editorDataLoaded = false;

  if(win.chmln.root) {
    return;
  }

  clearLoginTokens();
  captureParentWindow();

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

  if(loginUrl) {
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
    try { var href = win.location.href.replace(sessionRegex, '').replace(tokenRegex, '');
      win.history.replaceState(null, null, href);
    } catch(e) { }
  }

  function sayHello() {
    loginUrl && clearLoginTokens();

    try { launcherWindow.postMessage('chmln:editor:started', '*'); } catch(e) { } // authOrigin
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
      specs = [['tokens', tokenRegex], ['login', sessionRegex]], url = null;

    for(var i=0; i<specs.length; ++i) {
      try { url = url || buildURL('dashboard', specs[i][0]+'/'+specs[i][1].exec(location)[1]+'.min.js') } catch(e) { }
    }

    return url;
  }

  function captureParentWindow() { var onMessage;
    if(!loginUrl) return;

    win.addEventListener('message', onMessage = function(event) { console.log('onMessage:1', event);
      /:\/\/dashboard\.trychameleon/.test(event.origin) && (launcherWindow = event.source);
    });
    setTimeout(function() { win.removeEventListener('message', onMessage) }, 500);
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
