angular.module('marathon').directive('runnersList', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/runnersList.html',
        replace: true,
        link: function link($scope) {
            function updateRunnersList() {
                if ($scope.states.winnersInTable) {
                    $scope.runnersList = $scope.winnersForTable;
                } else {
                    $scope.runnersList = $scope.limitedFilteredRunners;
                }
            }
            $scope.$watch('states.winnersInTable', updateRunnersList);
            $scope.$watch('limitedFilteredRunners', updateRunnersList);

            $scope.selectRunner = function (runner) {
                if (runner.gender == 2) return;
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