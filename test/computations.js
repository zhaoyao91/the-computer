module.exports = {
  // return the sum of a and b
  add (a, b) {
    return a + b
  },

  // return the process.pid after a random time
  pid () {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(process.pid), Math.random() * 10)
    })
  }
}