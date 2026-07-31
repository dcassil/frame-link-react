/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular dependencies are not allowed in the source graph.",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "no-orphans",
      severity: "error",
      comment:
        "Orphan modules (no incoming or outgoing local edges) usually indicate dead code. Public entry barrels are exempt.",
      from: {
        orphan: true,
        pathNot: ["(^|/)src/index\\.ts$", "(^|/)index\\.ts$", "\\.d\\.ts$"],
      },
      to: {},
    },
    {
      name: "not-to-unresolvable",
      severity: "error",
      comment:
        "Local imports must be resolvable. External peers (frame-link, react, react-dom) are excluded.",
      from: {},
      to: {
        couldNotResolve: true,
        pathNot: "^(frame-link|react|react-dom)(/|$)",
      },
    },
    {
      name: "provider-not-to-hooks",
      severity: "error",
      comment:
        "Boundary: the provider layer must not depend on the hooks layer (hooks consume the provider, not vice versa).",
      from: { path: "^src/provider/" },
      to: { path: "^src/hooks/" },
    },
    {
      name: "provider-not-to-root",
      severity: "error",
      comment:
        "Boundary: the provider layer must not depend on the root barrel.",
      from: { path: "^src/provider/" },
      to: { path: "^src/index\\.ts$" },
    },
    {
      name: "hooks-not-to-root",
      severity: "error",
      comment: "Boundary: the hooks layer must not depend on the root barrel.",
      from: { path: "^src/hooks/" },
      to: { path: "^src/index\\.ts$" },
    },
    {
      name: "hooks-into-provider-via-entry",
      severity: "error",
      comment:
        "Boundary: cross-module imports from hooks into provider must go through the provider public entry (src/provider/index.ts), not its private internals.",
      from: { path: "^src/hooks/" },
      to: {
        path: "^src/provider/",
        pathNot: "^src/provider/index\\.ts$",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    exclude: {
      path: "(^|/)(__tests__|coverage|dist)(/|$)|\\.spec\\.(ts|tsx)$|\\.test\\.(ts|tsx)$",
    },
    tsPreCompilationDeps: true,
    moduleSystems: ["es6", "cjs"],
    reporterOptions: {
      text: {
        highlightFocused: true,
      },
    },
  },
};
