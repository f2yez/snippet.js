require('./helpers/spec_helper.js');

describe('messo', function() {
  var elementTagNames, appendedChildren, replacedStates;
  var requireIndex = function() {
    delete require.cache[process.cwd()+'/messo.js'];

    require('../messo.js');
  };

  beforeEach(function() {
    elementTagNames = [];
    appendedChildren = [];
    replacedStates = [];

    window = {
      location: 'https://yoursite.com',
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
      accountToken: 'account-1124'
    };
  });

  describe('script for chmln/index', function() {
    beforeEach(function() {
      requireIndex();
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
      expect(elementTagNames[1].src).toBe('{{FAST_URL}}/habitat/account-1124/{{HABITAT_TOKEN}}.min.js');
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

    describe('when the chmln script has been downloaded', function() {
      beforeEach(function() {
        window.chmln.start = jasmine.createSpy('chmln.start');

        elementTagNames[0].onload.call(global);
      });

      it('should not start the script', function() {
        expect(window.chmln.start).not.toHaveBeenCalled();
      });

      describe('when the account data script completes', function() {
        beforeEach(function() {
          elementTagNames[1].onload.call(global);
        });

        it('should start the script', function() {
          expect(window.chmln.start).toHaveBeenCalled();
        });
      });
    });
  });

  describe('when authenticated for editing', function() {
    beforeEach(function() {
      document.cookie = 'chmln-user-id=ABC123;';

      requireIndex();
    });

    it('should add the scripts', function() {
      expect(elementTagNames.length).toBe(3);
    });

    it('should have the urls', function() {
      expect(elementTagNames[0].src).toMatch(/chmln\/index/);
      expect(elementTagNames[1].src).toBe('{{FAST_URL}}/editor/index.min.js');
      expect(elementTagNames[2].src).toBe('{{FAST_URL}}/ecosystem.min.js');
    });

    it('should be script tags', function() {
      expect(elementTagNames[0].__tagName).toBe('script');
      expect(elementTagNames[1].__tagName).toBe('script');
      expect(elementTagNames[2].__tagName).toBe('script');
    });

    it('should be synchronous', function() {
      expect(elementTagNames[0].async).toBeUndefined();
      expect(elementTagNames[1].async).toBeUndefined();
      expect(elementTagNames[2].async).toBeUndefined();
    });

    it('should append the scripts to the head', function() {
      expect(appendedChildren.length).toBe(3);
      expect(appendedChildren[0]).toBe(elementTagNames[0]);
      expect(appendedChildren[1]).toBe(elementTagNames[1]);
      expect(appendedChildren[2]).toBe(elementTagNames[2]);
    });

    describe('when the ecosystem script has been downloaded', function() {
      beforeEach(function() {
        window.chmln.Editor = { start: jasmine.createSpy('chmln.Editor.start') };

        elementTagNames[2].onload.call(global);
      });

      it('should start the Editor', function() {
        expect(window.chmln.Editor.start).toHaveBeenCalled();
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
        window.location += spec.location;

        requireIndex();
      });

      it('should add the scripts', function() {
        expect(elementTagNames.length).toBe(4);
      });

      it('should have the urls', function() {
        expect(elementTagNames[0].src).toMatch(/chmln\/index/);
        expect(elementTagNames[1].src).toBe('{{FAST_URL}}/login/XYZ123.min.js');
        expect(elementTagNames[2].src).toMatch(/editor\/index/);
        expect(elementTagNames[3].src).toMatch(/ecosystem/);
      });

      it('should be script tags', function() {
        expect(elementTagNames[0].__tagName).toBe('script');
        expect(elementTagNames[1].__tagName).toBe('script');
        expect(elementTagNames[2].__tagName).toBe('script');
        expect(elementTagNames[3].__tagName).toBe('script');
      });

      it('should be synchronous', function() {
        expect(elementTagNames[0].async).toBeUndefined();
        expect(elementTagNames[1].async).toBeUndefined();
        expect(elementTagNames[2].async).toBeUndefined();
        expect(elementTagNames[3].async).toBeUndefined();
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

          requireIndex();
        });

        it('should still add the scripts', function() {
          expect(elementTagNames.length).toBe(8);
        });
      });
    });
  });
});
