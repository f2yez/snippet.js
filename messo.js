(function(doc,win,object,habitatToken) {
  var chmlnURL = indexUrl('chmln'),
    shouldEdit = !!fetchCookie('id'),
    editorURL = indexUrl('editor'),
    habitatPath = 'habitat/'+object.accountToken+'/'+habitatToken,
    dataURL = indexUrl(habitatPath, true),
    sessionRegex = /[?&#]chmln-editor-session=([^&#]*)/g,
    sessionToken = fetchSessionToken(),
    session = !!sessionToken,
    chmlnLoaded = false,
    chmlnDataLoaded = false;

  var url = win.location.toString().replace(sessionRegex, '');
  win.history && win.history.replaceState && win.history.replaceState(null, null, url);

  newScript(chmlnURL, !shouldEdit && !session, function() {
    chmlnLoaded = true;
    tryChmlnStart();
  });

  if(session) {
    shouldEdit = true;
    newScript(editURL('prehensile', 'login/'+sessionToken));
  }

  if(shouldEdit) {
    newScript(editorURL);
    newScript(editURL('edit', 'ecosystem'), function() {
      object.Editor.start();
    });
  } else {
    newScript(dataURL, true, function() {
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

  function indexUrl(name, skipIndex) {
    var index = skipIndex ? '' : '/index';

    return '{{PROTOCOL}}://{{FAST_URL}}/'+name+index+'.min.js';
  }

  function editURL(sub, name) {
    return '{{PROTOCOL}}://'+sub+'.trychameleon.{{TLD}}/'+name+'.min.js';
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
      object.start();
    }
  }
})(document,window,chmln,'{{HABITAT_TOKEN}}');
