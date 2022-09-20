const path = require('path')
const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')

module.exports = {
  clearMocks: true,
  preset: 'ts-jest',
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: path.join(__dirname) })
  },
  testEnvironment: 'node',
  testRegex: 'spec/.*\\.spec\\.ts$'
}
