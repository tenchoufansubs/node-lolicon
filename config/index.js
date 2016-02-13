var fs = require('fs');

var extend = require('extend');

var env = process.env.NODE_ENV || 'development';

var defaultConfig = require('./default');

var availableEnvironments = fs.readdirSync(__dirname).map(function(name) {
  if (name === 'index.js') {
    return;
  }
  if (name === 'default.js') {
    return;
  }

  var m = name.match(/^([a-z]+)\.js$/);
  if (!m) {
    return;
  }

  return m[1];
}).filter(function(name) {
  return !!name;
});

var config = JSON.parse(JSON.stringify(defaultConfig));

if (availableEnvironments.indexOf(env) > -1) {
  config = extend(true, config, require('./' + env));
}

module.exports = config;
