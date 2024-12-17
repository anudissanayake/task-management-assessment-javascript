export default {
    // preset: 'jest',
    testEnvironment: 'node',
    transform: {},
    // moduleFileExtensions: ['js'],
    verbose: true,
    testMatch: ['**/tests/unit/?(*.)+(spec|test).js'],
    collectCoverage: true,
    collectCoverageFrom: [
      "src/controllers/TaskController.js",
      "src/services/UserExternalApiService.js"
    ],
  };