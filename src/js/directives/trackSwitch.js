angular.module('marathon').directive('trackSwitch', function ($timeout, $rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'directives/trackSwitch.html',
        replace: true,
        link: function link($scope) {
            var tracks = ['21km'];

            function nextTrack() {
                $scope.currentTrackName = tracks.shift();
            }

            nextTrack();
            $scope.$on('legendReady', function () {
                if (tracks.length > 0) {
                    nextTrack();
                } else {
                    $rootScope.$broadcast('hideCover:map');
                    if ($scope.currentTrackName != 'hb') {
                        $timeout(function () {
                            $scope.states.activatingWinners = true;
                            $timeout(function () {
                                $scope.states.activatingWinners = false;
                            });
                            $rootScope.$broadcast('hideCover:marathon');
                        }, 500);
                    } else {
                        $scope.states.winnersInTable = false;
                    }
                }
            });
        }
    }
});