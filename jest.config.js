module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['./src/index.js'],
  coverageDirectory: './coverage',
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 15,
      lines: 40,
      statements: 40,
    },
  },
  testMatch: ['**/test/**/*.[jt]s?(x)'],
  transform: {
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.js$': 'babel-jest',
  },
};
