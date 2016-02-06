(function(win,doc,root) {
  var ecosystemURL = buildURL('edit', root.accountToken+'/ecosystem.min.js'),
    sessionRegex = /[?&#]chmln-editor-session=([^&#]*)/g,
    loc = (root.location || win.chmln.location || win.location.href).toString(),
    sessionToken = fetchSessionToken(),
    adminCookie = !!fetchCookie('admin'),
    opener = window.opener,
    Preview = fetchPreview(),
    shouldPreview = win.chmln.isPreviewing = !!(Preview && Preview.window),
    shouldEdit = (win.chmln.isEditing = adminCookie) && !shouldPreview,
    session = !!sessionToken,
    editorLoggedIn = true,
    editorDataLoaded = false,
    url = win.location.href.replace(sessionRegex, '');

  win.history.replaceState && win.history.replaceState(null, null, url);

  if(session) {
    editorLoggedIn = false;
  }

  if(!shouldPreview) {
    '{{habitat}}';
  }

  '{{chmln}}';
  var i, keys = Object.keys(root);
  for(i=0; i<keys.length; ++i) {
    if(root.hasOwnProperty(keys[i]) && !win.chmln[keys[i]]) {
      win.chmln[keys[i]] = root[keys[i]];
    }
  }

  chmlnStart();
  '{{editor}}';

  if(shouldEdit) {
    newScript(ecosystemURL, function() {
      editorDataLoaded = true;
      editorStart();
    });
  }

  if(session) {
    newScript(buildURL('dashboard', 'login/'+sessionToken+'.min.js'), function() {
      editorLoggedIn = true;
      editorStart();
    });

    newScript(buildURL('fast', 'editor/index.min.js'), function() {
      editorStart();
    });
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

  function fetchCookie(name) {
    var editorRegex = new RegExp('chmln-user-'+name+'=([^;]+)');
    var value = editorRegex.exec(doc.cookie);
    return value ? decodeURIComponent(value[1]) : null;
  }

  function fetchSessionToken() {
    var string = sessionRegex.exec(loc);
    return string ? string[1] : null;
  }

  function fetchPreview() {
    var preview;
    try {
      preview = adminCookie && opener && opener.chmln && opener.chmln.Editor.lib.Preview
    } catch(e) { }

    return preview;
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

    if(editorDataLoaded && editorLoggedIn) {
      win.chmln.Editor.start();
      editorStarted = true;
    }
  }
})(window,document,window.chmln);
