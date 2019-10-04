
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
  

console.log(JSON.stringify(mapper(src, map)))

