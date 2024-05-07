/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./test/set-env-for-test.js'],
  testMatch: ['<rootDir>/src/**/*.test.ts']
};