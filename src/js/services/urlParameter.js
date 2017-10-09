angular.module('marathon').factory('urlParameter', function ($location) {
  return {
    get: function get(parameter) {
      return $location.search()[parameter];
    },
    set: function set(parameter, value) {
      $location.search(parameter, value);
    },
    remove: function remove(parameter) {
      $location.search(parameter, null);
    },
  }
});