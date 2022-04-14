module.exports = {
	preset: 'jest-puppeteer',
	testMatch: ["**/?(*.)+(spec|test).[t]s"],
	testPathIgnorePatterns: ['/node_modules/', 'dist'],
	transform: {
		"^.+\\.ts?$": "ts-jest",
  },
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    "^tslib$": "tslib/modules"
  },
};