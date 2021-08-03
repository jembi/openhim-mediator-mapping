const versions = require('./versions.json');

module.exports = {
  title: 'OpenHIM Mapping Mediator',
  tagline: 'Simplifying data adaptation between systems',
  url: 'https://jembi.github.io',
  baseUrl: '/openhim-mediator-mapping/',
  favicon: 'img/favicon.ico',
  organizationName: 'jembi', // Usually your GitHub org/user name.
  projectName: 'openhim-mediator-mapping', // Usually your repo name.
  themeConfig: {
    colorMode: {
      disableSwitch: false
    },
    navbar: {
      title: 'Mapper',
      logo: {
        alt: 'Mapper - OpenHIM Mediator',
        src: 'img/logo.png'
      },
      items: [
        {
          to: 'versions',
          label: `${versions[0]}`,
          position: 'left',
          style: {
            whiteSpace: 'nowrap',
            padding: '0.25rem 0.5rem 0.2rem 0.25rem',
            fontSize: 'calc(0.9 * var(--ifm-font-size-base))',
            textDecoration: 'underline',
          },
        },
        {to: 'docs/gettingStarted/setup', label: 'Docs', position: 'left'},
        {
          href: 'https://github.com/jembi/openhim-mediator-mapping',
          label: 'GitHub',
          position: 'right'
        }
      ]
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} Jembi Health Systems.`
    },
    prism: {
      theme: require('prism-react-renderer/themes/nightOwl')
    }
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/jembi/openhim-mediator-mapping/edit/master/docs/'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      }
    ]
  ]
}
