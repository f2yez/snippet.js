(function(win,doc,root) {
  var elusiveToUsers = /user/.test(root.elusive),
    elusiveToAdmins = /admin/.test(root.elusive),
    launcher;

  if(root.root || elusiveToUsers) {
    return;
  }

  root.location || (root.location = win.location.href.toString());
  '{{chmln}}';
  var chmln = win.chmln;

  clearUrlTokens();
  captureParentWindow();

  '{{territory}}';

  if(chmln.decorators.Urls.isHidden()) {
    return (chmln.isDisabled = true);
  }

  if(!elusiveToAdmins) {
  '{{editor}}';
  }

  var habitatData = function() { '{{habitat}}'; };

  if(!(chmln.isEditing = !!chmln.Editor)) {
  habitatData();
  showLinkedModel();
  copyFromRoot();
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

  function showLinkedModel() {
    var model = fetchLinkedModel();

    model && chmln.show(model);
  }

  function fetchLinkedModel() {
    var model = chmln.lib.DeepLinked.model();

    chmln.lib.DeepLinked.clear();

    return model;
  }

  function fetchPreviewModel() {
    var Preview = chmln.Editor.lib.Preview,
      session = new chmln.lib.Cache({ store: chmln.lib.Session }),
      model = session.get(Preview.key);

    try { model || (model = win.opener.chmln.Editor.lib.Preview.model); } catch(e) { }
    try { model || (model = fetchLinkedModel()); } catch(e) { }

    model && session.set(Preview.key, model);
    model && (model = session.get(Preview.key));

    return model;
  }

  function copyFromRoot() {
    var i, keys = Object.keys(root);

    for(i=0; i<keys.length; ++i) {
      if(root.hasOwnProperty(keys[i]) && !chmln[keys[i]]) {
        chmln[keys[i]] = root[keys[i]];
      }
    }
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
    copyFromRoot();

    var status = 'started',
      previewModel = fetchPreviewModel(),
      accountId = chmln.lib.get(chmln.data, 'account.id');

    chmln.isPreviewing = !!previewModel;

    if(!previewModel && !accountId) {
      delete chmln.Editor;
      chmln.isEditing = false;

      status = 'not_authorized:'+root.accountToken;

      habitatData();
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
