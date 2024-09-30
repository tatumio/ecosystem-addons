module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  transformIgnorePatterns: ['node_modules/(?!(@web3-name-sdk/core)/)'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
}

