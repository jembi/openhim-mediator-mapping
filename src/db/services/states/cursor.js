'use strict'

const StateModel = require('../../models/states')

exports.statesCursor = async (ctx) => {
  var cursor = StateModel.find().cursor().addCursorFlag('noCursorTimeout', true);
  console.log('=============cursorED=============')

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    console.log('=============cursorED=============')
    console.log(doc); // Prints documents one at a time
    console.log('=============cursorED=============')
    ctx.websocket.send(JSON.stringify(doc));
  }
  // for await (const doc of Person.find()) {
  //   console.log(doc); // Prints documents one at a time
  // }

  // cursor.on('data', function (doc) {
  //   // if (somethingHappened) {
  //   //   this.pause()

  //   //   var self = this
  //   //   return bakeSomePizza(function () {
  //   //     self.resume()
  //   //   })
  //   // }
  //   console.log('=============cursorED=============')
  //   console.log(doc)
  //   console.log('=============cursorED=============')

  //   // res.write(doc)
  // })

  cursor.on('error', function (err) {
    // handle err
    console.log('error....')
  })

  cursor.on('close', function () {
    // all done
    console.log('close ....')
  })


  setTimeout(() => {
    console.log('done')
  }, 20000)
}


