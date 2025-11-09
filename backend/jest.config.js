module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/', '/config/'],
    testMatch: ['**/__tests__/**/*.test.js'],
    collectCoverageFrom: [
        '**/*.js',
        '!**/node_modules/**',
        '!**/__tests__/**',
        '!**/coverage/**',
        '!jest.config.js',
        '!server.js'
    ],
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    testTimeout: 10000 // 10 seconds timeout for async operations
};

