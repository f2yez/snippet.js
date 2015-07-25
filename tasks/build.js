var files = require('fs'),
  path = require('path');

var string = files.readFileSync(path.resolve('snippet.js')).toString();

if(!process.env.FAST_URL || !process.env.HOST || !process.env.TARGET_FILE || !process.env.PROTOCOL) {
  throw new Error('Expected to have a fast url and host (env.FAST_URL + env.HOST + env.TARGET_FILE + env.PROTOCOL) but did not.');
}

if(string.indexOf('{{FAST_URL}}') === -1 || string.indexOf('{{HOST}}') === -1 || string.indexOf('{{PROTOCOL}}') === -1) {
  throw new Error('Expected to find {{FAST_URL}} + {{HOST}} in snippet.js but did not.');
}

string = string.replace(/\{\{FAST_URL\}\}/g, process.env.FAST_URL);
string = string.replace(/\{\{HOST\}\}/g, process.env.HOST);
string = string.replace(/\{\{PROTOCOL\}\}/g, process.env.PROTOCOL);

files.writeFileSync(process.env.TARGET_FILE, string);
