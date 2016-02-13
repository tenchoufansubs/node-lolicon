var path = require('path');

var dropbox = require('dropbox');

var PREFIX = '/Lolicon';
var TRIGGERS = PREFIX + '/Triggers';

function File(client, filePath) {
  if (client === undefined || client === null) {
    throw new Error('client is required');
  }
  if (typeof filePath !== 'string') {
    throw new Error('filePath must be string');
  }

  // Instance of dropbox.Client.
  Object.defineProperty(this, 'client', {
    value: client,
  });

  Object.defineProperty(this, 'path', {
    enumerable: true,
    value: filePath,
  });

  Object.defineProperty(this, 'name', {
    enumerable: true,
    value: path.basename(this.path),
  });

  Object.defineProperty(this, 'isFile', {
    enumerable: true,
    value: true,
  });
}

File.prototype.get = function(callback) {
  if (typeof callback !== 'function') {
    throw new Error('callback must be function');
  }

  this.client.readFile(this.path, {buffer: true}, function(err, data) {
    if (err) {
      return callback(err);
    }

    if (data === undefined) {
      err = new Error('file not found');
      return callback(err);
    }

    return callback(null, data);
  });
};

File.prototype.getUrl = function(callback) {
  if (typeof callback !== 'function') {
    throw new Error('callback must be function');
  }

  var options = {
    download: true,
  };

  this.client.makeUrl(this.path, options, function(err, shareUrl) {
    if (err) {
      return callback(err);
    }

    var fileUrl = shareUrl.url;

    return callback(null, fileUrl);
  });
};

function Dropbox(options) {
  if (options === undefined || options === null) {
    options = {};
  }

  if (typeof options.key !== 'string') {
    throw new Error('key must be string');
  }
  if (typeof options.secret !== 'string') {
    throw new Error('secret must be string');
  }
  if (typeof options.token !== 'string') {
    throw new Error('token must be string');
  }

  this.key = options.key;
  this.secret = options.secret;
  this.token = options.token;

  this.client = new dropbox.Client({
    key: this.key,
    secret: this.secret,
    token: this.token,
  });
}

/**
 * Return an array containing the names of the available triggers.
 */
Dropbox.prototype.triggers = function(callback) {
  if (typeof callback !== 'function') {
    throw new Error('callback must be function');
  }

  this.client.readdir(TRIGGERS, function(err, entries) {
    if (err) {
      return callback(err);
    }

    var names = entries.map(function(name) {
      return name.toLowerCase();
    });

    return callback(null, names);
  });
};

/**
 * Returns a random File from the trigger's directory.
 */
Dropbox.prototype.randomFile = function(triggerName, callback) {
  if (typeof triggerName !== 'string') {
    throw new Error('triggerName must be string');
  }
  if (typeof callback !== 'function') {
    throw new Error('callback must be function');
  }
  if (triggerName !== path.basename(triggerName)) {
    throw new Error('invalid triggerName');
  }

  var _this = this;

  triggerName = triggerName.toLowerCase();

  this.triggers(function(err, availableTriggers) {
    if (err) {
      return callback(err);
    }

    if (availableTriggers.indexOf(triggerName) === -1) {
      err = new Error('invalid triggerName');
      return callback(err);
    }

    var triggerDir = TRIGGERS + '/' + triggerName;

    _this.client.readdir(triggerDir, function(err, entries) {
      if (err) {
        return callback(err);
      }

      var imageFiles = entries.filter(function(name) {
        return !!name.match(/\.(jpe?g|png|gif)$/i);
      });

      if (imageFiles.length === 0) {
        err = new Error('no files available');
        return callback(err);
      }

      // Generates a random number in the range [0, imageFiles.length).
      var index = Math.floor(Math.random() * imageFiles.length);

      var filePath = triggerDir + '/' + imageFiles[index];
      var file = new File(_this.client, filePath);

      return callback(null, file);
    });
  });
};

function isFile(something) {
  return something instanceof File;
}

exports.Dropbox = Dropbox;
exports.isFile = isFile;
