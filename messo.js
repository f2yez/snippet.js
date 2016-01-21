(function(doc,win,root,habitatToken) {
  var chmlnURL = buildURL('chmln/index'),
    editorURL = buildURL('editor/index'),
    ecosystemURL = buildURL(root.accountToken+'/ecosystem'),
    habitatURL = buildURL(root.accountToken+'/'+habitatToken+'/habitat'),
    sessionRegex = /[?&#]chmln-editor-session=([^&#]*)/g,
    loc = (root.location || win.chmln.location || win.location.href).toString(),
    sessionToken = fetchSessionToken(),
    adminCookie = !!fetchCookie('admin'),
    opener = window.opener,
    Preview = fetchPreview(),
    shouldPreview = win.chmln.isPreviewing = !!(Preview && Preview.window),
    shouldEdit = (win.chmln.isEditing = adminCookie) && !shouldPreview,
    session = !!sessionToken,
    chmlnLoaded = false,
    chmlnDataLoaded = false,
    editorLoaded = false,
    editorDataLoaded = false,
    url = loc.replace(sessionRegex, '');

  win.history && win.history.replaceState && win.history.replaceState(null, null, url);

  function loadChmlnAndEdit() {
    newScript(chmlnURL, function() {
      chmlnLoaded = true;

      var i, keys = Object.keys(root);
      for(i=0; i<keys.length;i++) {
        if(root.hasOwnProperty(keys[i]) && !win.chmln[keys[i]]) {
          win.chmln[keys[i]] = root[keys[i]];
        }
      }

      if(shouldEdit) {
        newScript(editorURL, function() {
          editorLoaded = true;
          tryEditorStart();
        });
      }

      tryChmlnStart();
    });

    if(shouldEdit) {
      newScript(ecosystemURL, function() {
        editorDataLoaded = true;
        tryEditorStart();
      });
    }
  }

  if(session) {
    shouldEdit = true;
    newScript('{{LOGIN_URL}}/login/'+sessionToken+'.min.js', function() {
      loadChmlnAndEdit();
    });
  } else if(shouldEdit) {
    loadChmlnAndEdit();
  } else {
    loadChmlnAndEdit();
    shouldPreview || newScript(habitatURL, function() {
      chmlnDataLoaded = true;
      tryChmlnStart();
    });
  }

  function newScript(src, onload) {
    var script = doc.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = onload;

    doc.head.appendChild(script);
  }

  function buildURL(name) {
    return '{{FAST_URL}}/'+name+'.min.js';
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

  function tryChmlnStart() {
    chmlnLoaded && win.chmln.start();
    shouldPreview && (chmln.Preview = Preview).start();
  }

  function tryEditorStart() {
    if(chmlnLoaded && editorLoaded && editorDataLoaded) {
      win.chmln.Editor.start();
    }
  }
})(document,window,window.chmln,'{{HABITAT_TOKEN}}');
