angular.module('marathon').directive('mapContainer', function ($rootScope, mapHelper, track, runnerClassificator, genderColors, $timeout) {
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
        scope: true,
        link: function link($scope, $element) {
            $scope.mapParams = {
                '42km': {
                    width: 570,
                    height: 510,
                    x: 60,
                    y: 103,
                    snakeHeight: 0.4
                },
                'hb': {
                    width: 570,
                    height: 510,
                    x: 60,
                    y: 103,
                    snakeHeight: 0.4
                },
                '10km': {
                    width: 610,
                    height: 540,
                    x: 26,
                    y: 100,
                    snakeHeight: 0.4
                },
                '21km': {
                    width: 610,
                    height: 540,
                    x: 26,
                    y: 100,
                    snakeHeight: 0.4
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

                var coordinates = geoData.geometry.coordinates;
                var start = track.getProjectedPoint(coordinates[0]);
                var finish = track.getProjectedPoint(coordinates[coordinates.length - 1]);

                $scope.flags = [{
                    x: start[0],
                    y: start[1],
                    deg: 25,
                    image: 'yel'
                }, {
                    x: finish[0],
                    y: finish[1],
                    deg: -25,
                    image: 'red'
                }
                ];
                $scope.flags.width = 14;
                $scope.flags.height = 19;
                $scope.pathData = track.getPathData();
            }

            function drawSnake(time) {
                if (!time) return;
                time *= 1;
                var step = 400;
                var runners = runnerClassificator.checkData($scope.filteredRunners);
                if ($scope.currentTrackName != 'hb'){
                    mapHelper.getPoints(
                        runners.runners_groups,
                        $scope.ageAreas,
                        time,
                        step);
                }
                $scope.circles = mapHelper.drawRunnersPoints(
                    $scope.filteredRunners,
                    time,
                    step,
                    $scope.currentTrackName);
                $timeout(function () {
                    $scope.$broadcast('render', render);
                })
            }

            $scope.scaleAll = function () {
                var d3element = this;
                d3element
                    .attr('transform', 'scale(' + $scope.scale + ')');
                var params = $scope.mapParams[$scope.currentTrackName];
                d3element.select('.map-container__background-map')
                    .attr('x', params.x)
                    .attr('y', params.y)
                    .attr('width', params.width)
                    .attr('height', params.height)
            };
            $scope.renderFlag = function () {
                var $scope = angular.element(this.node()).scope();
                if (!$scope || !$scope.flags) return;
                var d3element = this;
                d3element
                    .attr('xlink:href', 'img/mark-' + $scope.flag.image + '.png')
                    .attr('width', $scope.flags.width / $scope.scale)
                    .attr('height', $scope.flags.height / $scope.scale)
                    .attr('transform', 'translate(' +
                    ($scope.flag.x - $scope.flags.width / 2 / $scope.scale) + ',' +
                    ($scope.flag.y - $scope.flags.height / $scope.scale) +
                    ') rotate(' + $scope.flag.deg + ',' +
                    $scope.flags.width / 2 / $scope.scale + ',' +
                    $scope.flags.height / $scope.scale + ')')
            };

            $scope.renderSnakeGroup = function () {
                if (!angular.element(this.node()).scope() || !$scope.ageAreas) return;
                var d3element = this;
                d3element.select('.snake-group__track')
                    .attr('d', $scope.pathData);
                d3element.selectAll('.snake-group__snake')
                    .attr('d', function () {
                        return angular.element(this).scope().area.d
                    })
                    .attr('fill', function () {
                        return angular.element(this).scope().area.color
                    });
                d3element.selectAll('.snake-group__circle')
                    .attr('cx', function () {
                        return angular.element(this).scope().runner.cx
                    })
                    .attr('cy', function () {
                        return angular.element(this).scope().runner.cy
                    })
                    .attr('r', function () {
                        return angular.element(this).scope().runner.r
                    })
                    .attr('fill', function () {
                        return angular.element(this).scope().runner.fill
                    });
            };

            var firstTime = true;
            $scope.$watch('selectedTrack', function (selectedTrack) {
                selectedTrack.then(function (data) {
                    geoData = data.data;
                    track.updateGeodata(geoData, $scope.currentTrackName);
                    mapHelper.setSnakeHeightCoefficient($scope.mapParams[$scope.currentTrackName].snakeHeight);

                    updateTrack(geoData);

                    $scope.ageAreas = {};
                    var runners = runnerClassificator.checkData($scope.filteredRunners);

                    var runnerGroups = runners.runners_groups.slice().reverse();
                    runnerGroups.forEach(function (el) {
                        $scope.ageAreas[el.key] = {color: genderColors.genderGradients[el.gender](el.num)}
                    });
                    if (firstTime) {
                        firstTime = false;

                        var unbindStartRender = $rootScope.$on('startRender', function () {
                            var currentWidth = $element.width();
                            var scale = currentWidth / originalWidth;
                            $scope.scale = scale;
                            mapHelper.setMapScale(scale);
                            $element.parent().css({
                                height: originalHeight * scale
                            });
                            drawSnake($scope.time.current);

                        });

                        $scope.$on('$destroy', function () {
                            unbindStartRender();
                        });

                    }
                });
            });
        }
    }
});