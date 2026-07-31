const fs = require('fs');
const path = require('path');

// Resolve the published `frame-link` package's ESM entry point directly on disk.
// The package is ESM-only and exposes just its `.` entry via `exports`, so
// require.resolve('frame-link'), require('frame-link/package.json'), and
// require.resolve('frame-link/dist/index.js') all throw under this CommonJS jest
// config (Node's exports gate blocks the deep path and the CJS main). We instead
// walk node_modules to the package directory and point at the built dist entry
// (dist/index.js), then let babel-jest transform its ESM — and its nested `.js`
// relative imports — down to CommonJS for the test run.
function findFrameLinkEntry(startDir) {
  let dir = startDir;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = path.join(dir, 'node_modules', 'frame-link', 'dist', 'index.js');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error('Could not locate frame-link/dist/index.js in node_modules');
    }
    dir = parent;
  }
}
const frameLinkEntry = findFrameLinkEntry(__dirname);

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts', '**/__tests__/**/*.spec.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: false,
      tsconfig: {
        module: 'CommonJS',
        moduleResolution: 'node',
        verbatimModuleSyntax: false,
        importHelpers: false,
        jsx: 'react-jsx',
      },
    }],
    '^.+\\.jsx?$': ['babel-jest', {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    }],
  },
  // Do NOT ignore the frame-link package during transform: it ships ESM only and
  // must be transpiled to CommonJS by babel-jest. Under pnpm the package lives at
  // node_modules/.pnpm/frame-link@x/node_modules/frame-link, so the negative
  // lookahead has to permit that nested path too.
  transformIgnorePatterns: ['/node_modules/(?!(\\.pnpm/)?frame-link)'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^frame-link$': frameLinkEntry,
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
