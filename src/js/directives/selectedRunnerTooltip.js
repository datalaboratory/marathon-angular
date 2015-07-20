angular.module('marathon').directive('selectedRunnerTooltip', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/selectedRunnerTooltip.html',
        replace: true,
        scope: {
            runner: '=',
            position: '='
        },
        link: function link($scope) {
        }
    }
});