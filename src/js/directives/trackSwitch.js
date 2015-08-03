angular.module('marathon').directive('trackSwitch', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/trackSwitch.html',
        replace: true,
        link: function link($scope) {
            $scope.currentTrackName = '10km';
        }
    }
});