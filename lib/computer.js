const {fork} = require('child_process')
const path = require('path')
const os = require('os')

const {objectToError} = require('error-utils')
const {ComputerError} = require('./errors')

const childProcessFilepath = path.resolve(__dirname, './child-process')

module.exports = class Computer {
  static launch (...args) {
    const computer = new Computer(...args)
    computer.start()
    return computer
  }

  constructor (computationsFilepath, processesCount = os.cpus().length) {
    this._computationsFilepath = computationsFilepath
    this._processesCount = processesCount
    this._started = false
  }

  start () {
    if (this._started === false) {
      this._tasks = [] // item: [name, args, resolve, reject]
      this._callbacks = {} // {key: processIndex, value: [resolve, reject]}
      this._availableProcessIndexes = Array.from({length: this._processesCount}, (x, i) => i)
      this._initProcesses()
      this._started = true
    }
  }

  stop () {
    if (this._started === true) {
      this._started = false
      this._processes.forEach(process => process.kill())
      this._tasks = null
      this._callbacks = null
      this._availableProcessIndexes = null
      this._processes = null
    }
  }

  compute (name, ...args) {
    if (this._started !== true) throw new ComputerError('Computer is not started')
    return new Promise((resolve, reject) => {
      this._tasks.push([name, args, resolve, reject])
      this._tryHandleNextTask()
    })
  }

  _initProcesses () {
    this._processes = forkMany(childProcessFilepath, [this._computationsFilepath], this._processesCount)
    this._processes.forEach((process, index) => process.on('message', ([errorInfo, result]) => {
      const [resolve, reject] = this._callbacks[index]
      if (errorInfo) {
        const [rawError, converted] = errorInfo
        const error = converted ? objectToError(rawError) : rawError
        reject(error)
      }
      else {
        resolve(result)
      }
      this._callbacks[index] = undefined
      this._availableProcessIndexes.push(index)
      this._tryHandleNextTask()
    }))
  }

  _tryHandleNextTask () {
    if (this._availableProcessIndexes.length > 0 && this._tasks.length > 0) {
      const processIndex = this._availableProcessIndexes.shift()
      const [name, args, resolve, reject] = this._tasks.shift()
      this._callbacks[processIndex] = [resolve, reject]
      this._processes[processIndex].send([name, args])
    }
  }
}

function forkMany (filepath, args, count) {
  const processes = []
  for (let i = 0; i < count; i++) {
    processes.push(fork(filepath, args))
  }
  return processes
}
