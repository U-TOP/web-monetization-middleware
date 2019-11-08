// const makePlugin = require('ilp-plugin')

// export class Plugins {
//   create () {
//     return makePlugin()
//   }
// }

import BtpPlugin from "ilp-plugin-btp";

export class Plugins {
  create (opts?) {
    const secret = require('crypto').randomBytes(16).toString('hex')
    const name = (opts && opts.name) || ''
    return  new BtpPlugin({ server: `btp+ws://${name}:${secret}@localhost:7768` })
  }
}
