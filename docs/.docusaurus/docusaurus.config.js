export default {
  "plugins": [],
  "themes": [],
  "customFields": {},
  "themeConfig": {
    "disableDarkMode": true,
    "navbar": {
      "title": "OpenHIM Mapping Mediator",
      "logo": {
        "alt": "My Site Logo",
        "src": "img/logo.svg"
      },
      "links": [
        {
          "to": "docs/setup",
          "label": "Docs",
          "position": "left"
        },
        {
          "href": "https://github.com/jembi/openhim-mediator-mapping",
          "label": "GitHub",
          "position": "right"
        }
      ]
    },
    "footer": {
      "style": "dark",
      "links": [],
      "copyright": "Copyright © 2020 Jembi Health Systems."
    },
    "prism": {
      "theme": {
        "plain": {
          "color": "#d6deeb",
          "backgroundColor": "#011627"
        },
        "styles": [
          {
            "types": [
              "changed"
            ],
            "style": {
              "color": "rgb(162, 191, 252)",
              "fontStyle": "italic"
            }
          },
          {
            "types": [
              "deleted"
            ],
            "style": {
              "color": "rgba(239, 83, 80, 0.56)",
              "fontStyle": "italic"
            }
          },
          {
            "types": [
              "inserted",
              "attr-name"
            ],
            "style": {
              "color": "rgb(173, 219, 103)",
              "fontStyle": "italic"
            }
          },
          {
            "types": [
              "comment"
            ],
            "style": {
              "color": "rgb(99, 119, 119)",
              "fontStyle": "italic"
            }
          },
          {
            "types": [
              "string",
              "url"
            ],
            "style": {
              "color": "rgb(173, 219, 103)"
            }
          },
          {
            "types": [
              "variable"
            ],
            "style": {
              "color": "rgb(214, 222, 235)"
            }
          },
          {
            "types": [
              "number"
            ],
            "style": {
              "color": "rgb(247, 140, 108)"
            }
          },
          {
            "types": [
              "builtin",
              "char",
              "constant",
              "function"
            ],
            "style": {
              "color": "rgb(130, 170, 255)"
            }
          },
          {
            "types": [
              "punctuation"
            ],
            "style": {
              "color": "rgb(199, 146, 234)"
            }
          },
          {
            "types": [
              "selector",
              "doctype"
            ],
            "style": {
              "color": "rgb(199, 146, 234)",
              "fontStyle": "italic"
            }
          },
          {
            "types": [
              "class-name"
            ],
            "style": {
              "color": "rgb(255, 203, 139)"
            }
          },
          {
            "types": [
              "tag",
              "operator",
              "keyword"
            ],
            "style": {
              "color": "rgb(127, 219, 202)"
            }
          },
          {
            "types": [
              "boolean"
            ],
            "style": {
              "color": "rgb(255, 88, 116)"
            }
          },
          {
            "types": [
              "property"
            ],
            "style": {
              "color": "rgb(128, 203, 196)"
            }
          },
          {
            "types": [
              "namespace"
            ],
            "style": {
              "color": "rgb(178, 204, 214)"
            }
          }
        ]
      }
    }
  },
  "title": "OpenHIM Mapping Mediator",
  "tagline": "Simplifying data adaption between systems",
  "url": "https://your-docusaurus-test-site.com",
  "baseUrl": "/",
  "favicon": "img/favicon.ico",
  "organizationName": "jembi",
  "projectName": "openhim-mediator-mapping",
  "presets": [
    [
      "@docusaurus/preset-classic",
      {
        "docs": {
          "sidebarPath": "/home/martin/projects/openhim/mediators/openhim-mediator-mapping/docs/sidebars.js",
          "editUrl": "https://github.com/jembi/openhim-mediator-mapping/edit/master/docs/"
        },
        "theme": {
          "customCss": "/home/martin/projects/openhim/mediators/openhim-mediator-mapping/docs/src/css/custom.css"
        }
      }
    ]
  ]
};