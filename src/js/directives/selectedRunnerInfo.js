angular.module('marathon').directive('selectedRunnerInfo', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/selectedRunnerInfo.html',
        replace: true,
        link: function link($scope, $element) {
            $scope.hideInfo = function () {
                $scope.state = 'hideInfo'
            };
            $scope.showInfo = function () {
                $scope.state = 'showInfo'
            }
        }
    }
});