angular.module('marathon').directive('mapContainer', function ($rootScope, mapHelper, track, runnerClassificator, genderColors) {
    var render = {
        margin: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        }
    };
    var originalWidth = 1000;
    var originalHeight;
    return {
        restrict: 'E',
        templateUrl: 'directives/mapContainer.html',
        replace: true,
        link: function link($scope, $element) {
            $scope.mapParams = {
                '10km': {
                    width: 610,
                    height: 540,
                    x: 26,
                    y: 100
                },
                '21km': {
                    width: 610,
                    height: 540,
                    x: 26,
                    y: 100
                }//todo: в отдельный json
            };
            $scope.selectedRunnerOnMap = {
                runner: null,
                position: null
            };
            $scope.scale = 1;
            if (!originalHeight) originalHeight = $element.height();
            var geoData;
            function updateTrack(geoData) {
                track.updateContainerSize(originalWidth, originalHeight);

                var start = track.getProjectedPoint(geoData.geometry.coordinates[0]);
                var finish = track.getProjectedPoint(geoData.geometry.coordinates[geoData.geometry.coordinates.length - 1]);

                $scope.flags = {
                    start: {
                        x: start[0],
                        y: start[1],
                        deg: -25
                    },
                    finish: {
                        x: finish[0],
                        y: finish[1],
                        deg: 25
                    },
                    width: 14,
                    height: 19
                };
                $scope.pathData = track.getPathData();
            }
            function drawSnake(time) {
                if (!time) return;
                time *= 1;
                var step = 500;
                var runners = runnerClassificator.checkData($scope.filteredRunners);
                mapHelper.getPoints(
                    runners.runners_groups,
                    $scope.ageAreas,
                    time,
                    step);
                $scope.circles = mapHelper.drawRunnersPoints(
                    $scope.filteredRunners,
                    time,
                    step);
            }

            var firstTime = true;
            $scope.$watch('selectedTrack', function (selectedTrack) {
                selectedTrack.then(function (data) {
                    geoData = data.data;
                    track.updateGeodata(geoData);
                    updateTrack(geoData);

                    $scope.ageAreas = {};
                    var runners = runnerClassificator.checkData($scope.filteredRunners);

                    var runnerGroups = runners.runners_groups.slice().reverse();
                    runnerGroups.forEach(function (el) {
                        $scope.ageAreas[el.key] = {color: genderColors.genderGradients[el.gender](el.num)}
                    });
                    if (firstTime) {
                        firstTime = false;
                        $scope.$watch('filterValues', function () {
                            drawSnake($scope.time.current);
                        }, true);
                        $scope.$watch('time.current', drawSnake);

                        $rootScope.$on('startRender', function () {
                            $scope.$broadcast('render', render);
                        });
                        $scope.$on('render', function () {
                            var currentWidth = $element.width();
                            var scale = currentWidth / originalWidth;
                            $scope.scale = scale;
                            mapHelper.setMapScale(scale);
                            $element.parent().css({
                                height: originalHeight * scale
                            });
                            drawSnake($scope.time.current);
                        });
                    }
                })
            });
        }
    }
});