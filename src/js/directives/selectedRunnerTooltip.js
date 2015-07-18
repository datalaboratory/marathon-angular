angular.module('marathon').directive('selectedRunnerTooltip', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/selectedRunnerTooltip.html',
        replace: true,
        link: function link($scope, $element) {
            $scope.hideTooltip = function () {
                $scope.state = 'hideInfo'
            };
            $scope.showTooltip = function () {
                $scope.state = 'showInfo'
            }
        }
    }
});