module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  testTimeout: 30000,
  transform: {
    '^.+\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json',
        diagnostics: true,
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};