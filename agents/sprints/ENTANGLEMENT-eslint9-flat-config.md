# Entanglement Map: ESLint 9 Flat Config Migration

Related issue: #28 (ESLint 9 + Prettier 3 config migration)

## Package Versions (as of 2026-04-15)

| Package | Latest | Used For |
|---------|--------|----------|
| neostandard | 0.13.0 | Replaces eslint-config-standard |
| eslint-plugin-prettier | 5.5.5 | Runs prettier as ESLint rule |
| eslint-config-prettier | 10.1.8 (latest), 9.1.2 (v9 line) | Disables conflicting rules |
| typescript-eslint | 8.58.2 | TS linting in flat config |
| globals | 17.5.0 | Environment globals for flat config |

## neostandard

### Import and Return Value

```js
import neostandard from 'neostandard';

// Returns an array of ESLint flat config objects
// Intended to be exported directly or spread into a config array
export default neostandard({ semi: true });

// Or combine with other configs:
export default [
    ...neostandard({ semi: true }),
    // other config objects...
];
```

### Key Options

| Option | Effect |
|--------|--------|
| `semi: true` | Enforces semicolons (default: forbids them) |
| `ts: true` | Enables TypeScript syntax support, lints `*.ts` and `*.d.ts` |
| `noStyle: true` | Deactivates all style rules (use when pairing with Prettier) |
| `noJsx: true` | Disables JSX-specific rules |

### Built-in Plugins

neostandard **includes** these as dependencies (no separate install needed):
- `eslint-plugin-n` (v17.x) -- replacement for eslint-plugin-node
- `eslint-plugin-promise` (v7.x)
- `@stylistic/eslint-plugin` (v2.x) -- style rules (disabled when `noStyle: true`)
- `eslint-plugin-react` (v7.x) -- JSX rules
- `typescript-eslint` (v8.x) -- when `ts: true`

### Prettier Integration

neostandard has **NO built-in prettier integration**. Use `noStyle: true` to disable
formatting rules, then add eslint-plugin-prettier/eslint-config-prettier separately.

## eslint-plugin-prettier (v5)

### Flat Config Import

```js
// The /recommended export bundles both eslint-plugin-prettier AND eslint-config-prettier
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
    // ... other configs ...
    eslintPluginPrettierRecommended,  // MUST be last to override formatting rules
];
```

### What the Recommended Config Does

1. Activates the `prettier/prettier` rule (reports prettier diffs as ESLint errors)
2. Disables `arrow-body-style` and `prefer-arrow-callback` (conflict with prettier)
3. Includes `eslint-config-prettier` to turn off all ESLint formatting rules

### Exports Map

```json
{
    ".": "eslint-plugin-prettier.js",
    "./recommended": "recommended.js"
}
```

## eslint-config-prettier (v9/v10)

### Standalone Flat Config Usage (if not using eslint-plugin-prettier/recommended)

```js
// v9 line:
import eslintConfigPrettier from 'eslint-config-prettier/flat';

// Place AFTER other configs to disable conflicting rules
export default [
    someOtherConfig,
    eslintConfigPrettier,
];
```

The `/flat` subpath adds a `name` property for config-inspector support.
Without `/flat`, it still works but lacks the name metadata.

## typescript-eslint (v8)

### Import Pattern

```js
import tseslint from 'typescript-eslint';
```

### Config Helper (DEPRECATED)

`tseslint.config()` is deprecated in favor of ESLint core's `defineConfig()`.
However, it still works and provides type-checking/autocomplete.

### Recommended Pattern -- Spread Into Array

```js
import tseslint from 'typescript-eslint';

export default [
    // tseslint.configs.recommended is an array -- spread it
    ...tseslint.configs.recommended,
];
```

### Scoping to .ts Files Only

```js
{
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommended],
    rules: {
        // additional TS-specific rule overrides
    }
}
```

### Available Config Presets

- `tseslint.configs.recommended` -- recommended rules
- `tseslint.configs.strict` -- stricter set
- `tseslint.configs.stylistic` -- style rules

## globals (v17)

