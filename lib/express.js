var debug = require('debug')('lolicon:lib:express');

var express = require('express');
var moment = require('moment');

var wordpress = require('./wordpress');

function router() {
  var r = express.Router();

  r.post('/wordpress', function(req, res, next) {
    var err;
    var post;

    try {
      post = new wordpress.Post(req.body);
    } catch(e) {
      debug(e.stack);

      err = new Error('invalid post');
      err.status = 400;
      return next(err);
    }

    if (!post.isNew) {
      return res.send({status: 'ok'});
    }

    var app = req.app;

    var lol = app.lolicon;

    lol.open(function(err, done) {
      if (err) {
        done();
        return next(err);
      }

      var chan = lol.discord.channels.filter(function(chan) {
        return chan.type === 'announcements';
      }).reduce(function(a, b) {
        if (a && a.type === 'announcements') {
          return a;
        }

        if (b && b.type === 'announcements') {
          return b;
        }

        return null;
      }, null);

      if (!chan) {
        err = new Error('no announce channel');
        done();
        return next(err);
      }

      return chan.send(post.toString(), function(err) {
        if (err) {
          next(err);
          return done();
        }

        res.send({status: 'ok'});

        return done();
      });
    });
  });

  r.post('/discord', function(req, res, next) {
    var data = req.body;
    /*
    {
      trigger: triggerName,
      channelId: msg.channel.id,
      messageId: msg.id,
      _message: msg,
    }
    */

    var triggerName = data.trigger;
    var channelId = data.channelId;
    var messageId = data.messageId;

    var id = channelId + '/' + messageId;

    var app = req.app;

    if (app.recent.exists(id)) {
      debug('Ignore request for ' + id);
      return res.send({status: 'ignore'});
    }

    debug('Accept request for ' + id);
    app.recent.put(id, true, 5*60*1000);

    var lol = app.lolicon;

    lol.dropbox.randomFile(triggerName, function(err, file) {
      if (err) {
        return next(err);
      }

      debug('Send file: ' + JSON.stringify(file));

      // TODO: move this to a `chan.send` call.
      file.getUrl(function(err, fileUrl) {
        if (err) {
          return callback(err);
        }

        lol.open(function(err, done) {
          if (err) {
            done();
            return next(err);
          }

          lol.discord.client.sendFile(channelId, fileUrl, file.name, function(err) {
            if (err) {
              next(err);
              return done();
            }

            res.send({status: 'ok'});

            return done();
          });
        });
      });

    });
  });

  return r;
}

exports.router = router;
