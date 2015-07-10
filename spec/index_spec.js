require('./helpers/spec_helper.js');

describe('snippet', function() {
  var elementTagNames, appendedChildren, localGetKeys, localGetKey;
  var requireIndex = function() {
    delete require.cache[process.cwd()+'/index.js'];

    require('../index.js');
  };

  beforeEach(function() {
    elementTagNames = [];
    appendedChildren = [];
    localGetKeys = [];
    localGetKey = null;

    window = {
      localStorage: {
        getItem: function(key) {
          localGetKeys.push(key);
          return localGetKey;
        }
      }
    };

    document = {
      createElement: function(name) {
        var tag = { };
        elementTagNames.push([name, tag]);
        return tag;
      },
      head: {
        appendChild: function(child) {
          appendedChildren.push(child);
        }
      }
    };
  });

  describe('script', function() {
    beforeEach(function() {
      requireIndex();
    });

    it('should add a script', function() {
      expect(elementTagNames.length).toBe(1);
      expect(elementTagNames[0][0]).toBe('script');
    });

    it('should be async', function() {
      expect(elementTagNames[0][1].async).toBe(true);
    });

    it('should have the cdn url', function() {
      expect(elementTagNames[0][1].src).toBe('https://cdn.trychameleon.com/east/{{ACCOUNT_ID}}.min.js');
    });

    it('should append the script to the head', function() {
      expect(appendedChildren.length).toBe(1);
      expect(appendedChildren[0]).toBe(elementTagNames[0][1]);
    });

    it('should check for editing', function() {
      expect(localGetKeys.length).toBe(1);
      expect(localGetKeys[0]).toBe('chmln:editor-token');
    });
  });

  describe('script when editing', function() {
    beforeEach(function() {
      localGetKey = 'existing-key';

      requireIndex();
    });

    it('should be synchronous - chmln', function() {
      expect(elementTagNames[0][1].async).toBe(false);
    });

    it('should add a second script - editor', function() {
      expect(elementTagNames.length).toBe(2);
      expect(elementTagNames[1][0]).toBe('script');
    });

    it('should be synchronous - editor', function() {
      expect(elementTagNames[1][1].async).toBe(false);
    });

    it('should have the cdn url - editor', function() {
      expect(elementTagNames[1][1].src).toBe('https://cdn.trychameleon.com/editor/index.min.js');
    });

    it('should append the script to the head - editor', function() {
      expect(appendedChildren.length).toBe(2);
      expect(appendedChildren[1]).toBe(elementTagNames[1][1]);
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
});
