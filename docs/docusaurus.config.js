module.exports = {
  title: 'OpenHIM Mapping Mediator',
  tagline: 'Simplifying data adaptation between systems',
  url: 'https://jembi.github.io',
  baseUrl: '/openhim-mediator-mapping/',
  favicon: 'img/favicon.ico',
  organizationName: 'jembi', // Usually your GitHub org/user name.
  projectName: 'openhim-mediator-mapping', // Usually your repo name.
  themeConfig: {
    disableDarkMode: false,
    navbar: {
      title: 'Mapper',
      logo: {
        alt: 'Mapper - OpenHIM Mediator',
        src: 'img/logo.png'
      },
      links: [
        {to: 'docs/setup', label: 'Docs', position: 'left'},
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
