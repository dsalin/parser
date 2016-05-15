'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _libParser = require('./lib/parser');

var _libParser2 = _interopRequireDefault(_libParser);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var app = (0, _express2['default'])();

app.get('/', function (req, res, next) {
  var options = {};
  var url = req.query.url;

  // fetch all possible options
  // Basic options
  options.followRedirects = parseInt(req.query.followRedirects, 10) || null;
  options.timeout = parseInt(req.query.timeout, 10) || null;
  options.maxDataSize = parseInt(req.query.maxDataSize, 10) || null;

  // Advanced options
  // Adds a selector, if present
  // or removes all the default selectors
  options.css_selector = req.query.css_selector || null;
  options._return = req.query._return || null;

  options.defaultSelectors = req.query.defaultSelectors || null;
  options.defaultSelectors = options.defaultSelectors && options.defaultSelectors === 'false' ? false : true;

  var metaParser = _libParser2['default'].create(options).expectResponseType('text/html');

  if (req.query.img) metaParser.expectResponseType('image');

  metaParser.fetch(url).then(function (data) {
    return res.json(data);
  })['catch'](function (err) {
    return next(err);
  });
});

app.use(function (err, req, res, next) {
  res.status(err.status || err.statusCode || 500).json(err);
});

exports['default'] = app;

if (require.main === module) {
  var port = process.env.PORT || 3000;
  console.log('Listening to http://127.0.0.1:' + port);
  app.listen(port);
}
module.exports = exports['default'];