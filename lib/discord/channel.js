var TYPES = [
  'root',
  'logs',
  'test',
  'announcements',
  'default',
];

function Channel(client, options) {
  if (arguments.length === 1) {
    options = client;
    client = null;
  }

  if (client !== null && typeof client !== 'object') {
    throw new Error('client must be object');
  }

  if (options === undefined || options === null) {
    options = {};
  } else if (typeof options === 'string') {
    options = {id: options};
  }

  if (typeof options !== 'object') {
    throw new Error('options must be object');
  }

  if (!options.hasOwnProperty('id')) {
    throw new Error('id is required');
  }
  if (!options.hasOwnProperty('type') || options.type === null) {
    options.type = 'default';
  }
  if (!options.hasOwnProperty('contentType') || options.contentType === null) {
    options.contentType = 'text';
  }

  if (typeof options.id !== 'string') {
    throw new Error('id must be string');
  }
  if (typeof options.type !== 'string') {
    throw new Error('type must be string');
  }
  if (options.hasOwnProperty('name') && typeof options.name !== 'string') {
    throw new Error('name must be string');
  }

  if (TYPES.indexOf(options.type) === -1) {
    throw new Error('invalid channel type');
  }
  if (options.contentType !== 'text' && options.contentType !== 'voice') {
    throw new Error('contentType must be text or voice');
  }

  this.id = options.id;
  this.type = options.type;
  this.name = options.name || null;
  this.contentType = options.contentType;

  // Instance of Discord.
  Object.defineProperty(this, 'client', {
    value: client,
  });
}

Channel.prototype.send = function(message, callback) {
  if (this.client === null) {
    throw new Error('client not available');
  }

  return this.client.send(this, message, callback);
};

exports.Channel = Channel;
