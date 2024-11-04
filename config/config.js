module.exports = {
  name: 'Feedly',
  acronym: 'FEED',
  description: 'Search your Feedly feed',
  entityTypes: ['IPv4', 'IPv6', 'MD5', 'SHA1', 'SHA256', 'email', 'domain', 'url', 'cve'],
  customTypes: [
    {
      key: 'allText',
      regex: '\\S[\\s\\S]{2,128}\\S'
    }
  ],
  styles: ['./styles/styles.less'],
  onDemandOnly: true,
  defaultColor: 'light-gray',
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  request: {
    cert: '',
    key: '',
    passphrase: '',
    ca: '',
    proxy: ''
  },
  logging: {
    level: 'info'
  },
  options: [
    {
      key: 'apiKey',
      name: 'Feedly API Key',
      description: 'Your Feedly API Key',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'streamId',
      name: 'Feedly Stream ID',
      description: 'The ID of the Feedly stream you want to search. Stream IDs will look like `enterprise/{{your_org}}/category/f37c627f-0dc3-496c-9c9f-56fccdf84c57`',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'count',
      name: 'Max Results',
      description:
        'The maximum number of results to return from Feedly when searching.  Defaults to 25.',
      default: 25,
      type: 'number',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'showDisclaimer',
      name: 'Show Search Disclaimer',
      description:
        'If enabled, the integration will show a disclaimer the user must accept before running a search.',
      default: true,
      type: 'boolean',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'disclaimer',
      name: 'Search Disclaimer Content',
      description:
        'A disclaimer that users must review before the integration will submit questions to the Google Search API.',
      default:
        'Please affirm that no confidential information will be shared with your submission to Feedly. Click Accept to run your search.',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'disclaimerInterval',
      name: 'Disclaimer Interval',
      description:
        'How often to display the disclaimer to users. Restarting the integration will reset the interval timer.',
      default: {
        value: 'all',
        display: 'All searches - disclaimer will be shown before every search (default)'
      },
      type: 'select',
      options: [
        {
          value: 'all',
          display:
            'All searches - disclaimer will be shown before every new search (default)'
        },
        {
          value: '24',
          display: 'Every 24 hours - disclaimer will be shown once per day'
        },
        {
          value: '168',
          display: 'Every week - disclaimer will be shown once per week'
        }
      ],
      multiple: false,
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
