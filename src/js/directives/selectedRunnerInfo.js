angular.module('marathon').directive('selectedRunnerInfo', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/selectedRunnerInfo.html',
        replace: true,
        link: function link($scope, $element) {
            $scope.$watch('selectedRunnerOnGraph', function (runner) {
                console.log(runner);
            })
        }
    }
});