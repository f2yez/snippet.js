(function(win,doc,root) {
  var sessionRegex = /[?&#]chmln-editor-session=([^&#]*)/g,
    loginToken = fetchLoginToken(),
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

  chmln.isEditing = !!(chmln.Editor || loginToken || shouldPreview);
  var loggedIn = !!chmln.Editor;

  if(!chmln.isEditing) {
    '{{habitat}}';
  }

  chmlnStart();

  if(loginToken) {
    !chmln.Editor && newScript(buildURL('fast', 'editor/index.min.js'), editorStart);

    newScript(buildURL('dashboard', 'login/'+loginToken+'.min.js'), function() {
      loggedIn = true;
      fetchEditorData();
    });
  }

  if(loggedIn) {
    fetchEditorData()
  } else if(!shouldPreview) {
    logCurrentUrl();
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

  function fetchLoginToken() {
    var location = (root.location || win.chmln.location || win.location.href).toString();

    try { return sessionRegex.exec(location)[1]; } catch(e) { }
  }

  function clearLoginTokens() {
    try { win.history.replaceState(null, null, win.location.href.replace(sessionRegex, '')); } catch(e) { }
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
