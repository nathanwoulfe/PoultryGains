/*global angular*/

/**
 * @ngdoc service
 * @name poultryGainsApp.data
 * @description
 * # Data
 * Factory in the poultryGainsApp.
 */
angular.module('poultryGainsApp')
  .factory('Data', function ($http) {
    'use strict';

    var key = '1Sq-psdVrf1KGJswMhcQfa8ioK4qPxAady_1Sg3j5KE4';

    // Public API here
    return {
      get: function (i) {
        return $http.get('https://spreadsheets.google.com/feeds/list/' + key + '/od6/public/values?alt=json');
      }
    };
  });