### Import and Usage

```js
import globals from 'globals';

// Each property is an object mapping global names to writability booleans
// true = writable, false = read-only

export default [
    {
        // Browser files
        files: ['**/src/**/*.js'],
        languageOptions: {
            globals: globals.browser
        }
    },
    {
        // Node files
        files: ['**/scripts/**/*.js'],
        languageOptions: {
            globals: globals.node
        }
    },
    {
        // Test files (combine multiple)
        files: ['**/__tests__/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.jest,
                ...globals.node
            }
        }
    }
];
```

### Available Environment Objects

- `globals.browser` -- window, document, etc.
- `globals.node` -- process, Buffer, require, __dirname, etc.
- `globals.nodeBuiltin` -- Node built-ins only (no CommonJS: require, exports, etc.)
- `globals.jest` -- describe, it, expect, etc.
- `globals.es2021` (and other ES versions) -- ES built-ins

## Recommended eslint.config.js Structure for d3fc

```js
import js from '@eslint/js';
import neostandard from 'neostandard';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';
import globals from 'globals';

// Packages that get neostandard + prettier
const strictPackages = [
    'packages/d3fc-data-join/src/**/*.js',
    'packages/d3fc-domain-zoom/src/**/*.js',
    'packages/d3fc-webgl/src/**/*.js',
    'examples/**/*.js',
    'scripts/**/*.js',
];

export default [
    // Global ignores
    {
        ignores: [
            '**/node_modules/**',
            '**/build/**',
            '**/dist/**',
            'packages/d3fc/site/**',
            'site/**',
        ]
    },

    // Base: eslint:recommended for all JS
    js.configs.recommended,

    // Neostandard + prettier for specific packages only
    {
        files: strictPackages,
        ...Object.assign({}, ...neostandard({ semi: true, noStyle: true })),
        // Note: may need to spread neostandard differently -- see notes below
    },
    {
        files: strictPackages,
        ...eslintPluginPrettierRecommended,
    },

    // TypeScript files
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tseslint.parser,
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
        }
    },

    // Browser globals
    {
        files: ['**/src/**/*.js', 'examples/**/*.js'],
        languageOptions: { globals: globals.browser }
    },

    // Node globals
    {
        files: ['scripts/**/*.js', '**/rollup.config.js'],
        languageOptions: { globals: globals.node }
    },

    // Test globals
    {
        files: ['**/__tests__/**/*.js', '**/*.test.js'],
        languageOptions: {
            globals: { ...globals.jest, ...globals.node }
        }
    },
];
```

## Discovered Entanglement: Phases Cannot Be Separated

The original plan had Phase 1 (Prettier 1→3) and Phase 2 (ESLint 7→9) as separate steps.
During execution, we discovered they are atomically coupled:

```
Prettier 3 (ESM-only) ← requires eslint-plugin-prettier@5 (v3 can't load Prettier 3)
eslint-plugin-prettier@5 ← requires ESLint ≥8
ESLint 9 ← requires flat config (eslintrc removed in ESLint 10)
```

All three must move together in a single pass. This mirrors the infrastructure bundle
pattern where canvas 3, jest-environment-jsdom 30, and jsdom 29 were atomically coupled.

## Open Questions / Risks

1. **neostandard scoping**: neostandard() returns an array of config objects without
   `files` restrictions. To scope it to specific packages, we may need to manually
   add `files` to each object in the returned array, e.g.:
   ```js
   ...neostandard({ semi: true }).map(config => ({
       ...config,
       files: strictPackages,
   }))
   ```

2. **neostandard + noStyle + prettier**: Using `noStyle: true` disables
   @stylistic rules. Then eslint-plugin-prettier/recommended adds prettier
   formatting enforcement. This is the recommended combination.

3. **eslint-plugin-prettier version**: v5.5.5 requires eslint >=9.0.0 and
   prettier >=3.0.0. Both satisfied by our target versions.

4. **tseslint.configs.recommended is an array**: When spreading into a flat
   config, use `...tseslint.configs.recommended`. When scoping to files,
   wrap each element with a files constraint.
