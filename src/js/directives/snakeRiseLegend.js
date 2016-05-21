angular.module('marathon').directive('snakeRiseLegend', function (mapHelper, track, roundTo, $timeout, $rootScope, genderColors) {
    var round = roundTo(10);
    var cache = {
        '42km': {
            count: 2800
        },
        'hb': {
            count: 10
        },
        '10km': {
            count: 4020
        },
        '21km': {
            count: 2160
        }
    };
    var render = {
        margin: {
            left: 0,
            right: 0,
            top: 15,
            bottom: 0
        }
    };
    return {
        restrict: 'E',
        templateUrl: 'directives/snakeRiseLegend.html',
        replace: true,
        scope: true,
        link: function ($scope, $element) {
            var width = 77;
            var originalHeight = 150;
            var ratio = 0.4;
            var step_for_dots = ratio * 1000; // шаг на дистанции с которым смотрим высоту змея
            var magicCoeff = 0.8;
            var maxHeight;
            var maxCount;
            var currentScale = 1;
            var realMaxHeight;
            var heightScale = d3.scale.linear();

            function updateMaxHeight() {
                var cached = cache[$scope.currentTrackName];
                if (cached) {
                    maxCount = cached.count;
                    if (cached.height) {
                        maxHeight = cached.height;
                    } else {
                        var total_distance = track.getTrackLength(),
                            px_distance = track.getTotalLength(),
                            px_in_m = px_distance / total_distance;
                        maxHeight = mapHelper.getHeightByRunners(maxCount * 400 / 1000, 400 * px_in_m) * magicCoeff;
                        cache[$scope.currentTrackName].height = maxHeight;
                    }
                } else {
                    var timeStamps = d3.range($scope.time.start, $scope.time.start + $scope.time.maxTime * 1000, 60000);
                    var section_with_max_height = timeStamps.map(function (time) {
                        return mapHelper.getMaxHeightSection(time, $scope.runnersData.items, step_for_dots)
                    }).reduce(function (a, b) {
                        if (a.height > b.height) return a;
                        return b
                    });
                    maxHeight = section_with_max_height.height;
                    maxCount = (section_with_max_height.runners.male + section_with_max_height.runners.female) / ratio;
                    cache[$scope.currentTrackName] = {
                        height: maxHeight,
                        count: maxCount
                    };
                }
                heightScale
                    .domain([0, maxCount]);
                updateContainerHeight();
                updateSnakes();
                $rootScope.$broadcast('legendReady');
            }

            $scope.$on('trackUpdated', function(){
                $timeout(updateMaxHeight);
            });

            function updateContainerHeight() {
                currentScale = mapHelper.getMapScale();
                realMaxHeight = maxHeight * currentScale;
                heightScale
                    .range([realMaxHeight, 0]);
                var elementContainer = $element.parent();
                var newHeight = Math.max(realMaxHeight + 45, originalHeight);
                elementContainer.css({
                    height: newHeight + 'px'
                });
            }

            var unbindStartRender = $rootScope.$on('startRender', function () {
                $timeout(function () {
                    updateContainerHeight();
                    updateSnakes();
                    $scope.$broadcast('render', render);
                })
            });
            var renderRequired;
            $scope.$on('$destroy', function () {
                unbindStartRender();
            });
            $scope.$on('render', function() {
                $timeout(function () {
                    //console.log('render took', performance.now() - renderRequired);
                });
            });
            $rootScope.$on('renderRequired', function() {
                renderRequired = performance.now();
            });

            $scope.renderSnakeLegend = function () {
                if (!$scope.snake || !$scope.snake.path) return;
                var d3element = this;
                d3element.select('.snake-rise-legend__male-path')
                    .attr('d', $scope.snake.path.male);
                d3element.select('.snake-rise-legend__female-path')
                    .attr('d', $scope.snake.path.female);
                d3element.select('.snake-rise-legend__all-path')
                    .attr('d', $scope.snake.path.all);
                d3element.select('.snake-rise-legend__counter')
                    .attr('y', $scope.snake.maxHeight + 20)
            };

            $scope.renderCircleLegend = function () {
                var d3element = this;
                d3element.selectAll('.snake-rise-legend__male-circle')
                    .attr('cx', function (d, i) {
                        return i * 10 + 15
                    })
                    .attr('fill', function (d, i) {
                    return genderColors.genderGradients[1](i + 1)
                });
                d3element.selectAll('.snake-rise-legend__female-circle')
                    .attr('cx', function (d, i) {
                        return i * 10 + 15
                    })
                    .attr('fill', function (d, i) {
                        return genderColors.genderGradients[0](i + 1)
                    });
            };

            function updateSnakes() {
                if (!track.getTrackLength()) return;
                if (isNaN(maxHeight)) return;
                var maxHeightSection = mapHelper.getMaxHeightSection();
                var countMale = round(maxHeightSection.runners.male / ratio);
                var countFemale = round(maxHeightSection.runners.female / ratio);
                var malePosition = countFemale ? Math.min(
                    heightScale(countFemale + countMale / 2),
                    (heightScale(countFemale / 2) - 10)
                ) : heightScale(countMale / 2);
                var femalePercent = maxHeightSection.runners.female / (maxHeightSection.runners.female + maxHeightSection.runners.male);
                if (!femalePercent) femalePercent = 0;
                $scope.snake = {
                    path: {
                        male: formatSnakePath(width, maxHeightSection.height * currentScale * magicCoeff, 1),
                        female: formatSnakePath(width, maxHeightSection.height * currentScale * magicCoeff, femalePercent),
                        all: formatSnakePath(width, maxHeight * currentScale, 1)
                    },
                    maxHeight: maxHeight * currentScale,
                    width: width,
                    count: {
                        male: countMale,
                        female: countFemale,
                        all: countMale + countFemale,
                        max: round(maxCount)
                    },
                    countPosition: {
                        male: malePosition,
                        female: heightScale(countFemale / 2)
                    }
                };
            }

            function formatSnakePath(width, height, factor) {
                var realHeight = maxHeight * mapHelper.getMapScale();
                return 'M0 ' + realHeight +
                    'L' + width + ' ' + realHeight +
                    'L' + width + ' ' + (realHeight - height * factor) +
                    ' C' + width / 2 + ' ' + (realHeight - height * factor * .8) + ' ' +
                    (width / 2) + ' ' + (realHeight - height * factor / 20) +
                    ' 0 ' + realHeight + ' Z'
            }
        }
    }
});