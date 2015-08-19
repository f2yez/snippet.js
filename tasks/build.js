var files = require('fs'),
  path = require('path'),
  directory = process.cwd(),
  accountToken = process.env.ACCOUNT_TOKEN,
  habitatToken = process.env.HABITAT_TOKEN;

if(!process.env.INPUT_FILE || !process.env.PROTOCOL || !process.env.FAST_URL || !process.env.TLD || !process.env.TARGET_FILE) {
  throw new Error('Expected to have a file, protocol, fast url, tld and target file (env.INPUT_FILE + env.PROTOCOL + env.FAST_URL + env.TLD + env.PROTOCOL + env.TARGET_FILE) but did not.');
}

var string = files.readFileSync(path.resolve(process.env.INPUT_FILE)).toString();

if(string.indexOf('{{FAST_URL}}') === -1 || string.indexOf('{{PROTOCOL}}') === -1) {
  throw new Error('Expected to find {{FAST_URL}} + {{PROTOCOL}} in '+process.env.INPUT_FILE+' but did not.');
}

string = string.replace(/\{\{FAST_URL\}\}/g, process.env.FAST_URL);
string = string.replace(/\{\{TLD\}\}/g, process.env.TLD);
string = string.replace(/\{\{PROTOCOL\}\}/g, process.env.PROTOCOL);

// Required pre-processing for tasks/publish
if(accountToken) {
  string = string.replace(/\{\{ACCOUNT_TOKEN\}\}/g, accountToken);
  files.writeFileSync(directory+'/.ACCOUNT_TOKEN', accountToken);
}

if(habitatToken) {
  string = string.replace(/\{\{HABITAT_TOKEN\}\}/g, habitatToken);
  files.writeFileSync(directory+'/.HABITAT_TOKEN', habitatToken);
}

files.writeFileSync(process.env.TARGET_FILE, string);
