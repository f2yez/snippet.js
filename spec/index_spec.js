require('./helpers/spec_helper.js');

describe('snippet', function() {
  var elementTagNames, appendedChildren, replacedStates, localGetKeys, localGets, mockScriptBodies;
  var requireIndex = function() {
    delete require.cache[process.cwd()+'/index.js'];

    require('../index.js');
  };

  beforeEach(function() {
    elementTagNames = [];
    appendedChildren = [];
    replacedStates = [];
    localGetKeys = [];
    localGets = {};
    mockScriptBodies = {};

    window = {
      location: 'https://yoursite.com',
      localStorage: {
        getItem: function(key) {
          localGetKeys.push(key);
          return localGets[key];
        }
      },
      history: {
        replaceState: function() {
          replacedStates.push(Array.prototype.slice.call(arguments));
        }
      }
    };

    document = {
      cookie: '',
      createElement: function(name) {
        var tag = { };
        elementTagNames.push([name, tag]);
        return tag;
      },
      head: {
        appendChild: function(child) {
          appendedChildren.push(child);

          if(child.src && mockScriptBodies[child.src]) {
            mockScriptBodies[child.src].call(global);
          }
        }
      }
    };
  });

  describe('script for chmln/index', function() {
    beforeEach(function() {
      requireIndex();
    });

    it('should add the scripts', function() {
      expect(elementTagNames.length).toBe(2);
    });

    it('should have the urls', function() {
      expect(elementTagNames[0][1].src).toBe('https://fast.trychameleon.com/chmln/index.min.js');
      expect(elementTagNames[1][1].src).toBe('https://fast.trychameleon.com/accounts/{{ACCOUNT_ID}}/index.min.js');
    });

    it('should be script tags', function() {
      expect(elementTagNames[0][0]).toBe('script');
      expect(elementTagNames[1][0]).toBe('script');
    });

    it('should be async', function() {
      expect(elementTagNames[0][1].async).toBe(true);
      expect(elementTagNames[1][1].async).toBe(true);
    });

    it('should append the scripts to the head', function() {
      expect(appendedChildren.length).toBe(2);
      expect(appendedChildren[0]).toBe(elementTagNames[0][1]);
      expect(appendedChildren[1]).toBe(elementTagNames[1][1]);
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
      expect(elementTagNames[0][1].src).toMatch(/chmln\/index/);
      expect(elementTagNames[1][1].src).toBe('https://fast.trychameleon.com/editor/index.min.js');
      expect(elementTagNames[2][1].src).toBe('https://edit.trychameleon.com/ecosystem.min.js');
    });

    it('should be script tags', function() {
      expect(elementTagNames[0][0]).toBe('script');
      expect(elementTagNames[1][0]).toBe('script');
      expect(elementTagNames[2][0]).toBe('script');
    });

    it('should be synchronous', function() {
      expect(elementTagNames[0][1].async).toBe(false);
      expect(elementTagNames[1][1].async).toBe(false);
      expect(elementTagNames[2][1].async).toBe(false);
    });

    it('should append the scripts to the head', function() {
      expect(appendedChildren.length).toBe(3);
      expect(appendedChildren[0]).toBe(elementTagNames[0][1]);
      expect(appendedChildren[1]).toBe(elementTagNames[1][1]);
      expect(appendedChildren[2]).toBe(elementTagNames[2][1]);
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

        mockScriptBodies['https://prehensile.trychameleon.com/login/XYZ123.min.js'] = function() {
          document.cookie = 'chmln-user-id=TOKEN123'
        };

        requireIndex();
      });

      it('should add the scripts', function() {
        expect(elementTagNames.length).toBe(4);
      });

      it('should have the urls', function() {
        expect(elementTagNames[0][1].src).toMatch(/chmln\/index/);
        expect(elementTagNames[1][1].src).toBe('https://prehensile.trychameleon.com/login/XYZ123.min.js');
        expect(elementTagNames[2][1].src).toMatch(/editor\/index/);
        expect(elementTagNames[3][1].src).toMatch(/ecosystem/);
      });

      it('should be script tags', function() {
        expect(elementTagNames[0][0]).toBe('script');
        expect(elementTagNames[1][0]).toBe('script');
        expect(elementTagNames[2][0]).toBe('script');
        expect(elementTagNames[3][0]).toBe('script');
      });

      it('should be synchronous', function() {
        expect(elementTagNames[0][1].async).toBe(false);
        expect(elementTagNames[1][1].async).toBe(false);
        expect(elementTagNames[2][1].async).toBe(false);
        expect(elementTagNames[3][1].async).toBe(false);
      });

      it('should append the scripts to the head', function() {
        expect(appendedChildren.length).toBe(4);
        expect(appendedChildren[0]).toBe(elementTagNames[0][1]);
        expect(appendedChildren[1]).toBe(elementTagNames[1][1]);
        expect(appendedChildren[2]).toBe(elementTagNames[2][1]);
        expect(appendedChildren[3]).toBe(elementTagNames[3][1]);
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

  describe('locally given values', function() {
    beforeEach(function() {
      localGets['chmln:chmln-url'] = 'https://chmln.js';
      localGets['chmln:accounts-url'] = 'https://accounts/:id/5.js';
    });

    it('should have the given urls', function() {
      requireIndex();

      expect(elementTagNames.length).toBe(2);
      expect(elementTagNames[0][1].src).toBe('https://chmln.js');
      expect(elementTagNames[1][1].src).toBe('https://accounts/{{ACCOUNT_ID}}/5.js');
    });

    describe('for session + edit', function() {
      beforeEach(function() {
        window.location += '?chmln-editor-session=SESSION_TOKEN_123';

        mockScriptBodies['https://l/SESSION_TOKEN_123/20.js'] = function() {
          document.cookie = 'chmln-user-id=YES123;';
        };

        localGets['chmln:editor-url'] = 'https://editor.js.net';
        localGets['chmln:login-url'] = 'https://l/:id/20.js';
        localGets['chmln:ecosystem-url'] = 'https://l/10.js';

        requireIndex();
      });

      it('should have the given urls', function() {
        expect(elementTagNames.length).toBe(4);
        expect(elementTagNames[0][1].src).toBe('https://chmln.js');
        expect(elementTagNames[1][1].src).toBe('https://l/SESSION_TOKEN_123/20.js');
        expect(elementTagNames[2][1].src).toBe('https://editor.js.net');
        expect(elementTagNames[3][1].src).toBe('https://l/10.js');
      });
    });

    describe('when given an account id', function() {
      beforeEach(function() {
        localGets['chmln:editor-account-id'] = 'ASDF1234';

        requireIndex();
      });

      it('should have the value', function() {
        expect(elementTagNames[1][1].src).toBe('https://accounts/ASDF1234/5.js');
      });
    });

    describe('when local storage is not available', function() {
      beforeEach(function() {
        window.localStorage = null;
      });

      it('should have the default urls', function() {
        requireIndex();

        expect(elementTagNames.length).toBe(2);
        expect(elementTagNames[0][1].src).toBe('https://fast.trychameleon.com/chmln/index.min.js');
        expect(elementTagNames[1][1].src).toBe('https://fast.trychameleon.com/accounts/{{ACCOUNT_ID}}/index.min.js');
      });
    });
  });

  describe('.setup', function() {
    beforeEach(function() {
      requireIndex();

      window.chmln.setup(135);
      window.chmln.setup(531);
    });

    it('should queue the requests', function() {
      expect(window.chmln.setup_a.length).toBe(2);

      expect(Array.prototype.slice.call(window.chmln.setup_a[0])).toEqual([135]);
      expect(Array.prototype.slice.call(window.chmln.setup_a[1])).toEqual([531]);
    });
  });

  describe('.alias', function() {
    beforeEach(function() {
      requireIndex();

      window.chmln.alias(246);
      window.chmln.alias(642);
    });

    it('should queue the requests', function() {
      expect(window.chmln.alias_a.length).toBe(2);

      expect(Array.prototype.slice.call(window.chmln.alias_a[0])).toEqual([246]);
      expect(Array.prototype.slice.call(window.chmln.alias_a[1])).toEqual([642]);
    });
  });

  describe('.track', function() {
    beforeEach(function() {
      requireIndex();

      window.chmln.track(369);
      window.chmln.track(963);
    });

    it('should queue the requests', function() {
      expect(window.chmln.track_a.length).toBe(2);

      expect(Array.prototype.slice.call(window.chmln.track_a[0])).toEqual([369]);
      expect(Array.prototype.slice.call(window.chmln.track_a[1])).toEqual([963]);
    });
  });

  describe('.set', function() {
    beforeEach(function() {
      requireIndex();

      window.chmln.set(4812);
      window.chmln.set(1284);
    });

    it('should queue the requests', function() {
      expect(window.chmln.set_a.length).toBe(2);

      expect(Array.prototype.slice.call(window.chmln.set_a[0])).toEqual([4812]);
      expect(Array.prototype.slice.call(window.chmln.set_a[1])).toEqual([1284]);
    });
  });

  describe('._data', function() {
    beforeEach(function() {
      requireIndex();

      window.chmln._data({campaigns:[12,3], steps:[1]});
    });

    it('should queue the requests', function() {
      expect(window.chmln._data_a.length).toBe(1);

      expect(Array.prototype.slice.call(window.chmln._data_a[0])).toEqual([{campaigns:[12,3], steps:[1]}]);
    });
  });
});
