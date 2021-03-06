angular.module('marathon').directive('weather', function ($http) {
    return {
        restrict: 'E',
        templateUrl: 'directives/weather.html',
        replace: true,
        link: function link($scope) {
            $http.get('data/weather/weather.json').then(function (data) {
                var weatherStates = data.data;
                $scope.$watch('time.current', function (currentTime) {
                    $scope.currentWeather = weatherStates.reduce(function (a, b) {
                        var dayTime = b.time.split(':');
                        var hour = dayTime[0];
                        var minute = dayTime[1];
                        if (moment($scope.time.start).hour(hour).minute(minute) < currentTime) {
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