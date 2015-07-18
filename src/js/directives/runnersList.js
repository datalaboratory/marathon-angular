angular.module('marathon').directive('runnersList', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/runnersList.html',
        replace: true,
        link: function link($scope) {
            $scope.selectRunner = function (runner) {
                var n = $scope.selectedRunners.indexOf(runner);
                if (n >= 0) {
                    $scope.selectedRunners.splice(n,1);
                    return
                }
                $scope.selectedRunners.push(runner);
                if ($scope.selectedRunners.length > 5) {
                    $scope.selectedRunners.shift();
                }
            }
        }
    }
});