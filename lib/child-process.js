const {errorToObject} = require('error-utils')

const filepath = process.argv[2] // file path of computations
const computations = require(filepath)

process.on('message', async ([name, args]) => {
  try {
    const result = await computations[name](...args)
    process.send([null, result])
  }
  catch (err) {
    const shouldConvert = err instanceof Error
    err = shouldConvert ? errorToObject(err) : err
    process.send([[err, shouldConvert]])
  }
})