polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  timezone: Ember.computed('Intl', function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }),
  // Session Paging Variables
  currentPage: 1,
  pageSize: 5,
  pagingData: Ember.computed.alias('details.items'),
  isPrevButtonsDisabled: Ember.computed('currentPage', function () {
    return this.get('currentPage') === 1;
  }),
  isNextButtonDisabled: Ember.computed(
    'pagingData.length',
    'pageSize',
    'currentPage',
    function () {
      const totalResults = this.get('pagingData.length');
      const totalPages = Math.ceil(totalResults / this.get('pageSize'));
      return this.get('currentPage') === totalPages;
    }
  ),
  pagingStartItem: Ember.computed('currentPage', 'pageSize', function () {
    return (this.get('currentPage') - 1) * this.get('pageSize') + 1;
  }),
  pagingEndItem: Ember.computed('pagingStartItem', function () {
    return this.get('pagingStartItem') - 1 + this.get('pageSize');
  }),
  filteredPagingData: Ember.computed(
    'pagingData.length',
    'pageSize',
    'currentPage',
    function () {
      if (!this.get('pagingData')) {
        return [];
      }
      const startIndex = (this.get('currentPage') - 1) * this.get('pageSize');
      const endIndex = startIndex + this.get('pageSize');

      return this.get('pagingData').slice(startIndex, endIndex);
    }
  ),
  // End of Paging Variables
  init() {
    if (!this.get('block._state')) {
      this.set('block._state', {});
      this.set('block._state.errorMessage', '');
    }

    this._super(...arguments);
  },
  actions: {
    prevPage() {
      let currentPage = this.get('currentPage');

      if (currentPage > 1) {
        this.set('currentPage', currentPage - 1);
      }
    },
    nextPage() {
      const totalResults = this.get('pagingData.length');
      const totalPages = Math.ceil(totalResults / this.get('pageSize'));
      let currentPage = this.get('currentPage');
      if (currentPage < totalPages) {
        this.set('currentPage', currentPage + 1);
      }
    },
    firstPage() {
      this.set('currentPage', 1);
    },
    lastPage() {
      const totalResults = this.get('pagingData.length');
      const totalPages = Math.ceil(totalResults / this.get('pageSize'));
      this.set('currentPage', totalPages);
    },
    acceptDisclaimer: function () {
      this.set('details.showDisclaimer', false);
      this.set('details.acceptedDisclaimer', true);
      this.search();
    },
    declineDisclaimer: function () {
      const payload = {
        action: 'declineDisclaimer',
        search: this.get('details.response.choices')
      };

      this.sendIntegrationMessage(payload)
        .then((result) => {
          this.set('details.showDisclaimer', false);
          this.set('details.disclaimerDeclined', result.declined);
        })
        .catch((error) => {
          console.error(error);
          this.set(
            'block._state.errorMessage',
            JSON.stringify(this.getErrorMessage(error), null, 2)
          );
        });
    }
  },
  search: function () {
    this.set('runningSearch', true);
    const payload = {
      action: 'search',
      entity: this.get('block.entity')
    };

    this.sendIntegrationMessage(payload)
      .then((result) => {
        if (result.noResults) {
          this.set('details.noResults', true);
        } else {
          this.set('details.items', result.data.details.items);
          this.set('block.data.summary', result.data.summary);
        }

        this.set('details.showDisclaimer', false);
        this.set('details.disclaimerDeclined', false);
      })
      .catch((error) => {
        console.error(error);
        this.set(
          'block._state.errorMessage',
          JSON.stringify(this.getErrorMessage(error), null, 2)
        );
      })
      .finally(() => {
        this.set('runningSearch', false);
      });
  },
  getErrorMessage(error) {
    if (Array.isArray(error) && error.length > 0) {
      error = error[0];
    }

    if (error.meta && error.meta.detail) {
      return error.meta.detail;
    } else {
      return error;
    }
  }
});
