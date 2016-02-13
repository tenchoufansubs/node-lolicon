var debug = require('debug')('lolicon:lib:discord:message');

var User = require('./user').User;
var Channel = require('./channel').Channel;

function Message(client, rawMessage) {
  if (arguments.length === 1) {
    rawMessage = client;
    client = null;
  }

  if (rawMessage === undefined) {
    rawMessage = null;
  }
  if (client === undefined) {
    client = null;
  }

  // Raw message.
  Object.defineProperty(this, '_raw', {
    value: rawMessage,
  });

  // Instance of Discord.
  Object.defineProperty(this, 'client', {
    value: client,
  });

  this.id = null; // String.
  this.author = null; // Instance of User.
  this.body = null; // String.
  this.channel = null; // String.
  this.date = null; // Instance of Date.

  this.isFile = false;

  initMessage(this);
}

Message.prototype.reply = function(msg, callback) {
  if (typeof callback !== 'function') {
    throw new Error('callback must be function');
  }
  if (this.client === null) {
    throw new Error('client not available');
  }

  if (msg.isFile) {
    return this.client.replyFile(this, msg, callback);
  }

  this.client.reply(this, msg, callback);
};

function initMessage(msg) {
  if (msg instanceof Message !== true) {
    throw new Error('msg must be Message');
  }

  var c = msg._raw.channel;
  var specialChannels = msg.client.channels.map(function(chan) {
    return chan.id;
  });

  var idx = specialChannels.indexOf(c.id);
  if (idx > -1) {
    msg.channel = msg.client.channels[idx];
  } else {
    msg.channel = new Channel({
      id: c.id,
      name: c.name,
      contentType: c.type,
    });
  }

  msg.id = msg._raw.id;
  msg.body = msg._raw.cleanContent;

  msg.date = new Date(msg._raw.timestamp);
}

exports.Message = Message;
