angular.module('marathon').directive('trackSwitch', function ($timeout, $rootScope, urlParameter) {
    return {
        restrict: 'E',
        templateUrl: 'directives/trackSwitch.html',
        replace: true,
        link: function link($scope) {
            var trackFromUrl = urlParameter.get('track');
            var tracks = [trackFromUrl ? trackFromUrl : '42km'];

            function nextTrack() {
                $scope.currentTrackName = tracks.shift();
            }

            nextTrack();

            $scope.onTrackChange = function (name) {
                $scope.currentTrackName = name;
            };

            $scope.$on('legendReady', function () {
                if (tracks.length > 0) {
                    nextTrack();
                } else {
                    $rootScope.$broadcast('hideCover:map');
                    if ($scope.currentTrackName != 'hb' && $scope.currentTrackName != 'rw') {
                        $timeout(function () {
                            $scope.states.activatingWinners = true;
                            $timeout(function () {
                                $scope.states.activatingWinners = false;
                            });
                            $rootScope.$broadcast('hideCover:marathon');
                        }, 500);
                    } else {
                        $timeout(function () {
                            $scope.states.activatingWinners = false;
                            $rootScope.$broadcast('hideCover:marathon');
                        }, 500);
                    }
                }
            });
        }
    }
});