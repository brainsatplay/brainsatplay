// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'brainsatplay',
  tagline: 'A New Way to Compose the Web',
  url: 'https://brainsatplay.com',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'brainsatplay',
  projectName: 'brainsatplay',

  themes: ['@docusaurus/theme-live-codeblock'],


  // ---------------------- TypeDoc Configuration ----------------------
  plugins: [
    './plugins/webpack',
    [
      'docusaurus-plugin-typedoc',

      // Plugin / TypeDoc options
      {
        tsconfig: './tsconfig.json',
        entryPoints: [
          "../src/core/src", 
          // "../src/services/database",
          // "../src/services/http",
          // "../src/services/osc",
          // "../src/services/sessions",
          // "../src/services/stream",
          // "../src/services/unsafe",
          // "../src/services/webrtc",
          // "../src/services/websocket",
          // "../src/services/worker"
        ],
        readme: "none",

        // Plugin options
        out: 'reference',
        sidebar: {
          categoryLabel: 'Reference',
          position: 1,
          fullNames: false
        },
      },
    ],
  ],

  webpack: {
    jsLoader: (isServer) => ({
      loader: require.resolve('esbuild-loader'),
      options: {
        loader: 'tsx',
        format: isServer ? 'cjs' : undefined,
        target: isServer ? 'node12' : 'es2017',
        
      },
    }),
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          // path: '../docs',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/brainsatplay/brainsatplay',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/brainsatplay/brainsatplay',

        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({

      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
      },
      navbar: {
        title: 'brainsatplay',
        logo: {
          alt: 'Brains@Play Logo',
          src: 'img/logo_colorized-min.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'index',
            position: 'left',
            label: 'Docs',
          },
          // {
          //   to: 'examples',
          //   position: 'left',
          //   label: 'Examples',
          // },
          { 
            type: 'doc',
            docId: 'reference/index',
            label: "Reference", 
            position: 'left'
          },
          // { href: repoUrl, label: "GitHub", external: true },
          // { blog: true, label: "Blog" },

          {
            type: 'doc',
            docId: 'resources/index',
            position: 'left',
            label: 'Resources',
          },

          {to: 'blog', label: 'Blog', position: 'right'},
          {
            href: 'https://discord.gg/CDxskSh9ZB',
            position: 'right',
            className: 'discord-icon-menu',
          },
          {
            href: 'https://github.com/brainsatplay/brainsatplay',
            position: 'right',
            className: 'github-icon-menu',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Docs',
                to: '/docs',
              },
              {
                label: 'Examples',
                to: '/examples',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/microservices',
              },
              {
                label: 'Discord',
                href: 'https://discord.com/invite/tQ8P79tw8j',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/brainsatplay',
              },
            ],
          },
          {
            title: 'More',
            items: [
              // {
              //   label: 'Blog',
              //   to: '/blog',
              // },
              {
                label: 'GitHub',
                href: 'https://github.com/brainsatplay/brainsatplay',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Brains@Play.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
