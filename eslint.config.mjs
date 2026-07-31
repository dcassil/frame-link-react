import js from "@eslint/js";
import comments from "@eslint-community/eslint-plugin-eslint-comments";
import prettier from "eslint-config-prettier";
import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

/**
 * Guard-rails ESLint flat config for frame-link-react.
 *
 * Module boundaries:
 *  - `root`     : src/index.ts    (public package barrel)
 *  - `provider` : src/provider/** (React context + FrameLink lifecycle)
 *  - `hooks`    : src/hooks/**    (public hooks over the provider context)
 *
 * `frame-link`, `react`, and `react-dom` are external peer dependencies and are
 * allowed everywhere. Internal layering: hooks may depend on provider (through its
 * public entry), root may depend on both. No cycles; cross-module imports must go
 * through a module's public entry (index).
 */
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "examples/**",
      "*.config.js",
      "*.config.cjs",
      "*.config.mjs",
      "*.config.ts",
      ".dependency-cruiser.cjs",
      "babel.config.js",
      "jest.config.cjs",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  prettier,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@eslint-community/eslint-comments": comments,
      boundaries,
      import: importPlugin,
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
      },
      // Element descriptors are always folder-oriented in v7. `provider` and
      // `hooks` are listed first with `stopMatching` so their files classify as
      // those elements; anything else under `src` (i.e. the `src/index.ts`
      // package barrel) falls through to `root`. This avoids pointing an element
      // descriptor at a single `.ts` file (which v7 flags as a file-pattern).
      "boundaries/elements": [
        { type: "provider", pattern: "src/provider", stopMatching: true },
        { type: "hooks", pattern: "src/hooks", stopMatching: true },
        { type: "root", pattern: "src" },
      ],
      "boundaries/ignore": ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**"],
      // Migration to v7 is complete (canonical `dependencies` rule, no legacy
      // rule names, no deprecated `mode`/`entry-point`/`no-private`). Disable
      // legacy-syntax detection now that migration is done.
      "boundaries/legacy-warnings": false,
    },
    rules: {
      // React
      ...react.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",

      // ── Type safety ──────────────────────────────────────────────────────
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-enum-comparison": "error",
      "@typescript-eslint/no-unsafe-unary-minus": "error",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",

      // ── Explicit types ───────────────────────────────────────────────────
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: false,
        },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/typedef": [
        "error",
        {
          arrayDestructuring: false,
          arrowParameter: true,
          memberVariableDeclaration: true,
          objectDestructuring: false,
          parameter: true,
          propertyDeclaration: true,
          variableDeclaration: false,
          variableDeclarationIgnoreFunction: true,
        },
      ],

      // ── Strict boolean & null ────────────────────────────────────────────
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
          allowNullableBoolean: false,
          allowNullableString: false,
          allowNullableNumber: false,
          allowNullableEnum: false,
          allowAny: false,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
      "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        { allowConstantLoopConditions: false, checkTypePredicates: true },
      ],
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        {
          ignoreConditionalTests: false,
          ignoreTernaryTests: false,
          ignoreMixedLogicalExpressions: false,
          ignorePrimitives: { boolean: false, number: false, string: false },
        },
      ],
      "@typescript-eslint/prefer-optional-chain": "error",

      // ── Type consistency ─────────────────────────────────────────────────
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
          disallowTypeAnnotations: true,
        },
      ],
      "@typescript-eslint/consistent-type-exports": [
        "error",
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/consistent-indexed-object-style": ["error", "record"],
      "@typescript-eslint/consistent-generic-constructors": [
        "error",
        "constructor",
      ],
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],

      // ── Promises & async ─────────────────────────────────────────────────
      "@typescript-eslint/no-floating-promises": [
        "error",
        { ignoreVoid: true, ignoreIIFE: false, checkThenables: true },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksConditionals: true,
          checksVoidReturn: {
            arguments: true,
            attributes: false,
            properties: true,
            returns: true,
            variables: true,
          },
          checksSpreads: true,
        },
      ],
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/promise-function-async": [
        "error",
        {
          allowedPromiseNames: [],
          checkArrowFunctions: true,
          checkFunctionDeclarations: true,
          checkFunctionExpressions: true,
          checkMethodDeclarations: true,
        },
      ],
      "no-return-await": "off",
      "@typescript-eslint/return-await": ["error", "always"],

      // ── Naming ───────────────────────────────────────────────────────────
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
        },
        { selector: "import", format: ["camelCase", "PascalCase"] },
        { selector: "variable", format: ["camelCase", "UPPER_CASE"] },
        {
          selector: "variable",
          modifiers: ["const", "exported"],
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
        },
        { selector: "function", format: ["camelCase", "PascalCase"] },
        {
          selector: "function",
          modifiers: ["exported"],
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        { selector: "property", format: ["camelCase"] },
        {
          selector: "property",
          modifiers: ["readonly"],
          format: ["camelCase", "UPPER_CASE"],
        },
        { selector: "typeLike", format: ["PascalCase"] },
        {
          selector: "typeParameter",
          format: ["PascalCase"],
          prefix: ["T"],
        },
        { selector: "interface", format: ["PascalCase"] },
        { selector: "typeAlias", format: ["PascalCase"] },
      ],

      // ── Quality & patterns ───────────────────────────────────────────────
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: false,
        },
      ],
      "@typescript-eslint/no-shadow": [
        "error",
        {
          builtinGlobals: true,
          hoist: "all",
          allow: [],
          ignoreOnInitialization: false,
        },
      ],
      "@typescript-eslint/no-unnecessary-type-parameters": "off",

      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
      "no-console": "warn",
      "no-debugger": "error",
      curly: ["error", "all"],
      "no-else-return": ["error", { allowElseIf: false }],
      "no-implicit-coercion": "error",
      "no-nested-ternary": "error",
      "no-unneeded-ternary": "error",
      "prefer-template": "error",
      "object-shorthand": ["error", "always"],
      "prefer-destructuring": [
        "error",
        { array: true, object: true },
        { enforceForRenamedProperties: false },
      ],
      "prefer-spread": "error",
      "prefer-rest-params": "error",
      "no-duplicate-imports": "error",
      "sort-imports": [
        "error",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
          allowSeparatedGroups: true,
        },
      ],

      // ── Size / complexity (guard-rails spec) ─────────────────────────────
      "max-lines": [
        "error",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
      "max-lines-per-function": [
        "error",
        { max: 80, skipBlankLines: true, skipComments: true },
      ],
      complexity: ["error", 12],
      "max-depth": ["error", 4],
      "max-params": ["error", 4],
      "max-nested-callbacks": ["error", 3],

      // ── Banned escape hatches (guard-rails spec) ─────────────────────────
      "@typescript-eslint/ban-ts-comment": "error",
      "@eslint-community/eslint-comments/no-use": ["error", { allow: [] }],

      // ── Imports / depth (guard-rails spec) ───────────────────────────────
      "import/no-cycle": ["error", { maxDepth: Infinity }],
      // NodeNext + verbatimModuleSyntax requires explicit `./x/index.js`
      // specifiers (no directory resolution), so `noUselessIndex` is disabled
      // to avoid a false conflict with the module system; the rest of the rule
      // (redundant `.`/`..` segments) stays active.
      "import/no-useless-path-segments": ["error", { noUselessIndex: false }],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../**", "../../../**"],
              message:
                "Deep relative import banned: import from a module's public entry, not across 2+ parent dirs.",
            },
          ],
        },
      ],

      // ── Module boundaries (guard-rails spec) ─────────────────────────────
      // v7 `dependencies` rule (canonical, non-deprecated). Folds in the old
      // `element-types` (which types may import which) AND the old
      // `entry-point` / `no-private` enforcement (cross-element imports must go
      // through the module's public barrel `index.ts`) by requiring the target
      // element's `fileInternalPath` to be the barrel on every allowed edge.
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          message:
            "Boundary violation: '{{from.type}}' may not import '{{to.type}}'. Allowed edges are declared in eslint.config.mjs, and cross-module imports must go through the module's public entry (index.ts).",
          policies: [
            {
              from: { element: { type: "root" } },
              allow: {
                to: {
                  element: {
                    types: { anyOf: ["provider", "hooks"] },
                    fileInternalPath: "index.ts",
                  },
                },
              },
              message:
                "Boundary violation: 'root' may only import 'provider' or 'hooks' through their public entry (index.ts).",
            },
            {
              from: { element: { type: "hooks" } },
              allow: {
                to: {
                  element: {
                    types: { anyOf: ["provider", "hooks"] },
                    fileInternalPath: "index.ts",
                  },
                },
              },
              message:
                "Boundary violation: 'hooks' may only import 'provider' or 'hooks' through their public entry (index.ts).",
            },
            {
              from: { element: { type: "provider" } },
              allow: {
                to: {
                  element: {
                    type: "provider",
                    fileInternalPath: "index.ts",
                  },
                },
              },
              message:
                "Boundary violation: 'provider' may only import 'provider' through its public entry (index.ts).",
            },
          ],
        },
      ],
      "boundaries/no-unknown-dependencies": "error",
    },
  },
  {
    files: [
      "**/__tests__/**/*.ts",
      "**/__tests__/**/*.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/testing/**",
    ],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-deprecated": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/typedef": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "no-console": "off",
      "@typescript-eslint/unbound-method": "off",
      "prefer-destructuring": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-unnecessary-type-arguments": "off",
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-nested-callbacks": "off",
      // Tests may import demo/fixture apps that live in `examples/`, outside src.
      "no-restricted-imports": "off",
    },
  },
);
