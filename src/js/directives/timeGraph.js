angular.module('marathon').directive('timeGraph', function ($rootScope, $timeout, mapHelper, toGrayscale) {
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
        link: {
            pre: function prelink($scope) {
                $scope.timeScale = d3.time.scale()
                    .domain([$scope.time.start, $scope.time.start + $scope.time.maxTime * 1000]);
                $scope.timeGraphScales = {
                    x: $scope.timeScale
                };
            },
            post: function postlink($scope, $element) {
                $scope.$watch('time.start', function (start) {
                    $scope.timeScale.domain([start, start + $scope.time.maxTime * 1000]);
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
                var prevStepsCount;

                var time_step = 1000 * $scope.time.maxTime / stepsCount;
                $scope.$watch('time.maxTime', function (time) {
                    time_step = 1000 * time / stepsCount;
                });

                var height_factor;
                var graphHeight;
                var current_step;
                var points_byd;
                var runners_byd;
                var reversed_groups;
                var steps_data;

                var runners = checkData($scope.filteredRunners);

                var runnersGroups = runners.runners_groups.slice();
                runnersGroups.forEach(function (el) {
                    var color = $scope.genderGradients[el.gender](el.num);
                    var gray = toGrayscale(color);
                    $scope.ageAreas[el.key] = {
                        left: {
                            color: color
                        },
                        right: {
                            color: gray
                        }
                    };
                });

                function makeStep (step_num, runners, time_step) {
                    var range_start = $scope.time.start + step_num * time_step;
                    var range_end = range_start + time_step;
                    return runners.filter(function (runner) {
                        return range_start < runner.end_time && runner.end_time <= range_end
                    });
                }
                function getRunnersByTime(runners) {
                    return d3.range(0, stepsCount).map(function (stepNumber) {
                        return makeStep(stepNumber, runners, time_step);
                    });
                }
                function getRunByDPoints(runnersByTime, prev_array) {
                    var result = [];
                    var resultLeft = [];
                    var resultRight = [];
                    for (var stepNumber = 0; stepNumber < stepsCount; stepNumber++) {
                        var x1 = stepNumber * px_step;
                        var x2 = x1 + px_step;
                        var y = graphHeight - height_factor * runnersByTime[stepNumber].length;

                        function addPoint(array, x1, x2, y) {
                            array.push({
                                x: x1,
                                y: y
                            }, {
                                x: x2,
                                y: y
                            })
                        }

                        if (prev_array) {
                            var prev_v = prev_array[stepNumber * 2];
                            y = y - (graphHeight - prev_v.y);
                        }
                        addPoint(result, x1, x2, y);
                        if (stepNumber <= current_step) {
                            addPoint(resultLeft, x1, x2, y);
                        } else {
                            addPoint(resultRight, x1, x2, y);
                        }
                    }
                    if (!resultRight.length) addPoint(resultRight, x2, x2, y);
                    return {
                        allPoints: result,
                        left: resultLeft,
                        right: resultRight
                    };
                }
                function getRunByDPathData(array) {
                    if (!array.length) return;
                    var result = '';
                    result += 'M' + mapHelper.format({x: array[0].x, y: graphHeight});
                    for (var i = 0; i < array.length; i++) {
                        result += ' L' + mapHelper.format(array[i]);
                    }
                    result += ' L' + mapHelper.format({x: (array[array.length - 1]).x, y: graphHeight});
                    result += ' Z';
                    return result;
                }

                function updateWinnersData() {
                    runners = checkData($scope.runnersData.items);
                    var winnerMale = runners.genders_groups[1].raw[0];
                    var winnerFemale = runners.genders_groups[0].raw[0];
                    $scope.winners = {
                        male: {
                            runner: winnerMale,
                            position: {
                                y: height - 90
                            },
                            color: $scope.genderGradients[1]($scope.colorNumberScale(winnerMale.age)),
                            gray: toGrayscale($scope.genderGradients[1]($scope.colorNumberScale(winnerMale.age)))

                        },
                        female: {
                            runner: winnerFemale,
                            position: {
                                y: height - 160
                            },
                            color: $scope.genderGradients[0]($scope.colorNumberScale(winnerFemale.age)),
                            gray: toGrayscale($scope.genderGradients[0]($scope.colorNumberScale(winnerFemale.age)))
                        }
                    };
                }

                function updateRunnersData() {
                    runners = checkData($scope.filteredRunners);

                    $scope.runnersCount = {
                        male: runners.genders_groups[1].raw.length,
                        female: runners.genders_groups[0].raw.length
                        };

                    var minMax = d3.extent($scope.filteredRunners, function (runner) {
                        return runner.age
                    });
                    $scope.runnersCount.minAge = minMax[0];
                    $scope.runnersCount.maxAge = minMax[1];

                    runnersGroups = runners.runners_groups.slice();

                    reversed_groups = runnersGroups.reverse();

                    runners_byd = {};

                    runnersGroups.forEach(function (el) {
                        runners_byd[el.key] = getRunnersByTime(el.runners);
                    });
                    steps_data = [];
                    var getMaxInStep = function (step_num) {
                        var all_runners_in_step = [];
                        reversed_groups.forEach(function (el) {
                            all_runners_in_step.push.apply(all_runners_in_step, runners_byd[el.key][step_num]);
                        });

                        steps_data.push(all_runners_in_step);
                    };

                    for (var i = 0; i < stepsCount; i++) {
                        getMaxInStep(i)
                    }
                    var max_runners_in_step = d3.extent(getRunnersByTime($scope.runnersData.items), function (stepArray) {
                        return stepArray.length;
                    })[1];
                    graphHeight = Math.max(height, max_runners_in_step * y_scale);

                    if (!height_factor || prevStepsCount != stepsCount ) {
                        height_factor = height / (max_runners_in_step * y_scale);
                        $scope.tooltipPointer.stepSize.height = Math.round(height_factor);
                    }
                    prevStepsCount = stepsCount;
                    points_byd = {};
                    current_step = Math.floor($scope.time.current / $scope.time.maxTime * stepsCount);
                }

                function updatePaths() {
                    if (!reversed_groups) return;
                    stepsCount = Math.floor(width / px_step);

                    time_step = 1000 * $scope.time.maxTime / stepsCount;

                    reversed_groups.forEach(function (el, i) {
                        var prev = reversed_groups[i - 1];
                        if (prev) prev = points_byd[prev.key];
                        points_byd[el.key] = getRunByDPoints(runners_byd[el.key], prev).allPoints;

                        var leftPoints = getRunByDPoints(runners_byd[el.key], prev).left;
                        var rightPoints = getRunByDPoints(runners_byd[el.key], prev).right;
                        $scope.ageAreas[el.key].left.d = getRunByDPathData(leftPoints);
                        $scope.ageAreas[el.key].right.d = getRunByDPathData(rightPoints);
                    });
                }

                $scope.$watch('time.current', function (time) {
                    current_step = $scope.timeScale(time) / width * stepsCount;
                    updatePaths();
                });
                $scope.$watch('timeScale.domain()', function () {
                    height_factor = null;
                    updateRunnersData();
                    updateWinnersData();
                    current_step = $scope.timeScale($scope.time.current) / width * stepsCount;
                    updatePaths();
                }, true);


                $rootScope.$on('startRender', function () {
                    $scope.$broadcast('render', render);
                });
                $scope.$on('render', function() {
                    $timeout(function () {
                        width = $element.width();
                        stepsCount = Math.floor(width / px_step);
                        time_step = 1000 * $scope.time.maxTime / stepsCount;
                        updateRunnersData();
                        updateWinnersData();
                        current_step = $scope.timeScale($scope.time.current) / width * stepsCount;
                        updatePaths();
                    });
                });

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