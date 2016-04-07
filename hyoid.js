(function(win,doc,root) {
  var sessionRegex = /[?&#]chmln-editor-session=([^&#]*)/g,
    loggedIn, shouldPreview, editorDataLoaded, launcherWindow,
    Preview = fetchPreview();

  if(win.chmln.root) {
    return;
  }

  clearLoginTokens();
  captureParentWindow();

  '{{chmln}}';
  var i, keys = Object.keys(root),
    chmln = win.chmln;

  for(i=0; i<keys.length; ++i) {
    if(root.hasOwnProperty(keys[i]) && !chmln[keys[i]]) {
      chmln[keys[i]] = root[keys[i]];
    }
  }

  if(!(shouldPreview = chmln.isPreviewing = !!(Preview && Preview.window))) {
    '{{editor}}';
  }

  if(!(chmln.isEditing = (loggedIn = !!chmln.Editor) || shouldPreview)) {
    '{{habitat}}';
  }

  chmlnStart();

  if(loggedIn) {
    fetchEditorData();
  } else if(!shouldPreview) {
    logCurrentUrl();
  }

  function clearLoginTokens() {
    try { var href = win.location.href.replace(sessionRegex, '');
      win.history.replaceState(null, null, href);
    } catch(e) { }
  }

  function sayHello() {
    clearLoginTokens();

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

  function captureParentWindow() { var onMessage;
    win.addEventListener('message', onMessage = function(event) {
      /:\/\/dashboard\.trychameleon/.test(event.origin) && (launcherWindow = event.source);
    });
    setTimeout(function() { win.removeEventListener('message', onMessage) }, 750);
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

    chmln.start();

    shouldPreview && (chmln.Preview = Preview).start();
  }

  function editorStart() {
    if(editorStarted) return;
    if(editorDataLoaded && loggedIn) {
      if(chmln.data && chmln.data.account) {
        chmln.Editor.start();

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
