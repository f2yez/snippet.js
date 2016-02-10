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

  var loggedIn = chmln.isEditing = !!chmln.Editor;

  if(!loggedIn) {
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

  loggedIn && fetchEditorData();

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
    newScript(buildURL('edit', root.accountToken+'/ecosystem.min.js'), function() {
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
      (chmln.data && chmln.data.account) && win.chmln.Editor.start();

      editorStarted = true;
    }
  }
})(window,document,window.chmln);
