var tap = require("tap")
var req = require("request")
var app = require("../")

var server = app.listen(30000)

tap.tearDown(server.close.bind(server))

tap.test("test valid url 1", function (t) {
  req("http://localhost:30000/", {
    qs: {
      url: 'http://mail.ru'
    },
    json: true
  }, function (err, response, body) {
    t.error(err)

    t.equal(response.statusCode, 200)
    t.type(body, "object")

    t.end()
  })
})

tap.test("test valid url 2", function (t) {
  req("http://localhost:30000/", {
    qs: {
      url: 'http://engadget.com'
    },
    json: true
  }, function (err, response, body) {
    t.error(err)
    t.equal(response.statusCode, 200)
    t.type(body, "object")

    t.ok(body.title, 'title is present')
    t.type(body.title, 'string')

    t.ok(body.description, 'description is present')
    t.type(body.description, 'string')

    t.ok(body.page_size, 'page_size is present')
    t.type(body.page_size, 'string')

    t.ok(body.resolved_url, 'resolved_url is present')
    t.type(body.resolved_url, 'string')

    t.end()
  })
})

tap.test("test invalid url", function (t) {
  req("http://localhost:30000/", {
    qs: {
      url: 'some invalid string'
    },
    json: true
  }, function (err, response, body) {
    t.error(err)
    t.equal(response.statusCode, 400)

    t.type(body, "object")
    t.equal(body.error, 'Unknown')
    t.equal(body.message, 'Unexpected error')

    t.end()
  })
})

tap.test("test invalid extension 1", function (t) {
  req("http://localhost:30000/", {
    qs: {
      url: 'http://image005.flaticon.com/teams/1-freepik.jpg'
    },
    json: true
  }, function (err, response, body) {
    t.error(err)
    t.equal(response.statusCode, 500)

    t.type(body, "object")
    t.equal(body.error, 'Mismatch')
    t.equal(body.message, 'Requested resource is not an HTML file.')

    t.end()
  })
})

tap.test("test invalid extension 2", function (t) {
  req("http://localhost:30000/", {
    qs: {
      // url: 'http://curl.haxx.se/curl.css'
      url: 'https://cow.ceng.metu.edu.tr/Templates/Default/styles.css'
    },
    json: true
  }, function (err, response, body) {
    t.error(err)
    t.equal(response.statusCode, 500)

    // t.type(body, "object")
    t.equal(body["error"], 'Mismatch')
    t.equal(body.message, 'Requested resource is not an HTML file.')

    t.end()
  })
})

tap.test("test 404 1", function (t) {
  req("http://localhost:30000/", {
    qs: {
      url: 'http://www.google.com/fjdklfjsakdlsfja'
    },
    json: true
  }, function (err, response, body) {
    t.error(err)
    t.equal(response.statusCode, 500)

    t.type(body, "object")
    t.equal(body.error, '404')
    t.equal(body.message, 'Page not found')

    t.end()
  })
})

tap.test("test 404 2", function (t) {
  req("http://localhost:30000/", {
    qs: {
      url: 'https://www.gdcinteriors.com/somefjskalfdsa'
    },
    json: true
  }, function (err, response, body) {
    t.error(err)
    t.equal(response.statusCode, 500)

    t.type(body, "object")
    t.ok( (body.error == '404' || body.error == 'Timeout') )

    t.end()
  })
})


tap.test("test TooLarge", function (t) {
  req("http://localhost:30000/", {
    qs: {
      url: 'https://images.unsplash.com/photo-1460500063983-994d4c27756c?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&s=27c2758e7f3aa5b8b3a4a1d1f1812310',
      img: true
    },
    json: true
  }, function (err, response, body) {
    t.error(err)
    t.equal(response.statusCode, 500)

    t.type(body, "object")
    t.equal(body.error, 'TooLarge')
    t.equal(body.message, 'Resource is too large to be parsed.')

    t.end()
  })
})

tap.test("test short timeout", function (t) {
  req("http://localhost:30000/", {
    qs: {
      url: 'http://www.mail.ru',
      timeout : 100
    },
    json: true
  }, function (err, response, body) {
    t.error(err)
    t.equal(response.statusCode, 500)

    t.type(body, "object")
    t.equal(body.error, 'Timeout')

    t.end()
  })
})


tap.test("test with custom selector", function (t) {
  req("http://localhost:30000/", {
    qs: {
      url: 'http://www.mail.ru',
      css_selector : 'img',
      _return : 'title',
    },
    json: true
  }, function (err, response, body) {
    t.error(err)
    t.equal(response.statusCode, 200)

    t.type(body, "object")
    t.equal((Array.isArray(body.custom) || typeof body.custom === 'string'), true)
    t.type(body.title, 'string')
    t.type(body.description, 'string')
    // necessary fields
    t.equal(body.status, 'ok')
    t.ok(body.page_size)
    t.ok(body.resolved_url)

    t.end()
  })
})


tap.test("test with custom selector and without defautl selectors", function (t) {
  req("http://localhost:30000/", {
    qs: {
      url: 'http://www.mail.ru',
      css_selector : 'img',
      _return : 'src',
      defaultSelectors : false
    },
    json: true
  }, function (err, response, body) {
    t.error(err)
    t.equal(response.statusCode, 200)

    t.type(body, "object")
    t.equal(Array.isArray(body.custom), true)
    t.type(body.title, 'undefined')
    t.type(body.desctiption, 'undefined')
    // necessary fields
    t.equal(body.status, 'ok')
    t.ok(body.page_size)
    t.ok(body.resolved_url)

    t.end()
  })
})

// Raw urls to test
// http://127.0.0.1:3000/?url=http://mail.ru&timeout=5000&followRedirects=10&maxDataSize=500
// http://127.0.0.1:3000/?url=http://mail.ru&timeout=5000&followRedirects=10&maxDataSize=500&defaultSelectors=false
// http://127.0.0.1:3000/?url=http://mail.ru&timeout=5000&followRedirects=10&maxDataSize=500&defaultSelectors=false&css_selector=img&_return=src
