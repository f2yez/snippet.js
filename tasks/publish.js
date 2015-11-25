(function() {
  //
  // Runs before this file: `make messoify`
  //

  var startTime = new Date(),
    files = require('fs'),
    directory = process.cwd(),
    accountToken = process.env.ACCOUNT_TOKEN,
    habitatToken = process.env.HABITAT_TOKEN;

  try { accountToken || (accountToken = fs.readFileSync(directory+'/.ACCOUNT_TOKEN')) } catch(e) {}
  try { habitatToken || (habitatToken = fs.readFileSync(directory+'/.HABITAT_TOKEN')) } catch(e) {}

  if(!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('Configuration Error: An access key and secret are required for publishing to AWS');
  }

  if(!accountToken) {
    console.warn('Configuration Error: An account token is required for publishing.');
    return;
  }

  if(!habitatToken) {
    console.warn('Configuration Error: A habitat token was required for tasks/build.js and is therefore required for publishing.');
    return;
  }

  var AWS = require('aws-sdk'),
    s3bucket = new AWS.S3({ params: { Bucket: 'chmln-east' } }),
    zlib = require('zlib'),
    body = zlib.gzipSync(files.readFileSync(directory+'/messo.min.js')),
    params = {
      ContentType: 'application/javascript',
      ContentEncoding: 'gzip',
      Key: 'messo/'+accountToken+'/messo.min.js',
      Body: body,
      CacheControl: 'public, max-age=1440, no-cache',
      /* ETag: 'Added by S3' */
    };

  /* Cache for one hour; Revalidate first with the ETag - From: https://surge.sh/help/using-lucid-caching-automatically */

  console.log('Gzipped to: '+Buffer.byteLength(body.toString())/1024+'KB');

  s3bucket.upload(params, function(err) {
    if(err) {
      console.log('Error uploading: habitat/messo.min.js', accountToken, habitatToken);

      throw err;
    }

    console.log('Upload of habitat/messo for '+accountToken+' | '+habitatToken+' completed in ' + (new Date().getTime() - startTime) + 'ms');
  });
})();
