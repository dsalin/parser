'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libParser = require('./lib/parser');

var _libParser2 = _interopRequireDefault(_libParser);

var firstParser = _libParser2['default'].create({ onlyHtml: true });

// Let's have multiple requests with different settings
var images = firstParser.setSettings({ timeLimit: 10000 })
// .extendSelectors('p', { tag : 'p', _return : 'class'})
.fetch('http://www.tcmb.gov.tr/kurlar/today.xml');

images.then(function (data) {
  return console.log(data);
})['catch'](function (err) {
  return console.log(err);
});