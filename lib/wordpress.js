var moment = require('moment');
var Entities = require('html-entities').Html5Entities;

var entities = new Entities();

function Post(rawPost) {
  if (rawPost === undefined || rawPost === null) {
    throw new Error('rawPost is required');
  }
  if (typeof rawPost !== 'object') {
    throw new Error('rawPost must be object');
  }

  if (!rawPost.hasOwnProperty('post_title')) {
    throw new Error('post_title is required');
  }
  if (!rawPost.hasOwnProperty('post_url')) {
    throw new Error('post_url is required');
  }
  if (!rawPost.hasOwnProperty('post_date_gmt')) {
    throw new Error('post_date_gmt is required');
  }
  if (!rawPost.hasOwnProperty('post_modified_gmt')) {
    throw new Error('post_modified_gmt is required');
  }

  if (typeof rawPost.post_title !== 'string') {
    throw new Error('post_title must be string');
  }
  if (typeof rawPost.post_url !== 'string') {
    throw new Error('post_url must be string');
  }
  if (typeof rawPost.post_date_gmt !== 'string') {
    throw new Error('post_date_gmt must be string');
  }
  if (typeof rawPost.post_modified_gmt !== 'string') {
    throw new Error('post_modified_gmt must be string');
  }

  this.title = entities.decode(rawPost.post_title);
  this.url = rawPost.post_url;

  this.created = moment.utc(rawPost.post_date_gmt, 'YYYY-MM-DD HH:mm:ss');
  this.updated = moment.utc(rawPost.post_modified_gmt, 'YYYY-MM-DD HH:mm:ss');

  this.isNew = !this.updated.isAfter(this.created);
}

Post.prototype.toString = function() {
  return this.title + ' ' + this.url;
};

exports.Post = Post;
