angular.module('marathon').directive('timeGraph', function ($rootScope, $timeout, mapHelper, runnerClassificator, genderColors, toGrayscale) {
    var render = {
        margin: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        }
    };
    return {
        restrict: 'E',
        templateUrl: 'directives/timeGraph.html',
        replace: true,
        scope: true,
        link: {
            pre: function prelink($scope) {
                $scope.timeScale = d3.time.scale()
                    .domain([$scope.time.start, $scope.time.start + $scope.time.maxTime * 1000]);
                $scope.timeGraphScales = {
                    x: $scope.timeScale
                };
            },
            post: function postlink($scope, $element) {
                $scope.$watch('time.maxTime', function () {
                    $scope.timeScale.domain([$scope.time.start, $scope.time.start + $scope.time.maxTime * 1000]);
                });

                $scope.ageAreas = {};
                var width = $element.width();
                var height = $element.height();

                var px_step = 3;
                var y_scale = 1.2;

                $scope.tooltipPointer = {
                    stepSize: {
                        width: px_step,
                        height: 0
                    }
                };

                var stepsCount = Math.floor(width / px_step);

                var time_step = 1000 * $scope.time.maxTime / stepsCount;
                $scope.$watch('time.maxTime', function (time) {
                    time_step = 1000 * time / stepsCount;
                });

                var height_factor;
                var graphHeight;
                var points_byd;
                var runners_byd;
                var reversed_groups;
                var steps_data;

                var runners = runnerClassificator.checkData($scope.filteredRunners);

                var runnersGroups = runners.runners_groups.slice();
                runnersGroups.forEach(function (group) {
                    var color = genderColors.genderGradients[group.gender](group.num);
                    $scope.ageAreas[group.key] = {
                        color: color
                    };
                });

                function getRunnersByTime(runners) {
                    return d3.range(0, stepsCount).map(function (stepNumber) {
                        var range_start = $scope.time.start + stepNumber * time_step;
                        var range_end = range_start + time_step;
                        return runners.filter(function (runner) {
                            return range_start < runner.end_time && runner.end_time <= range_end
                        });
                    });
                }

                function getRunByDPoints(runnersByTime, prev_array) {
                    var result = [];
                    for (var stepNumber = 0; stepNumber < stepsCount; stepNumber++) {
                        var x1 = stepNumber * px_step;
                        var x2 = x1 + px_step;
                        var y = graphHeight - height_factor * runnersByTime[stepNumber].length;

                        if (prev_array) {
                            var prev_v = prev_array[stepNumber * 2];
                            y = y - (graphHeight - prev_v.y);
                        }
                        result.push({
                            x: x1,
                            y: y
                        }, {
                            x: x2,
                            y: y
                        })
                    }
                    return result;
                }

                function getRunByDPathData(array) {
                    if (!array.length) return;
                    var result = '';
                    result += 'M' + mapHelper.format({x: array[0].x, y: graphHeight});
                    array.forEach(function (item) {
                        result += ' L' + mapHelper.format(item);
                    });
                    result += ' L' + mapHelper.format({x: (array[array.length - 1]).x, y: graphHeight});
                    result += ' Z';
                    return result;
                }

                function updateWinnersData() {
                    var winnerMale = _.find($scope.winnersForTable, function (runner) {
                        return runner.gender == 1 && runner.gender_pos == 1;
                    });
                    var winnerFemale = _.find($scope.winnersForTable, function (runner) {
                        return runner.gender == 0 && runner.gender_pos == 1;
                    });
                    var colorMale = genderColors.genderGradients[1](genderColors.colorNumberScale(winnerMale.age));
                    var colorFemale = genderColors.genderGradients[0](genderColors.colorNumberScale(winnerFemale.age));
                    $scope.winners = {
                        male: {
                            runner: winnerMale,
                            position: {
                                y: height - 90
                            },
                            color: colorMale,
                            gray: toGrayscale(colorMale)
                        },
                        female: {
                            runner: winnerFemale,
                            position: {
                                y: height - 160
                            },
                            color: colorFemale,
                            gray: toGrayscale(colorFemale)
                        }
                    };
                }

                function updateRunnersData() {
                    runners = runnerClassificator.checkData($scope.filteredRunners);

                    $scope.runnersCount = {
                        male: runners.genders_groups[1].length,
                        female: runners.genders_groups[0].length
                    };

                    var minMax = d3.extent($scope.filteredRunners, function (runner) {
                        return runner.age
                    });
                    $scope.runnersCount.minAge = minMax[0];
                    $scope.runnersCount.maxAge = minMax[1];

                    runnersGroups = runners.runners_groups.slice();

                    reversed_groups = runnersGroups.reverse();

                    runners_byd = {};

                    runnersGroups.forEach(function (group) {
                        runners_byd[group.key] = getRunnersByTime(group.runners);
                    });

                    steps_data = d3.range(0, stepsCount).map(function (step) {
                        return d3.merge(reversed_groups.map(function (group) {
                            return runners_byd[group.key][step];
                        }));
                    });

                    var max_runners_in_step = d3.extent(getRunnersByTime($scope.runnersData.items), function (stepArray) {
                        return stepArray.length;
                    })[1];
                    graphHeight = Math.max(height, max_runners_in_step * y_scale);

                    height_factor = height / (max_runners_in_step * y_scale);
                    $scope.tooltipPointer.stepSize.height = Math.round(height_factor);
                    updatePaths();
                    $timeout(function () {
                        $scope.$broadcast('render', render);
                    });
                }

                function updatePaths() {
                    if (!reversed_groups) return;
                    points_byd = {};

                    reversed_groups.forEach(function (el, i) {
                        var prev = reversed_groups[i - 1];
                        if (prev) prev = points_byd[prev.key];
                        points_byd[el.key] = getRunByDPoints(runners_byd[el.key], prev);
                        $scope.ageAreas[el.key].d = getRunByDPathData(points_byd[el.key]);
                    });
                }

                $scope.renderAgeArea = function () {
                    var $scope = angular.element(this.node()).scope();
                    if (!$scope.ageAreas) return;
                    var d3element = this;
                    d3element
                        .attr('d', $scope.area.d)
                        .attr('fill', $scope.area.color)
                };

                $scope.$watch('timeScale.domain()', function () {
                    updateRunnersData();
                    updateWinnersData();
                }, true);


                function getStepsCount() {
                    width = $element.width();
                    stepsCount = Math.floor(width / px_step);
                    time_step = 1000 * $scope.time.maxTime / stepsCount;
                    return stepsCount
                }

                $scope.$watch(getStepsCount, updateRunnersData);
                $scope.$watch('filterValues', updateRunnersData, true);

                $scope.selectRunnerOnGraph = function ($event) {
                    var x = $event.offsetX - 3;
                    var y = $event.offsetY;
                    var posX = Math.floor(x / px_step);
                    var posY = Math.floor((graphHeight - y) / height_factor);
                    $scope.selectedRunnerOnGraph = steps_data[posX][posY];
                    $scope.selectedRunnerPosition =
                        'right: ' + (width - (posX + 1) * px_step + 4) + 'px;' +
                        'bottom: ' + (-graphHeight + (posY) * height_factor + Math.round(height_factor)) + 'px;';
                    $scope.tooltipPointer.position = {
                        x: (width - (posX + 1) * px_step),
                        y: ((posY) * height_factor)
                    }
                };
            }
        }
    }
});