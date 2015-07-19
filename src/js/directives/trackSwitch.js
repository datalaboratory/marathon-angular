angular.module('marathon').directive('trackSwitch', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/trackSwitch.html',
        replace: true,
        link: function link($scope) {
            $scope.state = '10km';
            $scope.setData = function (state) {
                if (state == '10km') {
                    $scope.selectedTrack = $scope.req.track[10];
                    $scope.selectedRunnersData = $scope.req.runners[10];
                    return
                }
                if (state == '21km') {
                    $scope.selectedTrack = $scope.req.track[21];
                    $scope.selectedRunnersData = $scope.req.runners[21];
                }
                $scope.selectedRunners = [];
            }
        }
    }
});