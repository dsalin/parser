import express from 'express'
import Parser from './lib/parser'
import request from 'request'

const app = express()

app.get('/', (req, res, next) => {
  let options = {}
  let url = req.query.url

  // fetch all possible options
  // Basic options
  options.followRedirects = parseInt(req.query.followRedirects, 10) || null
  options.timeout         = parseInt(req.query.timeout, 10)         || null
  options.maxDataSize     = parseInt(req.query.maxDataSize, 10)     || null

  // Advanced options
  // Adds a selector, if present
  // or removes all the default selectors
  options.css_selector = req.query.css_selector || null
  options._return      = req.query._return      || null

  options.defaultSelectors = req.query.defaultSelectors || null
  options.defaultSelectors = ( options.defaultSelectors && 
                               options.defaultSelectors === 'false' )
                            ? false : true

  let metaParser = Parser.create(options).expectResponseType('text/html')
  
  if ( req.query.img )
    metaParser.expectResponseType('image')

  metaParser.fetch(url)
    .then(data => res.json(data))
    .catch(err => next(err))
})

app.use((err, req, res, next) => {
  res.status(err.status || err.statusCode || 500).json(err)
})

export default app

if (require.main === module) {
  const port = process.env.PORT || 3000
  console.log(`Listening to http://127.0.0.1:${port}`)
  app.listen(port)
}
