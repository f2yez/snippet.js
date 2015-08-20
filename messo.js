(function(doc,win,root,habitatToken) {
  var chmlnURL = buildURL('chmln/index'),
    editorURL = buildURL('editor/index'),
    ecosystemURL = buildURL(root.accountToken+'/ecosystem'),
    habitatURL = buildURL(root.accountToken+'/'+habitatToken+'/habitat'),
    sessionRegex = /[?&#]chmln-editor-session=([^&#]*)/g,
    sessionToken = fetchSessionToken(),
    shouldEdit = !!fetchCookie('id'),
    session = !!sessionToken,
    chmlnLoaded = false,
    chmlnDataLoaded = false,
    url = win.location.toString().replace(sessionRegex, '');

  win.history && win.history.replaceState && win.history.replaceState(null, null, url);

  newScript(chmlnURL, !shouldEdit && !session, function() {
    chmlnLoaded = true;

    var i, keys = Object.keys(root);
    for(i=0; i<keys.length;i++) {
      if(root.hasOwnProperty(keys[i])) {
        win.chmln[keys[i]] = root[keys[i]];
      }
    }

    tryChmlnStart();
  });

  if(session) {
    shouldEdit = true;
    newScript('{{LOGIN_URL}}/login/'+sessionToken+'.min.js');
  }

  if(shouldEdit) {
    newScript(editorURL);
    newScript(ecosystemURL, function() {
      win.chmln.Editor.start();
    });
  } else {
    newScript(habitatURL, true, function() {
      chmlnDataLoaded = true;
      tryChmlnStart();
    });
  }

  function newScript(src, async, onload) {
    if(typeof async === 'function') {
      onload = async;
      async = false;
    }

    var script = doc.createElement('script');
    script.src = src;

    async  && (script.async = true);
    onload && (script.onload = onload);

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
    var string = sessionRegex.exec(win.location.toString());
    return string ? string[1] : null;
  }

  function tryChmlnStart() {
    if(chmlnLoaded && chmlnDataLoaded) {
      win.chmln.start();
    }
  }
})(document,window,window.chmln,'{{HABITAT_TOKEN}}');
