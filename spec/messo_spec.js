require('./helpers/spec_helper.js');

describe('messo', function() {
  var elementTagNames, appendedChildren, replacedStates;
  var requireMesso = function() {
    delete require.cache[process.cwd()+'/messo.js'];

    require('../messo.js');
  };

  beforeEach(function() {
    elementTagNames = [];
    appendedChildren = [];
    replacedStates = [];

    window = {
      history: {
        replaceState: function() {
          replacedStates.push(Array.prototype.slice.call(arguments));
        }
      }
    };

    document = window.document = {
      cookie: '',
      createElement: function(name) {
        var tag = { __tagName: name };
        elementTagNames.push(tag);
        return tag;
      },
      head: {
        appendChild: function(child) {
          appendedChildren.push(child);
        }
      }
    };

    chmln = window.chmln = {
      accountToken: 'account-1124',
      location: 'https://yoursite.com',
      start: function() {},
      covered: 'you',
      foobar: function() {}
    };
  });

  describe('when including messo.js', function() {
    beforeEach(function() {
      requireMesso();
    });

    it('should add the scripts', function() {
      expect(elementTagNames.length).toBe(2);
    });

    it('should be script tags', function() {
      expect(elementTagNames[0].__tagName).toBe('script');
      expect(elementTagNames[1].__tagName).toBe('script');
    });

    it('should have the urls', function() {
      expect(elementTagNames[0].src).toBe('{{FAST_URL}}/chmln/index.min.js');
      expect(elementTagNames[1].src).toBe('{{FAST_URL}}/account-1124/{{HABITAT_TOKEN}}/habitat.min.js');
    });

    it('should be async', function() {
      expect(elementTagNames[0].async).toBe(true);
      expect(elementTagNames[1].async).toBe(true);
    });

    it('should append the scripts to the head', function() {
      expect(appendedChildren.length).toBe(2);
      expect(appendedChildren[0]).toBe(elementTagNames[0]);
      expect(appendedChildren[1]).toBe(elementTagNames[1]);
    });

    it('should not be editing', function() {
      expect(chmln.isEditing).toBe(false);
    });

    describe('when the chmln script has been downloaded', function() {
      beforeEach(function() {
        delete window.chmln.start;

        window.chmln = { Editor: { hi: 'a' }, other: 'foo', covered: 'me' };
        window.chmln.start = jasmine.createSpy('chmln.start');

        elementTagNames[0].onload.call(global);
      });

      it('should start the script', function() {
        expect(window.chmln.start).toHaveBeenCalled();
      });

      it('should combine the original chmln attributes', function() {
        expect(window.chmln.accountToken).toBe('account-1124');
        expect(typeof window.chmln.foobar).toBe('function');

        expect(window.chmln.Editor).toEqual({ hi: 'a' });
        expect(window.chmln.other).toBe('foo');
        expect(window.chmln.covered).toBe('me');
      });
    });
  });

  describe('when chmln has been started', function() {
    beforeEach(function() {
      chmln.root = 'already defined';
      requireMesso();
    });

    it('should add not scripts', function() {
      expect(elementTagNames.length).toBe(0);
    });
  });

  describe('when authenticated for editing', function() {
    beforeEach(function() {
      document.cookie = 'chmln-user-admin=foo;';

      requireMesso();
      elementTagNames[0].onload.call(global);
    });

    it('should add the scripts', function() {
      expect(elementTagNames.length).toBe(3);
    });

    it('should have the urls', function() {
      expect(elementTagNames[0].src).toMatch(/chmln\/index/);
      expect(elementTagNames[1].src).toBe('{{FAST_URL}}/account-1124/ecosystem.min.js');
      expect(elementTagNames[2].src).toBe('{{FAST_URL}}/editor/index.min.js');
    });

    it('should be script tags', function() {
      expect(elementTagNames[0].__tagName).toBe('script');
      expect(elementTagNames[1].__tagName).toBe('script');
      expect(elementTagNames[2].__tagName).toBe('script');
    });

    it('should be asynchronous', function() {
      expect(elementTagNames[0].async).toBe(true);
      expect(elementTagNames[1].async).toBe(true);
      expect(elementTagNames[2].async).toBe(true);
    });

    it('should append the scripts to the head', function() {
      expect(appendedChildren.length).toBe(3);
      expect(appendedChildren[0]).toBe(elementTagNames[0]);
      expect(appendedChildren[1]).toBe(elementTagNames[1]);
      expect(appendedChildren[2]).toBe(elementTagNames[2]);
    });

    it('should be editing', function() {
      expect(chmln.isEditing).toBe(true);
    });

    it('should not be previewing', function() {
      expect(chmln.isPreviewing).toBe(false);
    });

    describe('when the scripts have been downloaded', function() {
      beforeEach(function() {
        window.chmln.Editor = { start: jasmine.createSpy('chmln.Editor.start') };

        elementTagNames[1].onload.call(global);
        elementTagNames[2].onload.call(global);
      });

      it('should start the Editor', function() {
        expect(window.chmln.Editor.start).toHaveBeenCalled();
      });
    });
  });

  describe('when entering preview mode', function() {
    var Preview;

    beforeEach(function() {
      window.opener = { chmln: { Editor: { lib: { Preview: (Preview = jasmine.createSpyObj('Preview', ['start'])) }}}};
      Preview.window = jasmine.createSpy('Preview:window');
    });

    it('should not assign the preview', function() {
      requireMesso();

      expect(chmln.Preview).toBeUndefined();
    });

    it('should download the normal scripts', function() {
      requireMesso();

      expect(elementTagNames.length).toBe(2);
    });

    it('should not be editing or previewing', function() {
      requireMesso();

      expect(chmln.isEditing).toBe(false);
      expect(chmln.isPreviewing).toBe(false);
    });

    describe('when editing', function() {
      beforeEach(function() {
        document.cookie = 'chmln-user-admin=foo;';

        requireMesso();
      });

      it('should be editing', function() {
        expect(chmln.isEditing).toBe(true);
      });

      it('should be previewing', function() {
        expect(chmln.isPreviewing).toBe(true);
      });

      it('should add the chmln script only', function() {
        expect(elementTagNames.length).toBe(1);
        expect(elementTagNames[0].__tagName).toBe('script');
        expect(elementTagNames[0].src).toBe('{{FAST_URL}}/chmln/index.min.js');
        expect(elementTagNames[0].async).toBe(true);
      });

      describe('when the chmln script is loaded', function() {
        beforeEach(function() {
          window.chmln.start = jasmine.createSpy('chmln.start');

          elementTagNames[0].onload.call(global);
        });

        it('should start it script', function() {
          expect(window.chmln.start).toHaveBeenCalled();
        });

        it('should assign the preview', function() {
          expect(chmln.Preview).toBe(Preview);
        });

        it('should start the Preview', function() {
          expect(Preview.start).toHaveBeenCalled();
        });
      });
    });
  });

  var specs = [
    { location: '?chmln-editor-session=XYZ123',         url: 'https://yoursite.com' },
    { location: '#a=b&chmln-editor-session=XYZ123',     url: 'https://yoursite.com#a=b' },
    { location: '?c=d#chmln-editor-session=XYZ123&e=f', url: 'https://yoursite.com?c=d&e=f' },
    { location: '?e=f&chmln-editor-session=XYZ123&g=h#w=x&chmln-editor-session=XYZ123&y=z', url: 'https://yoursite.com?e=f&g=h#w=x&y=z' }
  ];

  specs.forEach(function(spec) {
    describe('when authenticating for editing - ' + spec.url, function() {
      beforeEach(function() {
        chmln.location += spec.location;

        requireMesso();
        elementTagNames[0].onload.call(global);
        elementTagNames[1].onload.call(global);
      });

      it('should add the scripts', function() {
        expect(elementTagNames.length).toBe(4);
      });

      it('should have the urls', function() {
        expect(elementTagNames[0].src).toBe('{{LOGIN_URL}}/login/XYZ123.min.js');
        expect(elementTagNames[1].src).toMatch(/chmln\/index/);
        expect(elementTagNames[2].src).toMatch(/ecosystem/);
        expect(elementTagNames[3].src).toMatch(/editor\/index/);
      });

      it('should be script tags', function() {
        expect(elementTagNames[0].__tagName).toBe('script');
        expect(elementTagNames[1].__tagName).toBe('script');
        expect(elementTagNames[2].__tagName).toBe('script');
        expect(elementTagNames[3].__tagName).toBe('script');
      });

      it('should be asynchronous', function() {
        expect(elementTagNames[0].async).toBe(true);
        expect(elementTagNames[1].async).toBe(true);
        expect(elementTagNames[2].async).toBe(true);
        expect(elementTagNames[3].async).toBe(true);
      });

      it('should append the scripts to the head', function() {
        expect(appendedChildren.length).toBe(4);
        expect(appendedChildren[0]).toBe(elementTagNames[0]);
        expect(appendedChildren[1]).toBe(elementTagNames[1]);
        expect(appendedChildren[2]).toBe(elementTagNames[2]);
        expect(appendedChildren[3]).toBe(elementTagNames[3]);
      });

      it('should replace the current state', function() {
        expect(replacedStates.length).toBe(1);
        expect(replacedStates[0]).toEqual([null, null, spec.url]);
      });

      describe('when push state is missing', function() {
        beforeEach(function() {
          window.history = null;

          requireMesso();
          elementTagNames[4].onload.call(global);
          elementTagNames[5].onload.call(global);
        });

        it('should still add the scripts', function() {
          expect(elementTagNames.length).toBe(8);
        });
      });
    });
  });
});
