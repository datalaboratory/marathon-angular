angular.module('marathon').directive('mapContainer', function (mapHelper, track) {
    return {
        restrict: 'E',
        templateUrl: 'directives/mapContainer.html',
        replace: true,
        link: function link($scope, $element) {
            var width = $element.width();
            var height = $element.height();

            $scope.mapParams = {
                10: {
                    width: '78%',
                    height: '89%',
                    x: -36,
                    y: 85
                },
                21: {
                    width: '100%',
                    height: '85%',
                    x: -205,
                    y: 110
                }
            };
            $scope.selectedRunnerOnMap = {
                runner: null,
                position: null
            };
            $scope.$watch('selectedTrack', function (selectedTrack) {
                selectedTrack.then(function (data) {
                    var geodata = data.data;
                    track.updateContainerSize(width, height);
                    track.updateGeodata(geodata);

                    $scope.pathData = track.getPathData();

                    $scope.ageAreas = {};
                    var runners = checkData($scope.filteredRunners);

                    var runnerGroups = runners.runners_groups.slice().reverse();
                    runnerGroups.forEach(function (el) {
                        $scope.ageAreas[el.key] = {color: $scope.genderGradients[el.gender](el.num)}
                    });

                    function drawSnake(time) {
                        if (!time) return;
                        time *= 1;
                        var runners = checkData($scope.filteredRunners);
                        var d = mapHelper.getPoints(
                            runners.runners_groups,
                            $scope.ageAreas,
                            time,
                            500);
                        $scope.circles = mapHelper.drawRunnersPoints(
                            $scope.genderGradients,
                            d,
                            $scope.filteredRunners,
                            time);
                    }

                    $scope.$watch('filterValues', function () {
                        drawSnake($scope.time.current);
                    }, true);
                    $scope.$watch('time.current', drawSnake);
                    return true;
                })
            });
        }
    }
});