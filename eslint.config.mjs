import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescriptConfig from 'eslint-config-next/typescript';

const config = [
  { ignores: ['legacy/**', 'out/**', '.next/**'] },
  ...coreWebVitals,
  ...typescriptConfig,
];

export default config;
