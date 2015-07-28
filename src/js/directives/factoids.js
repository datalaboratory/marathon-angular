angular.module('marathon').directive('factoids', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/factoids.html',
        replace: true,
        link: function ($scope, $element) {
            $scope.showFactoid = function (from, to) {
                from = from.split(':');
                to = to.split(':');
                var timeFrom = moment($scope.time.start).hour(from[0]).minutes(from[1]);
                var timeTo = moment($scope.time.start).hour(to[0]).minutes(to[1]);
                return timeFrom <= $scope.time.current && $scope.time.current < timeTo
            }
        }
    }
});