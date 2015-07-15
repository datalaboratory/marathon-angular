angular.module('marathon').directive('search', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/search.html',
        replace: true,
        link: function () {
        }
    };
});