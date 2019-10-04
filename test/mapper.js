
const tap = require('tap')
const mapper = require('../src/mapper')

const src = {
  "sku": "12345",
  "upc": "99999912345X",
  "title": "Test Item",
  "description": "Description of test item",
  "length": 5,
  "width": 2,
  "height": 8,
  "inventory": {
    "onHandQty": 12
  }
}
     
const map = {
  "sku": "Envelope.Request.Item.SKU",
  "upc": "Envelope.Request.Item.UPC",
  "title": "Envelope.Request.Item.ShortTitle",
  "description": "Envelope.Request.Item.ShortDescription",
  "length": "Envelope.Request.Item.Dimensions.Length",
  "width": "Envelope.Request.Item.Dimensions.Width",
  "height": "Envelope.Request.Item.Dimensions.Height",
  "inventory.onHandQty": "Envelope.Request.Item.Inventory"
}
  
const expected = '{"Envelope":{"Request":{"Item":{"SKU":"12345","UPC":"99999912345X","ShortTitle":"Test Item","ShortDescription":"Description of test item","Dimensions":{"Length":5,"Width":2,"Height":8},"Inventory":12}}}}'

tap.equal(expected, JSON.stringify(mapper(src, map)))

