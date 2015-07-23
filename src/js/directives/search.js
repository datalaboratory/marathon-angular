angular.module('marathon').directive('search', function ($parse) {
    return {
        restrict: 'E',
        templateUrl: 'directives/search.html',
        replace: true,
        scope: true,
        link: function ($scope, $element, $attrs) {
            var store = $parse($attrs.storage);
            $scope.$watch('searchQuery', function (data) {
                store.assign($scope.$parent, data);
            })
        }
    };
});