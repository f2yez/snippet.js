(function(win,doc,root) {
  if(win.chmln.root) {
    return;
  }

  '{{chmln}}';
  var i, keys = Object.keys(root),
    chmln = win.chmln;

  for(i=0; i<keys.length; ++i) {
    if(root.hasOwnProperty(keys[i]) && !chmln[keys[i]]) {
      chmln[keys[i]] = root[keys[i]];
    }
  }

  captureParentWindow();

  var Preview = fetchPreview(),
    shouldPreview = chmln.isPreviewing = !!(Preview && Preview.window),
    dataLoaded;

  if(!shouldPreview) {
    '{{editor}}';

    if(!chmln.Editor) {
      '{{habitat}}';
    }
  }

  chmlnStart();

  if(chmln.Editor) {
    fetchEditorData();
    launcherNotify('loading');
  } else {
    logCurrentUrl();
  }

  function launcherNotify(name) {
    try { launcher.postMessage('chmln:editor:'+name, '*'); } catch(e) { }
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

  var launcher;
  function captureParentWindow() { var onMessage;
    win.addEventListener('message', onMessage = function(event) {
      /:\/\/dashboard\.trychameleon/.test(event.origin) && (launcher = event.source);
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
      dataLoaded = true;
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
    if(dataLoaded) {
      var status = 'started';

      if(chmln.data && chmln.data.account) {
        chmln.Editor.start();

        logCurrentUrl();
      } else {
        status = 'not_authorized:'+root.accountToken;
        // win.chmln.isEditing = false;
        // chmln.data.profile.set('admin', false);
        ////
        // TODO Note you should not be editing when you do not have permission for the account `chmln.data.account`
        // TODO win.chmln.editor404();
        //
      }

      launcherNotify(status);

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
