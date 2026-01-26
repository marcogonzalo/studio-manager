import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Allow setState in useEffect for data fetching patterns (common in migrated code)
      'react-hooks/set-state-in-effect': 'off',
      // Downgrade to warning - will fix gradually
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      // Allow <img> for now - can migrate to next/image gradually
      '@next/next/no-img-element': 'warn',
      // Allow unescaped entities in JSX
      'react/no-unescaped-entities': 'off',
    },
  },
];

export default eslintConfig;
