import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import boundaries from 'eslint-plugin-boundaries';

/*
 * Architecture, enforced.
 *
 * Layers and the only directions imports may flow:
 *   app -> features -> components | hooks -> lib
 *   features may also read content and three; nothing else may.
 *   features never import each other. Nothing imports app.
 *   three, lib and content are framework-free: no react, no next.
 *   Only src/three may import the `three` package.
 *
 * Each folder below is one element, so imports inside a folder (or inside one feature)
 * are internal and always allowed. Everything else needs a policy.
 */
const layers = [
  { type: 'app', pattern: 'src/app', partialMatch: false },
  { type: 'features', pattern: 'src/features/*', capture: ['feature'], partialMatch: false },
  { type: 'components', pattern: 'src/components', partialMatch: false },
  { type: 'hooks', pattern: 'src/hooks', partialMatch: false },
  { type: 'lib', pattern: 'src/lib', partialMatch: false },
  { type: 'three', pattern: 'src/three', partialMatch: false },
  { type: 'content', pattern: 'src/content', partialMatch: false },
  { type: 'styles', pattern: 'src/styles', partialMatch: false },
  { type: 'test', pattern: 'src/test', partialMatch: false },
];

const from = (...types) => ({ element: { types: { anyOf: types } } });
const to = (...types) => ({ to: { element: { types: { anyOf: types } } } });
const packages = (...sources) => ({ to: { module: { origin: 'external', source: sources } } });

export default defineConfig([
  globalIgnores([
    'legacy/**',
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
  ...nextVitals,
  ...nextTs,
  {
    files: ['src/**/*.{ts,tsx,js}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
      'boundaries/include': ['src/**/*'],
      'boundaries/ignore': ['src/**/*.test.{ts,tsx}'],
      'boundaries/elements': layers,
    },
    rules: {
      'boundaries/no-unknown-dependencies': 'error',
      'boundaries/no-unknown-files': 'error',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          checkAllOrigins: true,
          policies: [
            /* Internal layers. The last matching policy wins. */
            {
              from: from('app'),
              allow: to('features', 'components', 'hooks', 'lib', 'content', 'styles'),
            },
            { from: from('features'), allow: to('components', 'hooks', 'lib', 'three', 'content') },
            { from: from('components'), allow: to('hooks', 'lib') },
            { from: from('hooks'), allow: to('lib') },

            /* Packages: allowed everywhere, except across the two framework boundaries. */
            { allow: { to: { module: { origin: ['external', 'core'] } } } },
            {
              from: from('app', 'features', 'components', 'hooks', 'lib', 'content', 'test'),
              disallow: packages('three'),
            },
            {
              from: from('three', 'lib', 'content'),
              disallow: packages('react', 'react-dom', 'next'),
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx,js,mjs,mts}'],
    rules: {
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  prettier,
]);
