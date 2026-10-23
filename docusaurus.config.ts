import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkHideInternal from './src/plugins/remark-hide-internal.mjs';

// Páginas internas (débitos técnicos) só aparecem em desenvolvimento local.
const isProduction = process.env.NODE_ENV === 'production';

const config: Config = {
  title: 'Docs Lastlink',
  tagline: 'Documentação da API e dos webhooks',
  favicon: 'img/favicon.ico',
  future: {
    v4: true,
    // Avoid the HTML template failure observed on Rspack dev recompilations.
    faster: {rspackBundler: false, rspackPersistentCache: false},
  },
  url: 'https://juniorrafaels.github.io',
  baseUrl: '/docs-lastlink/',
  organizationName: 'juniorrafaels',
  projectName: 'docs-lastlink',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  i18n: {defaultLocale: 'pt-BR', locales: ['pt-BR']},
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          exclude: isProduction ? ['**/debitos-tecnicos.md'] : [],
          beforeDefaultRemarkPlugins: isProduction ? [remarkHideInternal] : [],
        },
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    colorMode: {respectPrefersColorScheme: true},
    navbar: {
      items: [
        {type: 'docSidebar', sidebarId: 'apiSidebar', position: 'left', label: 'Webhooks Lastlink'},
        {type: 'docSidebar', sidebarId: 'apiReferenceSidebar', position: 'left', label: 'API Lastlink'},
      ],
    },
    footer: {
      style: 'dark',
      copyright: 'Docs Lastlink · Criado com Docusaurus.',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
