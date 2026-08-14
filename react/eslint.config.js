import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'dist-lib']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // An `_` prefix marks a deliberately unused binding — e.g. a deprecated
      // prop destructured out of a rest spread so it never reaches the DOM.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    // Library files export variants, helpers and hooks alongside components
    // by design (buttonVariants, passwordRequirements, useCountdown, …).
    files: [
      'src/components/ui/**/*.tsx',
      'src/components/composed/**/*.tsx',
      'src/components/blocks/**/*.tsx',
      'src/components/motion/**/*.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Vendored from the @beui registry (`shadcn add @beui/<name>`). Hand edits
    // are lost on the next install, so the house rules it trips are relaxed
    // here rather than patched in place: mount guards that setState in an
    // effect, ref-callback assignment into a context-held ref, and the empty
    // interfaces its `extends HTMLAttributes<…>` prop types use.
    files: ['src/components/motion/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
