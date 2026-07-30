/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are not allowed in the source graph.',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'not-to-unresolvable',
      severity: 'error',
      comment: 'Local imports must be resolvable. External peers (frame-link, react, react-dom) are excluded.',
      from: {},
      to: {
        couldNotResolve: true,
        // Exclude known peer dependencies from unresolvable checks.
        // They live in node_modules and resolve fine at runtime; dependency-cruiser
        // should not flag them even if the physical package path differs.
        pathNot: '^(frame-link|react|react-dom)(/|$)',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    exclude: {
      path: '(^|/)(__tests__|coverage|dist)(/|$)|\\.spec\\.(ts|tsx)$|\\.test\\.(ts|tsx)$',
    },
    tsPreCompilationDeps: false,
    moduleSystems: ['es6', 'cjs'],
    reporterOptions: {
      text: {
        highlightFocused: true,
      },
    },
  },
};
