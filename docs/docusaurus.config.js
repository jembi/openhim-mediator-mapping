module.exports = {
  title: 'OpenHIM Mapping Mediator',
  tagline: 'Simplifying data adaption between systems',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'jembi', // Usually your GitHub org/user name.
  projectName: 'openhim-mediator-mapping', // Usually your repo name.
  themeConfig: {
    disableDarkMode: true,
    navbar: {
      title: 'OpenHIM Mapping Mediator',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      links: [
        {to: 'docs/setup', label: 'Docs', position: 'left'},
        {
          href: 'https://github.com/jembi/openhim-mediator-mapping',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} Jembi Health Systems.`,
    },
    prism: {
      theme: require('prism-react-renderer/themes/nightOwl'),
    }
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/jembi/openhim-mediator-mapping/edit/master/docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
