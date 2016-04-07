(function(win,doc,root) {
  var sessionRegex = /[?&#]chmln-editor-session=([^&#]*)/g,
    authOrigin = buildURL('auth', ''),
    loginUrl = fetchLoginUrl(),
    shouldLogin = fetchShouldLogin(),
    launcherWindow = null,
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

  chmln.isEditing = !!(chmln.Editor || loginUrl || shouldLogin || shouldPreview);
  var loggedIn = !!chmln.Editor;

  if(!chmln.isEditing) {
    '{{habitat}}';
  }

  chmlnStart();

  loginUrl && loginUser();

  if(loggedIn) {
    fetchEditorData();
  } else if(!shouldPreview) {
    logCurrentUrl();
  }

  function clearLoginTokens() {
    try { win.history.replaceState(null, null, win.location.href.replace(sessionRegex, '')); } catch(e) { }
  }

  function sayHello() {
    try { launcherWindow.postMessage('chmln:editor:login:completed', '*'); } catch(e) { } // authOrigin
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

  function fetchShouldLogin() {
    var loginKey = 'chmln:editor:login',
      shouldLogin, token, onMessage;

    try { shouldLogin = !!win.localStorage.getItem(loginKey); } catch(e) { }

    console.log('fetchShouldLogin:1', shouldLogin);

    if(shouldLogin) {
      win.addEventListener('message', onMessage = function(event) {
        console.log('fetchShouldLogin:2:shouldLogin', event.data, event);
        if(event.data === loginKey) {
          (launcherWindow = event.source).postMessage(loginKey, '*');
        } else {
          event.data.indexOf(loginKey) === 0 && (token = event.data.replace(loginKey, ''));
          win.removeEventListener('message', onMessage);
        }
        console.log('fetchShouldLogin:3:shouldLogin', token, launcherWindow);
      });
      setTimeout(function() {
        token && (loginUrl = buildURL('dashboard', 'tokens/'+token+'.min.js')) && loginUser();

        console.log('fetchShouldLogin:4:setTimeout', token, loginUrl);
      }, 250);
    }

    return shouldLogin;
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

  function loginUser() {
    !chmln.Editor && newScript(buildURL('fast', 'editor/index.min.js'), editorStart);

    newScript(loginUrl, function() {
      loggedIn = true;
      fetchEditorData();
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
