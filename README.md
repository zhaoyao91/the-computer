# The Computer

Concurrent computations in node.js made easy.

## Introduction

We make software to instruct the computer to do 2 types of things: i/o and cpu computation.

Node.js is good at i/o things, but not good at cpu things due to the single thread computation mode for developers. But 
this does not mean node.js app cannot leverage the multiple cores of modern cpu. It provides the `child_process` package,
but it is too low level for us. We just want a easy way to make our computation functions run in multi-processes, as how 
the i/o functions do.

Now `The Computer` is here to help you out.

## Install

```
npm install --save the-computer
```

## Getting Started

First, create a file to hold the computations.

```ecmascript 6
// computations.js

module.exports = {
  add (a, b) {
    return a + b
  }
}
```

Then, in your main app, create a computer to handle the computation.

```ecmascript 6
// main.js

const Computer = require('the-computer')
const computationsFilepath = require('path').resolve(__dirname, './computations')

async function main() {
  const computer = Computer.launch(computationsFilepath)
  const result = await computer.compute('add', 1, 2)
  computer.stop()
  
  // result is 3
}
```

## API

### Computer

#### constructor

`(computationFilepath, processesCount?) => computer`

##### params

- computationFilepath - the filepath of the computations
- processesCount - the count of children processes. optional. the default value is `process.cpus.length`

#### start

`() => void`

Start the computer and spawn children processes. You should start the computer before calling `compute`.

#### stop

`() => void`

Stop the computer and destroy all children processes.

#### compute

`async (name, ...args) => result`

Do some computation.

##### params

- name - the computation name which is defined in the computations file
- args - the computation args which is defined in the computations file

#### static launch

`(...args) => computer`

Create a computer and start it.

##### params

- args - the same with that of constructor

## Reference Benchmark

Preset:

- MacBook Pro
  - 2.3 GHz Intel Core i5
  - 16 GB 2133 MHz LPDDR3
- 100 passwords
- using `bcrypt` package
- round is 10

Result:

- hashSync: about 6.7s
- hash (async): about 1.7s
- computer of 4 processes with hashSync: about 1.9s
- computer of 4 processes with hash (async): about 1.9s 

## License

MIT