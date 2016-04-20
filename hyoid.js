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

  '{{territory}}';

  chmln.isEditing = !!chmln.Editor || shouldPreview;

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

  var delay;
  function logCurrentUrl() {
    var options = { host: win.location.hostname },
      accountId, model;

    try {
      accountId = chmln.data.account.id;
      model = chmln.data.urls.findWhere(options);
    } catch(e) { }

    if(delay || !options.host || !accountId || chmln.adminPreview) { return; }

    model || (model = new chmln.models.Url(options));

    var delayFN = function(positiveOnly) { var options = chmln.lib.Feature.all(model);
      chmln._(options).each(function(value, k) {
        positiveOnly && !value && (delete options[k]);
      });

      model.set(options);
      model.save();
    };

    model.id || delayFN(true); (delay = win.setTimeout(delayFN, 7000));
  }
})(window,document,window.chmln);
