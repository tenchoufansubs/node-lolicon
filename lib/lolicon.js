var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Dropbox = require('./dropbox').Dropbox;
var Discord = require('./discord').Discord;

function Lolicon(options) {
  if (options === undefined || options === null) {
    options = {};
  }
  if (typeof options !== 'object') {
    throw new Error('options must be object');
  }

  EventEmitter.call(this);

  var _this = this;

  this.triggers = new EventEmitter();
  this.triggers.setMaxListeners(1);

  this.dropbox = new Dropbox(options.dropbox);
  this.discord = new Discord(options.discord);

  this.commandPrefix = '!';

  this.discord.on('message', function(msg) {
    _this.emit('message', msg);
  });

  this.instances = 0;
}

util.inherits(Lolicon, EventEmitter);

Lolicon.prototype.trigger = function(triggerName, data) {
  if (typeof triggerName !== 'string') {
    throw new Error('triggerName must be string');
  }
  if (data === undefined) {
    data = null;
  }

  this.triggers.emit(triggerName, data);
};

Lolicon.prototype.open = function(callback) {
  if (typeof callback !== 'function') {
    throw new Error('callback must be function');
  }

  var _this = this;

  this.discord.open(function(err) {
    if (err) {
      return callback(err);
    }

    _this.instances++;

    _this.emit('ready');

    return callback(null, function done() {
      return _this.close(function(err) {
        if (err) {
          return _this.emit('error', err);
        }

        return _this.emit('idle');
      });
    });

  });
};

Lolicon.prototype.close = function(callback) {
  if (typeof callback !== 'function') {
    throw new Error('callback must be function');
  }

  var count = --this.instances;

  if (count < 0) {
    debug('Hey, counter is < 0.');
    count = 0;
  }

  if (count > 0) {
    return callback(null);
  }

  return this.discord.close(function(err) {
    if (err) {
      return callback(err);
    }

    return callback(null);
  });
};

exports.Lolicon = Lolicon;
