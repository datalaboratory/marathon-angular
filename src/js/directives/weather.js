angular.module('marathon').directive('weather', function ($http) {
    return {
        restrict: 'E',
        templateUrl: 'directives/weather.html',
        replace: true,
        link: function link($scope) {
            $http.get('data/weather/weather.json').then(function (data) {
                var weatherStates = data.data;
                $scope.$watch('time.current', function (currentTime) {
                    $scope.currentWeather = weatherStates[$scope.currentTrackName].reduce(function (a, b) {
                        if (moment($scope.time.start).add(b.minutes, 'm') < currentTime) {
                            return b;
                        } else {
                            return a;
                        }
                    });
                });
            });
        }
    }
});