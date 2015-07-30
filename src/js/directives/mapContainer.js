angular.module('marathon').directive('mapContainer', function (mapHelper, track, $timeout) {
    return {
        restrict: 'E',
        templateUrl: 'directives/mapContainer.html',
        replace: true,
        link: function link($scope, $element) {
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
                }//todo: в отдельный json
            };
            $scope.selectedRunnerOnMap = {
                runner: null,
                position: null
            };


            $scope.$watch('selectedTrack', function (selectedTrack) {
                selectedTrack.then(function (data) {
                    var geodata = data.data;
                    track.updateGeodata(geodata);
                    updateTrack();

                    $scope.ageAreas = {};
                    var runners = checkData($scope.filteredRunners);

                    var runnerGroups = runners.runners_groups.slice().reverse();
                    runnerGroups.forEach(function (el) {
                        if (!el) console.log(runnerGroups);
                        $scope.ageAreas[el.key] = {color: $scope.genderGradients[el.gender](el.num)}
                    });

                    function updateTrack() {
                        var width = $element.width();
                        var height = $element.height();
                        track.updateContainerSize(width, height);

                        var start = track.getProjectedPoint(geodata.geometry.coordinates[0]);
                        var finish = track.getProjectedPoint(geodata.geometry.coordinates[geodata.geometry.coordinates.length - 1]);
                        $scope.flags = {
                            start: {
                                x: start[0],
                                y: start[1]
                            },
                            finish: {
                                x: finish[0],
                                y: finish[1]
                            },
                            width: 14,
                            height: 19
                        };
                        $scope.pathData = track.getPathData();
                    }

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
                    $scope.$on('render', function () {
                        updateTrack();
                    });
                    $scope.$on('trackUpdated', function () {
                        drawSnake($scope.time.current);
                    })

                })
            });
        }
    }
});