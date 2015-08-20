var files = require('fs'),
  path = require('path'),
  directory = process.cwd(),
  accountToken = process.env.ACCOUNT_TOKEN,
  habitatToken = process.env.HABITAT_TOKEN;

if(!process.env.INPUT_FILE || !process.env.FAST_URL || !process.env.TARGET_FILE) {
  throw new Error('Expected to have a file, fast url and target file (env.INPUT_FILE + env.FAST_URL + env.TARGET_FILE) but did not.');
}

var string = files.readFileSync(path.resolve(process.env.INPUT_FILE)).toString();

if(string.indexOf('{{FAST_URL}}') === -1) {
  throw new Error('Expected to find {{FAST_URL}} in '+process.env.INPUT_FILE+' but did not.');
}

if(/messo/.test(process.env.INPUT_FILE) && string.indexOf('{{LOGIN_URL}}') === -1) {
  throw new Error('Expected to find {{LOGIN_URL}} in '+process.env.INPUT_FILE+' but did not.');
}

//
// Required pre-processing for tasks/publish
//
string = string.replace(/\{\{FAST_URL\}\}/g, process.env.FAST_URL);
string = string.replace(/\{\{LOGIN_URL\}\}/g, process.env.LOGIN_URL);

if(accountToken) {
  string = string.replace(/\{\{ACCOUNT_TOKEN\}\}/g, accountToken);
  files.writeFileSync(directory+'/.ACCOUNT_TOKEN', accountToken);
}

if(habitatToken) {
  string = string.replace(/\{\{HABITAT_TOKEN\}\}/g, habitatToken);
  files.writeFileSync(directory+'/.HABITAT_TOKEN', habitatToken);
}

files.writeFileSync(process.env.TARGET_FILE, string);
