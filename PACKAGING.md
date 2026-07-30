# Packaging Decision: ESM-Only

## Decision

`frame-link-react` ships as **ESM-only**. This is intentional and accepted for the current target audience.

## Rationale

- The package sets `"type": "module"` and uses `"exports" → "import"` only — no `"require"` condition.
- All known consumers are modern bundlers (Vite, esbuild, webpack 5) or Node ≥18 with native ESM support, all of which handle ESM without any shim.
- React itself (≥18) is distributed as both CJS and ESM, but React projects are overwhelmingly built with modern bundlers that resolve ESM. Shipping ESM-only is safe for this audience.
- ESM-only keeps the `dist/` tree small, avoids dual-format complexity, and eliminates CJS/ESM interop footguns.

## `files` Allowlist vs `.npmignore`

`package.json` uses an explicit `"files"` allowlist:

```json
"files": ["dist", "README.md", "LICENSE"]
```

This is preferred over `.npmignore` because an allowlist is additive and safe by default: only the declared paths are packed. A `.npmignore` denylist (which previously excluded `src/`, `*.tgz`, `yarn-error.log`, and `dist/tests`) requires continuous maintenance.

Note: the `dist/tests` exclusion that was previously in `.npmignore` is now handled automatically: `tsconfig.json` `include` only covers `src/**`, so `dist/tests` is never emitted by the build. The `files` allowlist then includes the entire `dist/` directory, which will only contain compiled output from `src/`.

Any existing `.npmignore` is kept purely as defense-in-depth.

## What Adding CJS Would Require

If a real CJS consumer appears and dual-format support is needed:

1. Add a second `tsc` compilation step (or use `tsup`/`rollup`) targeting CommonJS with `"module": "CommonJS"`.
2. Emit CJS output to `dist/cjs/` (e.g. `dist/cjs/index.cjs` + `dist/cjs/index.d.cts`).
3. Add a `"require"` condition to the `exports` map:
   ```json
   ".": {
     "types": "./dist/index.d.ts",
     "import": "./dist/index.js",
     "require": "./dist/cjs/index.cjs"
   }
   ```
4. Update the `"files"` allowlist if `dist/cjs` is a separate directory.
5. Add CI pack-verification for the new entry point.

## Revisit Trigger

Reopen the dual ESM/CJS question when: **a real CJS consumer files an issue or pull request** requesting it. Do not add CJS speculatively.

## Reference

This decision defers the "Ship dual ESM/CJS now" alternative described in initiative `FLINK-I-0001` (package-hygiene-and-ci). See that initiative's Alternatives section for the full trade-off analysis.
