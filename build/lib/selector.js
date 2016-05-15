'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = Selector;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

/*
* Constructor func for individual selectors
*
* @param {string} name
*   Metadata group name
*   Will be used later for group property deletion and modification
*
* @param {obj/string} properties
*   Metadata group properties (title, description, etc.)
*   Or a css selector string
*   Format : ( '?' - optional, '!' - must ) 
*   {
*     // 1st option
*     tag   : ?(string) - html tag name,
*     attr  : ?(obj {name:value}] - tag attribute,
*     class : ?(string) - classname,
*     id    : ?(string) - element id,
*     // 2nd option
*     css_selector : ?(string) - instead of all the above,
*                    just a valid CSS selector string you 
*                    normally use with jQuery,
*     // required for every request
*     _return : ?(string) - what data to return
*               can be a tag attribute name or 'text' - tag content
*               (default - 'text')
*   }
*   Note: either a css_selector or an info piece from
*         the 1st option need to be present.
*
* @constructor
*/

function Selector(name, options) {
  var opt = undefined;

  this.name = name;
  this.type = 'GENERAL';
  this._return = options._return || 'text';

  if (!name || !_underscore2['default'].isObject(options) && !_underscore2['default'].isString(options)) throw new Error('Selector: Invalid data passed.');

  // CSS selector supplied
  if (_underscore2['default'].isObject(options) && options.css_selector) this.cssSelector = options.css_selector;else if (_underscore2['default'].isString(options)) this.cssSelector = options;else {
    this.options = {};
    this.options.tag = options.tag || null;
    this.options['class'] = options['class'] || null;
    this.options.id = options.id || null;
    this.options.attr = options.attr || null;

    // check for sufficient data
    opt = this.options;
    if (!opt.tag && !opt.attr && !opt['class'] && !opt.id && !this.cssSelector) throw new Error('Selector: No data passed.');
  }

  this.cssSelectors = this.cssSelector || this.buildSelectorStr();
  delete this.options;
}

Selector.prototype.isMeta = function () {
  return this.type === 'META';
};

Selector.prototype.getClassSelectorStr = function () {
  return this.options['class'] ? '.' + this.options['class'].split(/\s+/).join('.') : '';
};

Selector.prototype.getIdSelectorStr = function () {
  return this.options.id ? '#' + this.options.id : '';
};

Selector.prototype.buildSelectorStr = function () {
  var self = this;
  var selector = '',
      options = self.options,
      attributes = [],
      tmp = undefined,
      key = undefined;

  // class and id selectors, if present
  var classStr = self.getClassSelectorStr(),
      idStr = self.getIdSelectorStr();

  if (options.tag) selector += options.tag;

  selector += idStr + classStr;

  // add attributes if exist
  if (options.attr) {
    for (var prop in options.attr) {
      if (!options.attr[prop]) tmp = '[' + prop + ']';else tmp = '[' + prop + '="' + options.attr[prop] + '"]';

      attributes.push(selector + tmp);
    }
    selector = attributes;
  }

  return selector;
};

/* 
 * Special selector for meta data extraction
 * Supported multiple value retrieval, i.e 
 * multiple value within the same tag attr but with different values
 *
 * @param {string} name
 *   Selector group name. Used for future extending/modification
 *
 * @param {obj} attributes
 *   Attributes object
 *   Format : 
 *   {
 *     // name of the info piece that is 
 *     // displayed in the final result JSON object
 *     info_display_name : 'title' (e.g),
 *     ...
 *   }
 *
 * @constructor
*/
Selector.Meta = function (name, attributes) {
  if (!attributes || !name) throw new Error('Selector.Meta: No info passed');

  this.name = name;
  this._return = 'content';
  this.type = 'META';

  // defaults for meta info
  this.options = {};
  this.options.tag = 'meta';
  this.options['class'] = null;
  this.options.id = null;
  this.options.attr = attributes;

  this.cssSelectors = this.buildSelectorStr();
  delete this.options;
};

_util2['default'].inherits(Selector.Meta, Selector);

Selector.Meta.prototype.buildSelectorStr = function () {
  var self = this;

  var _property = self.options.attr._property,
      options = self.options,
      selector = self.options.tag,
      tmp = '',
      selectors = [],
      obj = {};

  delete self.options.attr._property;

  for (var prop in options.attr) {
    obj = {};
    // multiple selectors for the same info
    if (_underscore2['default'].isArray(options.attr[prop])) {
      _underscore2['default'].each(options.attr[prop], function (val) {
        obj = {};
        tmp = selector + '[' + _property + '=' + '"' + val + '"]';
        obj[prop] = tmp;
        selectors.push(obj);
      });
    } else {
      tmp = selector + '[' + _property + '="' + options.attr[prop] + '"]';
      obj[prop] = tmp;
      selectors.push(obj);
    }
  } // for end

  return selectors;
};

/*
* DOM selectors for fetching metadata
* Format: 
*   // appears in resulting object as
*   // name of the concrete piece of info
*   data-name : {
*     // in what property of a tag to search in
*     _property : 'property-name', (string)
*     // the value inside property field ( 1 or more) 
*     prop-value : 'prop-value-name', (string)
*   }
*/
var defaultSelectors = {
  // General selector
  pageTitle: {
    tag: 'title',
    _return: 'text'
  },
  // META selectors
  og: {
    _property: 'property',
    description: 'og:description',
    title: 'og:title',
    image: 'og:image',
    url: 'og:url',
    site_name: 'og:site_name',
    locale: 'og:locale'
  },
  twitter: {
    _property: 'name',
    description: 'twitter:description',
    title: 'twitter:title',
    image: ['twitter:image', 'twitter:image:src'],
    url: 'twitter:url',
    site: 'twitter:site',
    creator: 'twitter:creator'
  },
  general: {
    _property: 'name',
    description: 'description',
    image: 'image',
    url: 'url',
    keywords: 'keywords'
  },
  lang: {
    tag: 'html',
    _return: 'lang'
  },
  image: {
    _property: 'itemprop',
    image: 'image'
  }
};

// Note: Order is important
Selector.DEFAULT = [new Selector.Meta('og', defaultSelectors.og), new Selector.Meta('twitter', defaultSelectors.twitter), new Selector.Meta('general', defaultSelectors.general), new Selector('title', defaultSelectors.pageTitle), new Selector('lang', defaultSelectors.lang), new Selector.Meta('image', defaultSelectors.image)];
module.exports = exports['default'];