import Parser from './lib/parser'

let firstParser  = Parser.create({ onlyHtml : true })

// Let's have multiple requests with different settings
let images = firstParser.setSettings({ timeLimit : 10000 })
  // .extendSelectors('p', { tag : 'p', _return : 'class'})
  .fetch('http://www.tcmb.gov.tr/kurlar/today.xml')

images.then(data => console.log(data))
  .catch(err => console.log(err))
