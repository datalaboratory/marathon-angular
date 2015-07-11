angular.module('marathon').directive('timeGraph', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/timeGraph.html',
        replace: true,
        link: function link($scope, $element) {
            var age_areas = {};
            var width = $element.width();
            var height = $element.height();
            var d3element = d3.select($element[0]);
            var svg = d3element.select('svg').attr('height', height);
            var areas_group = svg.append('g');
            var runners = checkData($scope.filteredRunners);

            var array = runners.runners_groups.slice().reverse();
            array.forEach(function (el) {
                var color = $scope.genderGradients[el.gender](el.num);
                var gray = $scope.grayGradient(el.num);

                age_areas[el.key] = {
                    left: areas_group.append('path').style({
                        stroke: 'none',
                        "fill": color
                    }),
                    right: areas_group.append('path').style({
                        stroke: 'none',
                        "fill": gray
                    })
                };

            });
            var px_step = 3;
            var y_scale = 1.2;

            var steps = Math.floor(width / px_step);

            var time_step = 1000 * $scope.time.finish / steps;

            var makeStep = function (step_num, runners) {
                var result = [];
                var range_start = $scope.time.start + step_num * time_step;
                var range_end = range_start + time_step;
                runners.forEach(function (runner) {
                    if (runner.end_time > range_start && runner.end_time <= range_end) {
                        result.push(runner);
                    }
                });
                return result;
            };
            var getRunnersByTime = function (runners) {
                var runners_by_time = [];

                for (var i = 0; i < steps; i++) {
                    var array = makeStep(i, runners);
                    runners_by_time.push(array);
                }
                return runners_by_time;
            };

            var reversed_groups = runners.runners_groups.slice();
            reversed_groups.reverse();

            var runners_byd = {};

            runners.runners_groups.forEach(function (el) {
                runners_byd[el.key] = getRunnersByTime(el.runners);
            });
            var steps_data = [];
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
            for (var i = 0; i < steps; i++) {
                max_runners_in_step = Math.max(max_runners_in_step, getMaxInStep(i));
            }

            var graphHeight = Math.max(height, max_runners_in_step * y_scale);

            var height_factor = height / (max_runners_in_step * y_scale);

            reversed_groups.reverse();
            var points_byd = {};
            var points_byd_left = {};
            var points_byd_right = {};


            var cur_step = Math.floor($scope.time.current / $scope.time.finish * steps);

            var getRunByDPoints = function (array, prev_array) {
                var result = [];
                var resultLeft = [];
                var resultRight = [];
                for (var i = 0; i < steps; i++) {
                    var x1 = i * px_step;
                    var x2 = x1 + px_step;
                    var y = graphHeight - height_factor * array[i].length;
                    if (!y && y !== 0) return [[], [], []];
                    if (prev_array) {
                        var prev_v = prev_array[i * 2];
                        y = y - (graphHeight - prev_v.y);
                    }

                    result.push({
                        x: x1,
                        y: y
                    }, {
                        x: x2,
                        y: y
                    });
                    if (i <= cur_step) {
                        resultLeft.push({
                            x: x1,
                            y: y
                        }, {
                            x: x2,
                            y: y
                        });
                    } else {
                        resultRight.push({
                            x: x1,
                            y: y
                        }, {
                            x: x2,
                            y: y
                        });
                    }
                }
                if (!resultRight.length) resultRight.push({
                    x: x2,
                    y: y
                }, {
                    x: x2,
                    y: y
                });
                return [result, resultLeft, resultRight];
            };


            var getRunByDPathData = function (array) {
                if (!array.length) {
                    return
                }
                var result = '';
                result += 'M' + mh.format({x: array[0].x, y: graphHeight});
                for (var i = 0; i < array.length; i++) {
                    result += ' L' + mh.format(array[i]);
                }
                result += ' L' + mh.format({x: (array[array.length - 1]).x, y: graphHeight});
                result += ' Z';
                return result;
            };

            $scope.$watch('time.current', function(time){
                cur_step = Math.floor(time / $scope.time.finish * steps);
                reversed_groups.forEach(function (el, i) {
                    var prev = reversed_groups[i - 1];
                    prev = prev && points_byd[prev.key];
                    points_byd[el.key] = getRunByDPoints(runners_byd[el.key], prev)[0];
                    points_byd_left[el.key] = getRunByDPoints(runners_byd[el.key], prev)[1];
                    points_byd_right[el.key] = getRunByDPoints(runners_byd[el.key], prev)[2];
                });
                runners.runners_groups.forEach(function (el) {
                    age_areas[el.key].left.attr("d", getRunByDPathData(points_byd_left[el.key]));
                    age_areas[el.key].right.attr("d", getRunByDPathData(points_byd_right[el.key]));
                });
            });
        }
    }
});