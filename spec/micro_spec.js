require('./helpers/spec_helper.js');

describe('micro', function() {
  var elementTagNames, appendedChildren, localGets;
  var requireShort = function() {
    delete require.cache[process.cwd()+'/index.js'];

    require('../index.js');
  };

  beforeEach(function() {
    elementTagNames = [];
    appendedChildren = [];
    localGets = {};

    window = {
      location: 'https://yoursite.com',
      localStorage: {
        getItem: function(key) {
          return localGets[key];
        }
      }
    };

    document = {
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
  });

  describe('script for short', function() {
    beforeEach(function() {
      requireShort();
    });

    it('should add the script', function() {
      expect(elementTagNames.length).toBe(1);
    });

    it('should be a script tag', function() {
      expect(elementTagNames[0].__tagName).toBe('script');
    });

    it('should have the url', function() {
      expect(elementTagNames[0].src).toMatch(/https:\/\/fast\.trychameleon\.com\/messo\/.+\/messo\.min\.js/);
    });

    it('should be asynchronous', function() {
      expect(elementTagNames[0].async).toBe(true);
    });

    it('should append the scripts to the head', function() {
      expect(appendedChildren.length).toBe(1);
      expect(appendedChildren[0]).toBe(elementTagNames[0]);
    });
  });

  describe('locally given values', function() {
    beforeEach(function() {
      localGets['chmln:messo-url'] = 'https://chmln.js';
    });

    it('should have the given urls', function() {
      requireShort();

      expect(elementTagNames.length).toBe(1);
      expect(elementTagNames[0].src).toBe('https://chmln.js');
    });

    describe('when local storage is not available', function() {
      beforeEach(function() {
        window.localStorage = null;
      });

      it('should have the default urls', function() {
        requireShort();

        expect(elementTagNames.length).toBe(1);
        expect(elementTagNames[0].src).toMatch(/https:\/\/fast\.trychameleon\.com\/messo\/.+\/messo\.min\.js/);
      });
    });
  });

  describe('.setup', function() {
    beforeEach(function() {
      requireShort();

      window.chmln.setup(135);
      window.chmln.setup(531);
    });

    it('should queue the requests', function() {
      expect(window.chmln.setup_a.length).toBe(2);

      expect(Array.prototype.slice.call(window.chmln.setup_a[0])).toEqual([135]);
      expect(Array.prototype.slice.call(window.chmln.setup_a[1])).toEqual([531]);
    });
  });

  describe('.identify', function() {
    beforeEach(function() {
      requireShort();

      window.chmln.identify(115);
      window.chmln.identify(511);
    });

    it('should queue the requests', function() {
      expect(window.chmln.identify_a.length).toBe(2);

      expect(Array.prototype.slice.call(window.chmln.identify_a[0])).toEqual([115]);
      expect(Array.prototype.slice.call(window.chmln.identify_a[1])).toEqual([511]);
    });
  });

  describe('.alias', function() {
    beforeEach(function() {
      requireShort();

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
      requireShort();

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
      requireShort();

      window.chmln.set(4812);
      window.chmln.set(1284);
    });

    it('should queue the requests', function() {
      expect(window.chmln.set_a.length).toBe(2);

      expect(Array.prototype.slice.call(window.chmln.set_a[0])).toEqual([4812]);
      expect(Array.prototype.slice.call(window.chmln.set_a[1])).toEqual([1284]);
    });
  });

  describe('.show', function() {
    beforeEach(function() {
      requireShort();

      window.chmln.show(9944);
      window.chmln.show(4197);
    });

    it('should queue the requests', function() {
      expect(window.chmln.show_a.length).toBe(2);

      expect(Array.prototype.slice.call(window.chmln.show_a[0])).toEqual([9944]);
      expect(Array.prototype.slice.call(window.chmln.show_a[1])).toEqual([4197]);
    });
  });

  describe('.custom', function() {
    beforeEach(function() {
      requireShort();

      window.chmln.custom('foo');
      window.chmln.custom(1234);
    });

    it('should queue the requests', function() {
      expect(window.chmln.custom_a.length).toBe(2);

      expect(Array.prototype.slice.call(window.chmln.custom_a[0])).toEqual(['foo']);
      expect(Array.prototype.slice.call(window.chmln.custom_a[1])).toEqual([1234]);
    });
  });

  describe('._data', function() {
    beforeEach(function() {
      requireShort();

      window.chmln._data({campaigns:[12,3], steps:[1]});
    });

    it('should queue the requests', function() {
      expect(window.chmln._data_a.length).toBe(1);

      expect(Array.prototype.slice.call(window.chmln._data_a[0])).toEqual([{campaigns:[12,3], steps:[1]}]);
    });
  });

  describe('.on', function() {
    var fooFN = function() { };

    beforeEach(function() {
      requireShort();

      window.chmln.on('foo', fooFN);
    });

    it('should queue the requests', function() {
      expect(window.chmln.on_a.length).toBe(1);

      expect(Array.prototype.slice.call(window.chmln.on_a[0])).toEqual(['foo', fooFN]);
    });
  });

  describe('.off', function() {
    var barFN = function() { };

    beforeEach(function() {
      requireShort();

      window.chmln.off('bar', barFN);
    });

    it('should queue the requests', function() {
      expect(window.chmln.off_a.length).toBe(1);

      expect(Array.prototype.slice.call(window.chmln.off_a[0])).toEqual(['bar', barFN]);
    });
  });
});
