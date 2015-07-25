angular.module('marathon').directive('timeGraph', function (mapHelper, toGrayscale) {
    return {
        restrict: 'E',
        templateUrl: 'directives/timeGraph.html',
        replace: true,
        link: {
            pre: function prelink($scope, $element) {
                var width = $element.width();
                $scope.timeScale = d3.time.scale()
                    .domain([$scope.time.start, $scope.time.start + $scope.time.maxTime * 1000])
                    .range([0, width]);
            },
            post: function postlink($scope, $element) {
                $scope.$watch('time.start', function (start) {
                    $scope.timeScale
                        .domain([start, start + $scope.time.maxTime * 1000])
                        .range([0, width]);
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

                var height_factor, graphHeight, current_step, points_byd, runners_byd, reversed_groups, steps_data;

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

                var makeStep = function (step_num, runners) {
                    var range_start = $scope.time.start + step_num * time_step;
                    var range_end = range_start + time_step;
                    return runners.filter(function (runner) {
                        return range_start < runner.end_time && runner.end_time <= range_end
                    });
                };
                var getRunnersByTime = function (runners) {
                    return d3.range(0, stepsCount).map(function (stepNumber) {
                        return makeStep(stepNumber, runners);
                    });
                };
                var getRunByDPoints = function (runnersByTime, prev_array) {
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
                    return {allPoints: result, left: resultLeft, right: resultRight};
                };
                var getRunByDPathData = function (array) {
                    if (!array.length) {
                        return
                    }
                    var result = '';
                    result += 'M' + mapHelper.format({x: array[0].x, y: graphHeight});
                    for (var i = 0; i < array.length; i++) {
                        result += ' L' + mapHelper.format(array[i]);
                    }
                    result += ' L' + mapHelper.format({x: (array[array.length - 1]).x, y: graphHeight});
                    result += ' Z';
                    return result;
                };
                $scope.runnersCount = {};
                $scope.ageWords = ['года', 'лет', 'лет'];
                function updateWinnersData() {
                    runners = checkData($scope.filteredRunners);
                    var winnerMale = runners.genders_groups[1].raw[0];
                    var winnerFemale = runners.genders_groups[0].raw[0];
                    $scope.winners = {
                        male: {
                            runner: winnerMale,
                            position: {
                                x: $scope.timeScale(winnerMale.end_time),
                                y: height - 90
                            },
                            color: $scope.genderGradients[1]($scope.colorNumberScale(winnerMale.age)),
                            gray: toGrayscale($scope.genderGradients[1]($scope.colorNumberScale(winnerMale.age)))

                        },
                        female: {
                            runner: winnerFemale,
                            position: {
                                x: $scope.timeScale(winnerFemale.end_time),
                                y: height - 160
                            },
                            color: $scope.genderGradients[0]($scope.colorNumberScale(winnerFemale.age)),
                            gray: toGrayscale($scope.genderGradients[0]($scope.colorNumberScale(winnerFemale.age)))
                        }
                    };
                }

                function updateRunnersData() {
                    runners = checkData($scope.filteredRunners);

                    $scope.runnersCount.male = runners.genders_groups[1].raw.length;
                    $scope.runnersCount.female = runners.genders_groups[0].raw.length;

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
                        var summ = 0;
                        var all_runners_in_step = [];
                        reversed_groups.forEach(function (el) {
                            summ += runners_byd[el.key][step_num].length;
                            all_runners_in_step.push.apply(all_runners_in_step, runners_byd[el.key][step_num]);
                        });

                        steps_data.push(all_runners_in_step);
                        return summ;
                    };

                    var max_runners_in_step = 0;
                    for (var i = 0; i < stepsCount; i++) {
                        max_runners_in_step = Math.max(max_runners_in_step, getMaxInStep(i));
                    }

                    graphHeight = Math.max(height, max_runners_in_step * y_scale);

                    if (!height_factor) {
                        height_factor = height / (max_runners_in_step * y_scale);
                        $scope.tooltipPointer.stepSize.height = Math.round(height_factor);
                    }
                    points_byd = {};
                    current_step = Math.floor($scope.time.current / $scope.time.maxTime * stepsCount);
                }

                function updatePaths() {
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

                updateRunnersData();
                updatePaths();
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
                $scope.$watch('filterValues', function () {
                    updateRunnersData();
                    current_step = $scope.timeScale($scope.time.current) / width * stepsCount;
                    updatePaths();
                }, true);


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