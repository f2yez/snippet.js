var files = require('fs'),
  path = require('path');

var string = files.readFileSync(path.resolve('snippet.js')).toString();

if(!process.env.FAST_URL || !process.env.HOST) {
  throw new Error('Expected to have a fast url and host (env.FAST_URL + env.HOST) but did not.');
}

if(string.indexOf('{{FAST_URL}}') === -1 || string.indexOf('{{HOST}}') === -1) {
  throw new Error('Expected to find {{FAST_URL}} + {{HOST}} in snippet.js but did not.');
}

string = string.replace('{{FAST_URL}}', process.env.FAST_URL);
string = string.replace('{{HOST}}', process.env.HOST);

files.writeFileSync('index.js', string);
