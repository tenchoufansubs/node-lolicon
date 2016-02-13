var util = require('util');
var EventEmitter = require('events').EventEmitter;

var discord = require('discord.js');

var Message = require('./message').Message;
var Channel = require('./channel').Channel;

function Discord(options) {
  if (options === undefined || options === null) {
    throw new Error('options required');
  }
  if (typeof options !== 'object') {
    throw new Error('options must be object');
  }
  if (typeof options.email !== 'string') {
    throw new Error('email must be string');
  }
  if (typeof options.password !== 'string') {
    throw new Error('password must be string');
  }

  if (!options.hasOwnProperty('relayUrl')) {
    options.relayUrl = null;
  }
  if (options.relayUrl !== null && typeof options.relayUrl !== 'string') {
    throw new Error('relayUrl must be string');
  }

  if (!options.hasOwnProperty('channels')) {
    options.channels = [];
  }
  if (!Array.isArray(options.channels)) {
    throw new Error('channels must be array');
  }

  EventEmitter.call(this);

  var _this = this;

  Object.defineProperty(this, 'email', {
    value: options.email,
  });

  Object.defineProperty(this, 'password', {
    value: options.password,
  });

  this.channels = options.channels.map(function(data) {
    return new Channel(_this, data);
  });

  this.client = new discord.Client();

  this.relayUrl = options.relayUrl;

  this.client.on('message', function(rawMsg) {
    var msg = new Message(_this, rawMsg);
    _this.emit('message', msg);
  });
}

util.inherits(Discord, EventEmitter);

Discord.prototype.open = function(callback) {
  if (typeof callback !== 'function') {
    throw new Error('callback must be function');
  }

  var _this = this;

  var fired = false;

  _this.client.once('ready', function() {
    if (fired) {
      return;
    }

    fired = true;
    return callback(null);
  });

  this.client.login(this.email, this.password, function(err) {
    if (fired) {
      return;
    }

    if (err) {
      fired = true;
      return callback(err);
    }
  });
};

Discord.prototype.close = function(callback) {
  if (typeof callback !== 'function') {
    throw new Error('callback must be function');
  }

  this.client.logout(function(err) {
    if (err) {
      return callback(err);
    }

    return callback(null);
  });
};

Discord.prototype.replyFile = function(originalMessage, file, callback) {
  if (originalMessage instanceof Message !== true) {
    throw new Error('originalMessage must be Message');
  }
  if (typeof callback !== 'function') {
    throw new Error('callback must be function');
  }

  var _this = this;

  file.getUrl(function(err, fileUrl) {
    if (err) {
      return callback(err);
    }

    var channelId = originalMessage.channel.id;

    _this.client.sendFile(channelId, fileUrl, file.name, function(err) {
      if (err) {
        return callback(err);
      }

      // ...
    });
  });
};

Discord.prototype.reply = function(originalMessage, replyMessage, callback) {
  if (originalMessage instanceof Message !== true) {
    throw new Error('originalMessage must be Message');
  }
  if (typeof callback !== 'function') {
    throw new Error('callback must be function');
  }

  this.client.reply(originalMessage._raw, replyMessage, function(err, rawSentMessage) {
    if (err) {
      return callback(err);
    }

    var sentMessage = new Message(rawSentMessage);

    return callback(null, sentMessage);
  });
};

Discord.prototype.send = function(channel, message, callback) {
  if (channel instanceof Channel !== true) {
    throw new Error('channel must be Channel');
  }
  if (typeof callback !== 'function') {
    throw new Error('callback must be function');
  }
  if (message instanceof Message) {
    message = message.body;
  }
  if (typeof message !== 'string') {
    throw new Error('message must be string');
  }

  var _this = this;

  this.client.sendMessage(channel.id, message, function(err, rawSentMessage) {
    if (err) {
      return callback(err);
    }

    var sentMessage = new Message(_this, rawSentMessage);

    return callback(null, sentMessage);
  });
};

exports.Discord = Discord;
