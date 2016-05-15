# Meta Parser
Small Node.js module for getting page Meta info.<br>
Moreover, other types of page content, such as custom selectors, are also supported. Please, refer to [Selectors](#selectors) section for more information.

## Table of contents

- [Basic Usage](#basic-usage)
- [Multiple Parsers (New)](#multiple-parsers)
- [Settings](#default-settings)
- [Selectors](#selectors)
- [Errors](#errors)
- [Updates](#updates)


## Basic Usage
Get the Meta contents of the given page with `default parameters`.<br>
**fetch** function returns a Promise object, so can easily be integrated with other promises.<br>
For list of default selectors, please refere to [Selectors](#selectors)

```js
let parser = require('./lib/parser').create()

// 'fetch' is a conveniece method, same as 'fetchpage'
parser.fetch('http://www.engadget.com/2015/08/21/psa-apple-will-replace-your-iphone-6-plus-wonky-camera/')
  // get data
  .then(data => {
     // your code on success
  })
  // catch errors
  .catch(err => {
      // error handler    
  })
```

Data will be given in the following format : 
```js
{ 
  description: 'Did you buy an iPhone 6 Plus sometime between last September and this January? Do you notice that your shots taken with its back camera come out all blurry? Yea...',
  title: 'PSA: Apple will replace your iPhone 6 Plus\' wonky camera',
  image: 'http://o.aolcdn.com/dims-global/dims/GLOB/5/600/315/http://o.aolcdn.com/dims-shared/dims3/GLOB/crop/3000x2000+0+0/resize/1200x800!/format/jpg/quality/85/http://hss-prod.hss.aol.com/hss/storage/midas/af3727a2dc92fc2d97ca9cd3f4b0510/200834435/456125652.jpg',
  url: 'http:///2015/08/21/psa-apple-will-replace-your-iphone-6-plus-wonky-camera/',
  site_name: 'Engadget',
  locale: 'en_US',
  site: '@engadget',
  creator: '@terrortola',
  page_size: '~286kb',
  resolved_url: 'http://www.engadget.com/2015/08/21/psa-apple-will-replace-your-iphone-6-plus-wonky-camera/' 
}
```

`Parser` constructor takes an optional `options` argument, which can contain two settings : `defaultSelectors` and
`onlyHtml`. If the first option is set to `false`, default meta selectors will not be used and, as a result, default
meta content will not be fetched. The second option specified whether only the page `html` content should be returned or
not. Note that along with html page stats like `page_size` and `resolved_url` are also returned.

## Multiple Parsers
The coolest thing about the `Meta Parser` is that it supports multiple `Parser` objects.

This means that you can create different parsers for different tasks, and 
wait for them altogether.

```js
let Parser  = require('./lib/parser')
  , Promise = require('bluebird')

// construct Parsers without any default selectors
let firstParser  = Parser.create({ selectors : false })
  , secondParser = Parser.create({ selectors : false })

// Let's have multiple requests with different settings
let images = firstParser.setSettings({ timeLimit : 10000 })
                        .fetch('http://mail.ru')
    // get all 'p' tags' content
  , page_text = secondParser.extendSelectors('page_text', 'p') 
                            .setSettings({ timeLimit : 3000 })
                            .fetch('https://www.npmjs.com/package/rsvp')

// wait for both requests to complete
Promise.settle([ images, page_text ])
  // get data
  .then(results => {
    // check response
    if ( results[0].isFulfilled() ) {
      console.log(results[0].value())
    }
    else console.log("Error on retrieving images")

    if ( results[1].isFulfilled() ) 
      console.log(results[1].value())
    else console.log("Error on fetching page text")
  })
  // handle errors
  .catch(err => console.log(err))
```


## Default Settings

Default settings object and Default request params for the module look like this :
```js
const SETTINGS = {
  // maximum response size (in kb)
  maxDataSize : MAX_DATA_SIZE_DEFAULT, (300kb) 
  timeLimit   : TIME_LIMIT_DEFAULT (3000ms)
}

const REQUEST_DEFAULTS = {
  timeout : TIME_LIMIT_DEFAULT,
  method  : 'GET',
  encoding : 'utf8'
}
```

### Set Settings 

Adjusting `Settings` is very easy and can be chained before making any requests.

**IMPORTANT:** after changing a setting with functions described below it becomes global
for all future requests and should be reset back if necessary.

**Note:** a change in this strategy can be done.

Method : **setSettings(_settings_)**

```js
parser.setSettings({ timeLimit : 2000, maxDataSize : 300 })
  .fetch('http://google.com')
  ...
```
Here, **fetch** is only a convinience method for chaining, it does not have any
special functionality.

For changing `Default Request` settings **setRequestDefaults** method is provided.

Method : **setRequestDefaults(_settings_)**

**Note:** `settings` object can contain any parameters that are valid for passing to
**request** function, which belongs to [request](https://github.com/request/request) modile.

```js
parser.setRequestDefaults({ timeout : 2000 })
  .fetch('http://google.com')
  ...
```

**Important** thing to be noted here is that `timeLimit` in `SETTINGS` and 
`timeout` in `REQUEST_DEFAULTS` are interdependent, so that
`timeout` shall not be bigger than `timeLimit`, because `timeLimit` 
represents the timing for the whole `request-parse-return` process, 
when `timeout` is only responsible for `request` part.

That is to say, following rule is applied when setting either `timeLimit` or `timeout` :

    - If `timeout` > `timeLimit` => set `timeLimit` = new `timeout` value
    - If `timeLimit` < `timeout` => set `timeout` = new `timeLimit` value
    - If `timeout` < `timeLimit` => all fine, just set values

### Remove Settings 

Remove settings is also easy and can be chained, just use `removeSetting` function.

**removeSetting** takes one param : single string of setting name.

**Note:** `maxDataSize` and `timeLimit` should not be removed.

The same applies to `removeRequestDefaults` function.

**Note:** `timeout` should not be removed

```js
// remove setting
parser.removeSettings('myCount')
  .fetch('http://google.com')
  ...

// remove request setting
parser.removeRequestDefaults('encoding')
  .fetch('http://google.com')
  ...
```

### Reset Settings 

If you want to bring all of the `Parser` settings to its `default` state and remove all 
unnecessary settings, functions `resetSettings` and `resetRequestDefaults` should be used.

They do not take any parameters and can be chained.

```js
// reset setting
parser.setSettings({ setting : 'some_str' })
  .resetSettings() // will reset required settings and remove `setting`
  .fetch('http://google.com')
  ...

// remove request setting
parser.setRequestDefaults({ encoding : 'windows-1251', my_setting : 'some_str' })
  .resetRequestDefaults() // will reset `encoding` and remove `my_setting`
  .fetch('http://google.com')
  ...
```


## Selectors

Selectors is a neat part about this module.
By default, the folliwing selectors are applied to fetch page info :

### Meta Selectors

Meta selectors get information only from `<head>` `meta` tags and usually used by search engines.
`<meta content="..." property="...">`

1. Facebook `OpenGraph`
    * Title : `og:title`
    * Description : `og:description`
    * Image : `og:image`
    * URL : `og:url`
    * Site Name : `og:site_name`
    * Locale : `og:locale`
    
2. Twitter
    * Title : `twitter:title`
    * Description : `twitter:description`
    * Image : `twitter:image` and `twitter:image:src`
    * URL : `twitter:url`
    * Site : `twitter:site`
    * Creator : `twitter:creator`

3. General Meta
    * Description : `description`
    * Image : `image`
    * URL : `url`
    * Keywords : `keywords`


### General Selectors

General selectors are selectors of any type, meaning that you can provide any valid CSS selector for the element you want to find in the page and it will be applied. However, there's a limitation for the type of info you can get.

By `default`, if no specific `_return` value provided, the `text` of the selected element will be returned.

Therefore, if you write
```js
parser.extendSelectors('page_divs', 'div')
  .fetch('...some url here....')
  // get data
  .then(data => {
     // your code on success
  })
  // catch errors
  .catch(err => {
      // error handler    
  })
```

It is totally probable that return value will be a **MESS**.

That is said, choose elements with text inside, like `<p>`, for example, **or** provide a valid attribute name, so that attribute content will be returned instead of element's text.

The only default **General Selector** is `title`, which simply extracts the text inside `<title></title>` tag.


### Creating Selectors

Most of the time, the default selectors may work fine, but it is easy to create your own if needed. <br>
To create a selector and add it to the selectors collection, call **`extendSelectors`** method before making request.

**`extendSelectors`** takes two arguements : `selector_display_name` and `css_selector` string.<br>
`selector_display_name` is used in the final info object to distinguish custom and default selectors.

**Note**: if selectors' names collide, the first found content will be used, which means that, if we had two 
selectors with the same name, code will take the first selector and try to fetch its content.<br>
So, using unique names for selectors is advised.

Second argument `css_selector` is just a valid CSS selector for the elements on the page.
Second argument can be also a `options` object, that can contain the following params : 

```js
// options obj example
const options = {
  tag     : 'div',
  class   : 'product item',
  id      : 'product-51',
  attr    : { 'data-category' : 'sofas', 'data-price' : '100'},
  _return : 'text'
}
```
In this case **extendSelectors('products', options)** will generate this array of selectors :

**Note:** Some adjustments for the attributes combining will be done soon.

```js
// a part of the Selector Obj
cssSelectors:
   [ 'div#product-51.product.item[data-category="sofas"]',
     'div#product-51.product.item[data-price="100"]' ]
```

In addition, separate result arrays will be returned for this two selectors :

```js
{ 
  description: 'Did you buy an iPhone 6 Plus ...',
  title: 'PSA: Apple will replace your iPhone 6 Plus\' wonky camera',
  image: '...some src...', // from meta tags
  url: '...',
  site_name: '...',
  products_0: [ ... product selector 1 items here .... ],
  products_1: [ ... product selector 2 items here .... ],
  page_size: '~283kb',
  resolved_url: 'http://www.engadget.com/2015/08/21/psa-apple-will-replace-your-iphone-6-plus-wonky-camera/' 
}
```
So, to create custom `Selector` and use it in your requests, just do :

```js
parser.extendSelectors('images', { tag : 'img', _return : 'src' })
  .fetch('...some url here....')
  ...
```

And returned info may look like : 

```js
{ 
  description: 'Did you buy an iPhone 6 Plus ...',
  title: 'PSA: Apple will replace your iPhone 6 Plus\' wonky camera',
  image: '...some src...', // from meta tags
  url: 'http:///2015/08/21/psa-apple-will-replace-your-iphone-6-plus-wonky-camera/',
  site_name: 'Engadget',
  locale: 'en_US',
  site: '@engadget',
  creator: '@terrortola',

  // images' src you selected
  images:
   [ 'http://www.blogsmithmedia.com/www.engadget.com/media/default-avatar-us.png',
     'http://media.gdgt.com/assets/img/site/blank-user-25.gif',
     'http://o.aolcdn.com/dims-shared/dims3/GLOB/crop/3000x2000+0+0/resize/1200x800!/format/jpg/quality/85/http://hss-prod.hss.aol.com/hss/storage/midas/af3727a2dc92fc2d97ca9cd3f4b0510/200834435/456125652.jpg',
     'http://o.aolcdn.com/dims-global/dims/GLOB/5/24/24/http://www.blogcdn.com/www.engadget.com/media/2015/03/imag0392.jpg',
     'http://o.aolcdn.com/dims-shared/dims3/GLOB/crop/3000x2000+0+0/resize/1200x800!/format/jpg/quality/85/http://hss-prod.hss.aol.com/hss/storage/midas/af3727a2dc92fc2d97ca9cd3f4b0510/200834435/456125652.jpg',
     'http://www.blogsmithmedia.com/www.engadget.com/media/compare-module.jpg' ],

  page_size: '~283kb',
  resolved_url: 'http://www.engadget.com/2015/08/21/psa-apple-will-replace-your-iphone-6-plus-wonky-camera/' 
}
```

In case data is not found on the page, an empty array will be returned.

You can also create `Meta` selectors, which is even easier than `General` selectors.

```js
const options = {
  _property    : 'name', // the meta attr name
  description : 'twitter:description',
  title       : 'twitter:title',
  image       : ['twitter:image', 'twitter:image:src']
}

parser.extendSelectors('some_meta', options)
  .fetch('...some url here....')
  ...

// Will generate the followind selectors
cssSelectors : 
    [ { description: 'meta[name="twitter:description"]' },
      { title: 'meta[name="twitter:title"]' },
      { image: 'meta[name="twitter:image"]' },
      { image: 'meta[name="twitter:image:src"]' } ]

// and only if the first image selector does not succeed, 
// the second selector is applied
```

## Errors 
There are 5 types of errors the module can return :

**1. `TooLarge`** - thrown when the `maxDataSize` limit is exceeded.<br>
    Format : (obj notation)

```js
  { 
    error   : 'TooLarge', 
    message : 'Resource is too large to be parsed.' 
  }
```

**2. `Timeout`** - thrown when the `timeLimit` (the whole task execution limit) or `timeout` (server response time limit) is exceeded.

    Format : (obj notation)

```js
  { 
    error   : 'Timeout', 
    message : 'Request timed out to origin server.' 
  }
```

**3. `Mismatch`** - thrown when the return `content-type` is not a `text/html`.

    Format : (obj notation)

```js
  { 
    error   : 'Mismatch', 
    message : 'Requested resource is not an HTML file.' 
  }
```

**4. `_404`** - thrown when the requested page is not found.

    Format : (obj notation)

```js
  { 
    error   : '404', 
    message : 'Page not found' 
  }
```
**5. `Unknown`** - thrown when the response status is **403** or something unexpected has happened.

    Format : (obj notation)

```js
  { 
    error   : 'Unknown', 
    message : 'Unexpected error' 
  }
```
## Updates 
This section includes short desciption of already existing updates that will be documented in more details as soon as possible.
For now, please, refer to implementation.

- Now it is possible to set the expected return type of the request and fire an error if it doesn't match.<br>
In addition, more than one expected return type may be set. If this is the case, the response type must be **one of** the expected types.<br>
For this, **expectResponseType** and **expectResponseTypeOnce** are used.

```js
let parser = require('./lib/parser').create()

parser.expectResponseType('image')
  .fetch('url')
  .then(data => {
    // your handler
  })
```
```js
let parser = require('./lib/parser').create()

// The expected response type array will be refreshed after this request
parser.expectResponseTypeOnce('text/css')
  .fetch('url')
  .then(data => {
    // your handler
  })
```
