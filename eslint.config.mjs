import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc', '**/vitest.config.*.timestamp*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'scope:verify-webapp',
              onlyDependOnLibsWithTags: ['scope:verify-webapp', 'scope:shared'],
            },
            {
              sourceTag: 'scope:signing-webapp',
              onlyDependOnLibsWithTags: [
                'scope:signing-webapp',
                'scope:shared',
              ],
            },
            {
              sourceTag: 'scope:cert-generator',
              onlyDependOnLibsWithTags: [
                'scope:cert-generator',
                'scope:shared',
              ],
            },
            {
              sourceTag: 'scope:did-generator',
              onlyDependOnLibsWithTags: ['scope:did-generator', 'scope:shared'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
