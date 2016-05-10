(function(win,doc,root) {
  if(root.root) {
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

  var previewKey = 'e:lPs:id',
    dataLoaded;

  '{{editor}}';

  if(!(chmln.isEditing = !!chmln.Editor)) {
    '{{habitat}}';
  }

  '{{territory}}';

  chmlnStart();
  logCurrentUrl();

  if(chmln.Editor) {
    fetchEditorData();
    launcherNotify('loading');
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

  function clearUrlTokens() {
    var url = win.location.href,
      modified = url.replace(/chmln-linked=[a-z]+:.{16}/, '');

    try { url !== modified && (modified = modified.replace(/\?$/, '').replace(/(&|\?)#/, '#')) && win.history.replaceState(null, null, modified); } catch(e) { }
  }

  var launcher;
  function captureParentWindow() { var onMessage;
    win.addEventListener('message', onMessage = function(event) {
      /:\/\/dashboard\.trychameleon/.test(event.origin) && (launcher = event.source);
    });
    setTimeout(function() { win.removeEventListener('message', onMessage) }, 750);
  }

  function fetchPreviewModel() {
    var sessionModel = chmln.lib.session.get(previewKey);

    if(sessionModel) {
      try { return chmln.lib.Marshal.load(sessionModel); } catch(e) { }
    }

    try { return win.opener.chmln.Editor.lib.Preview.model; } catch(e) { }
    try { return chmln.lib.DeepLinked.model(); } catch(e) { }
  }

  function fetchEditorData() {
    var xhr = chmln.$.ajax(buildURL('edit', root.accountToken+'/ecosystem.json'), {
      type: 'GET', crossDomain: true,
      xhrFields: { withCredentials: true }
    });

    xhr.done(function(data) { chmln._data(data); });
    xhr.always(function() {
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
  }

  function previewStart(model) {
    chmln.lib.session.set(previewKey, chmln.lib.Marshal.dump(model));
    chmln.Editor.lib.Preview.show(model);
    chmln.Editor.lib.Preview.start();
  }

  function editorStart() {
    if(editorStarted) return;
    if(dataLoaded) {
      var status = 'started',
        previewModel = fetchPreviewModel();

      chmln.isPreviewing = !!previewModel;

      if(previewModel) {
        previewStart(previewModel);
      } else if(chmln.data && chmln.data.account) {
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
    var options = { host: win.location.hostname },
      accountId, model;

    try {
      accountId = chmln.data.account.id;
      model = chmln.data.urls.findWhere(options);
    } catch(e) { }

    if(!options.host || !accountId || chmln.adminPreview) { return; }

    model || (model = new chmln.models.Url(options));

    var checkFeatures = function() {
      model.set(chmln.lib.Feature.all(model));
      model.save();
    };
    chmln._([0,1,9]).each(function(i) { win.setTimeout(checkFeatures, i*2000) });
  }
})(window,document,window.chmln);
