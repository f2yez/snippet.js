(function() {
  //
  // Runs before this file: `make messoify`
  //

  var startTime = new Date(),
    files = require('fs'),
    directory = process.cwd();

  var request = require('request'),
    zlib = require('zlib'),
    gzippedBody = zlib.gzipSync(files.readFileSync(directory+'/hyoid.js'));

  console.log('Gzipped to: '+Buffer.byteLength(gzippedBody.toString())/1024+'KB');

  var requestOptions = {
    method: 'POST',
    body: gzippedBody,
    headers: {
      'X-Api-Secret': process.env.HYOID_SECRET || 'local-hyoid-secret',
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'gzip'
    }
  };

  'nyc2-1,sf1-1,ams2-1,sng1-1'.split(',').
    forEach(function(host) {
      requestOptions.url = 'https://hyoid-'+host+'.trychameleon.com/scripts/snippet';

      request(requestOptions, onCompleteFactory('Hyoid:'+host));
    });

  function onCompleteFactory(name) {
    return function(err) {
      if(err) {
        console.log('Error: snippet:'+name);

        throw err;
      }

      console.log('Upload of snippet:'+name+' completed in ' + (new Date().getTime() - startTime) + 'ms');
    }
  }
})();
