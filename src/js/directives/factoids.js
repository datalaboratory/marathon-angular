angular.module('marathon').directive('factoids', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/factoids.html',
        replace: true,
        link: function ($scope, $element) {
            $scope.showFactoid = function (from, to) {
                return moment($scope.time.start).add(from, 'm') <= $scope.time.current &&
                    $scope.time.current < moment($scope.time.start).add(to, 'm')
            }
        }
    }
});