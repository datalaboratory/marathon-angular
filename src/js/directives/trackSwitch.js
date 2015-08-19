angular.module('marathon').directive('trackSwitch', function ($timeout, $rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'directives/trackSwitch.html',
        replace: true,
        link: function link($scope) {
            var tracks = ['hb', '21km'];
            function nextTrack() {
                $scope.currentTrackName = tracks.shift();
            }
            nextTrack();
            $scope.$on('legendReady', function () {
                if (tracks.length > 0) {
                    nextTrack();
                } else {
                    $rootScope.$broadcast('hideCover:map');
                    $timeout(function () {
                        if ($scope.currentTrackName != 'hb') {
                            $scope.states.activatingWinners = true;
                            $timeout(function () {
                                $scope.states.activatingWinners = false;
                            });
                        } else {
                            $scope.states.winnersInTable = false;
                        }
                        $rootScope.$broadcast('hideCover:marathon');
                    }, 500);
                }
            });
        }
    }
});