(function() {
  //
  // Runs before this file: `make messoify`
  //

  var startTime = new Date(),
    files = require('fs'),
    directory = process.cwd(),
    branch = process.env.BRANCH_NAME || process.env.BRANCH,
    branches = /^(master|v\d)$/;

  if(!branches.test(branch)) {
    throw new Error('Configuration Error: Publishing is only supported on: '+branches);
  }

  var request = require('request'),
    zlib = require('zlib'),
    gzippedBody = zlib.gzipSync(files.readFileSync(directory+'/hyoid.js'));


  console.log('Gzipped to: '+Buffer.byteLength(gzippedBody.toString())/1024+'KB');

})();
