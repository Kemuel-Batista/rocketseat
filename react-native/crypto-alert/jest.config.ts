import type { Config } from "jest";

const config: Config = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest.setup.js"],
  coverageDirectory: "./__tests__/coverage",
  transformIgnorePatterns: [
    "node_modules/(?!(\\.pnpm|(jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@react-native-async-storage/)",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/utils/",
    "/__tests__/coverage/",
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "src/**/*.tsx",
    "!src/**/*.test.tsx",
    "!src/**/*.test.ts",
    "!src/**/*.styles.ts",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/utils/",
    "/__tests__/coverage/",
    "/__mocks__/"
  ],
  coverageReporters: [
    "json",
    "lcov",
    "html"
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
    "./src/services/": {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    }
  }
};

export default config;
