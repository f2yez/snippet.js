(function(win,doc,root) {
  var elusiveToUsers = /user/.test(root.elusive),
    elusiveToAdmins = /admin/.test(root.elusive),
    launcher;

  root.location || (root.location = win.location.href.toString());

  if(root.root || elusiveToUsers) {
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

  clearUrlTokens();
  captureParentWindow();

  '{{territory}}';

  if(chmln.decorators.Urls.isHidden()) {
    return (chmln.isDisabled = true);
  }

  if(!elusiveToAdmins) {
  '{{editor}}';
  }

  if(!(chmln.isEditing = !!chmln.Editor)) {
  '{{habitat}}';
  chmln.start();
  }

  if(chmln.isEditing) {
    fetchEditorData();
    launcherNotify('loading');
  }

  function launcherNotify(name) {
    try { launcher.postMessage('chmln:editor:'+name, '*'); } catch(e) { }
  }

  function buildURL(sub, name) {
    return 'https://'+sub+'.trychameleon.com/'+name;
  }

  function clearUrlTokens() {
    var url = win.location.href,
      modified;

    try { (modified = url.replace(chmln.lib.DeepLinked.regex, '')) && url !== modified && (modified = modified.replace(/\?$/, '').replace(/(&|\?)#/, '#')) && win.history.replaceState(null, null, modified); } catch(e) { }
  }

  function captureParentWindow() { var onMessage;
    win.addEventListener('message', onMessage = function(event) {
      /:\/\/dashboard\.trychameleon/.test(event.origin) && (launcher = event.source);
    });
    setTimeout(function() { win.removeEventListener('message', onMessage) }, 750);
  }

  function fetchPreviewModel() {
    var Preview = chmln.Editor.lib.Preview,
      model = chmln.lib.Cache.get(Preview.key);

    try { model || (model = win.opener.chmln.Editor.lib.Preview.model); } catch(e) { }
    try { model || (model = chmln.lib.DeepLinked.model()); chmln.lib.DeepLinked.clear(); } catch(e) { }

    model && chmln.lib.Cache.set(Preview.key, model);

    return model;
  }

  function fetchEditorData() {
    var xhr = chmln.$.ajax(buildURL('edit', root.accountToken+'/ecosystem.json'), {
      type: 'GET', crossDomain: true,
      xhrFields: { withCredentials: true }
    });

    xhr.done(function(data) {
      chmln._data(data);

      editorStart();
    });
  }

  function editorStart() {
    var status = 'started',
      previewModel = fetchPreviewModel(),
      accountId = chmln.lib.get(chmln.data, 'account.id');

    chmln.isPreviewing = !!previewModel;

    if(!previewModel && !accountId) {
      delete chmln.Editor;
      chmln.isEditing = false;

      status = 'not_authorized:'+root.accountToken;
    }

    chmln.start();

    if(previewModel) {
      chmln.Editor.lib.Preview.show(previewModel);
    } else if(accountId) {
      chmln.Editor.start();
    }

    launcherNotify(status);
  }
})(window,document,window.chmln);
