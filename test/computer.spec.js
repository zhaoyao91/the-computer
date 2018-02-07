const path = require('path')
const _ = require('lodash')

const Computer = require('../index')

const computationsFilepath = path.resolve(__dirname, './computations')

describe('Computer', function () {
  describe('compute', function () {
    it('should add numbers correctly', async function () {
      const cases = [
        [1, 2, 3],
        [3, 4, 7],
        [5, 6, 11],
        [7, 8, 15],
        [9, 10, 19]
      ]
      const params = cases.map(([a, b]) => [a, b])
      const answers = cases.map(([a, b, answer]) => answer)
      const computer = Computer.launch(computationsFilepath)
      const promises = params.map((args) => computer.compute('add', ...args))
      const results = await Promise.all(promises)
      expect(results).toEqual(answers)
      computer.stop()
    })

    it('should dispatch the tasks to different processes', async function () {
      const computer = Computer.launch(computationsFilepath)
      const promises = []
      for (let i = 0; i < 100; i++) {
        promises.push(computer.compute('pid'))
      }
      const results = await Promise.all(promises)
      const uniqueResults = _.uniq(results)
      expect(uniqueResults.length > 1).toBe(true)
      computer.stop()
    })
  })
})