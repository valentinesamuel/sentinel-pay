import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // Warn about object spread that might bypass entity serialization
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'ReturnStatement > ObjectExpression > SpreadElement',
          message: 'Avoid spreading entities in return statements. Return the entity instance directly to ensure proper serialization.',
        },
      ],
    },
  },
  {
    ignores: ['dist', 'node_modules', 'coverage', '*.config.js', '*.config.mjs'],
  },
);
