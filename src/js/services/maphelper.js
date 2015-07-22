angular.module('marathon').factory('mapHelper', function () {
    var x_axis_points = {
        p1: {
            x: 0,
            y: 0
        },
        p2: {
            x: 1,
            y: 0
        }
    };

    var getAngleBySegmentsPoints = function (s1_x1, s1_y1, s1_x2, s1_y2, s2_x1, s2_y1, s2_x2, s2_y2) {
        return Math.atan2((s1_y2 - s1_y1), (s1_x2 - s1_x1)) - Math.atan2((s2_y2 - s2_y1), (s2_x2 - s2_x1));
    };

    var getAngleBySegmentsPointsM = function (s1_p1, s1_p2, s2_p1, s2_p2) {
        return getAngleBySegmentsPoints(s1_p1.x, s1_p1.y, s1_p2.x, s1_p2.y, s2_p1.x, s2_p1.y, s2_p2.x, s2_p2.y);
    };

    var getPointOnPerpendicular = function (x1, y1, x2, y2, xt, yt, value) {
        if (!value) {
            return [xt, yt, xt, yt];
        }
        var diff_x = x1 - x2;
        var diff_y = y1 - y2;
        var dist = Math.sqrt(diff_x * diff_x + diff_y * diff_y);
        diff_x = diff_x / dist;
        diff_y = diff_y / dist;

        return [
            xt + (value / 2) * diff_y,
            yt - (value / 2) * diff_x
        ];
    };
    var getPointOnPerpendicularM = function (p1, p2, pt, distance) {
        return getPointOnPerpendicular(p1.x, p1.y, p2.x, p2.y, pt.x, pt.y, distance);
    };
    var getPointsDistance = function (x1, y1, x2, y2) {
        return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    };
    var getPointsDistanceM = function (p1, p2) {
        return getPointsDistance(p1.x, p1.y, p2.x, p2.y);
    };

    var getPointOnLine = function (p1, angle, distance) {
        var a = Math.cos(angle) * distance;
        var b = Math.sin(angle) * distance;

        var x = p1.x + a;
        var y = p1.y + b;
        return {
            x: x,
            y: y
        };

    };

    var getDistance = function (startTime, startDistance, endTime, endDistance, timestamp) {
        return ((timestamp - startTime) * (endDistance - startDistance)) / (endTime - startTime) + startDistance;
    };

    var getDistanceByTime = function (el, miliseconds) {
        var start, end;
        var done = false;
        for (var i = 0; i < el.result_steps.length; i++) {
            var cur = el.result_steps[i];
            var next = el.result_steps[i + 1];
            if (!cur || !next) {
                break;
            }
            if (cur.time <= miliseconds && miliseconds <= next.time) {
                done = true;

                start = cur;
                end = next;

                break;
            }
        }
        if (!done) {
            start = el.result_steps[0];
            end = el.result_steps[el.result_steps.length - 1];
        }

        return getDistance(
            start.time, start.distance,
            end.time, end.distance,
            miliseconds
        );
    };


    var getDistances = function (runners, miliseconds, full) {
        var result = [];
        runners.forEach(function (runner) {
            var time = getDistanceByTime(runner, miliseconds);

            if (typeof time == 'number' && !isNaN(time)) {
                result.push(full ? {
                    time: time,
                    item: runner
                } : time);
            }
        });
        return result;
    };

    var getFullRunners = function (array, d_ge, d_l) {
        var result = [];

        for (var i = 0; i < array.length; i++) {
            var cur = array[i];
            if (cur.time >= d_ge && cur.time < d_l) {
                result.push(cur.item);
            }
        }
        return result;
    };

    var getRunners = function (array, d_ge, d_l, full) {
        if (full) {
            return getFullRunners(array, d_ge, d_l);
        }
        return array.filter(function (item) {
            return item >= d_ge && item < d_l
        }).length;

    };

    var format = function (p) {
        return p.x + ',' + p.y;
    };

    var formatCurve = function (prev_pcurv2, pcurv1, endp) {
        return format(prev_pcurv2) + ' ' + format(pcurv1) + ' ' + format(endp);
    };

    var getAreaPathData = function (area, base_districts) {
        var bstr = "M";
        var part1 = [], part2 = [];
        var cur;
        var i, prevp;

        var zero_base_district = base_districts[0];

        bstr += format(zero_base_district.pm);
        for (i = 1; i < area.length; i++) {

            prevp = (i - 1 == 0) ? zero_base_district.pcurv2 : area[i - 1].pcurv2;
            cur = area[i];
            part1.push(formatCurve(prevp, cur.pcurv1, cur.pm));
        }
        bstr += ' C' + part1.join(' ');
        bstr += ' L' + format(base_districts[base_districts.length - 1].pm);


        for (i = (base_districts.length - 1) - 1; i >= 0; i--) {
            prevp = base_districts[i + 1].pcurv1;
            cur = base_districts[i];
            part2.push(formatCurve(prevp, cur.pcurv2, cur.pm));

        }

        bstr += ' C' + part2.join(' ') + 'Z';
        return bstr;

    };

    var hclc = {
        height_scale: 0.8,
        man_place_square: Math.pow(3, 2)
    };

    var getHeightByRunners = function (runners_count, step) {
        return (hclc.height_scale * hclc.man_place_square * runners_count) / step;
    };

    var getStepValueByHeight = function (height, step) {
        return (height * step) / (hclc.height_scale * hclc.man_place_square);
    };

    var getStepsRunners = function (runners_array, base_districts, seconds, full) {
        var distances = getDistances(runners_array, seconds, full);
        return base_districts.map(function (district) {
            return getRunners(distances, district.start, district.end, full);
        })
    };

    var getAreaByData = function (runners_array, base_districts, prev_districts, seconds, step) {
        var steps_runners = getStepsRunners(runners_array, base_districts, seconds);

        return (base_districts.map(function (district, i) {
            var prev_di = prev_districts[i];
            var obj = {};
            var runners = steps_runners[i];

            obj.height = getHeightByRunners(runners, step);
            obj.runners = runners;

            var spcurv1 = getPointOnPerpendicularM(prev_di.pcurv1, prev_di.pcurv2, prev_di.pcurv1, obj.height);
            var spcurv2 = getPointOnPerpendicularM(prev_di.pcurv1, prev_di.pcurv2, prev_di.pcurv2, obj.height);

            obj.pcurv1 = {
                x: spcurv1[0],
                y: spcurv1[1]
            };
            obj.pcurv2 = {
                x: spcurv2[0],
                y: spcurv2[1]
            };
            var perppoints = getPointOnPerpendicularM(prev_di.pcurv1, prev_di.pcurv2, prev_di.pm, obj.height);
            obj.pm = {
                x: perppoints[0],
                y: perppoints[1]
            };

            return obj;
        }));
    };

    var getSteps = function (step, px_distance) {
        var pieces = d3.range(0, px_distance, step);
        pieces.push(px_distance);

        var steps = [{p:0,l:0}].concat(pieces.map(function (piece) {
            return {
                p: piece,
                l: piece
            };
        }));
        steps.push({
            p: px_distance,
            l: 0
        });
        return steps;
    };

    var getStepHeight = function (track, distance, timestamp, runners_array, total_distance, step_distance) {
        var d3path_node = track.node(),
            px_distance = d3path_node.getTotalLength(),
            px_in_m = px_distance / total_distance;

        var step = step_distance * px_in_m;

        var step_start = distance;
        var step_end = distance + step / px_in_m;


        var distances = getDistances(runners_array, timestamp);
        var runners = getRunners(distances, step_start, step_end);
        var height = getHeightByRunners(runners, step);
        return {
            step: step,
            height: height,
            runners: runners,
            step_m: step_distance || step / px_in_m,
            distance: distance
        };
    };

    var base_points_cache = {};
    var getBasePoints = function (base, total_distance, step_in_m) {
        var points_key = base.projection_key;
        if (base_points_cache[points_key]) {
            return base_points_cache[points_key];
        }

        var d3path_node = base.node(),
            px_distance = d3path_node.getTotalLength(),
            i;
        var complects = [],
            px_per_m = px_distance / total_distance;

        var step = step_in_m * px_per_m;
        var steps = getSteps(step, px_distance);
        steps.forEach(function (step) {
            step.p = d3path_node.getPointAtLength(step.p);
        });

        for (i = 1; i < steps.length; i++) {
            var c1 = steps[i - 1],
                c2 = steps[i],
                p1 = c1.p,
                p2 = c2.p;

            var obj = {
                p1: p1,
                p2: p2,
                start: c1.l / px_per_m,
                end: c2.l / px_per_m,
                pm: {
                    x: (p1.x + p2.x) / 2,
                    y: (p1.y + p2.y) / 2
                },
                dist: getPointsDistanceM(p1, p2),
                angle: getAngleBySegmentsPointsM(p1, p2, x_axis_points.p1, x_axis_points.p2)
            };

            obj.pcurv1 = getPointOnLine(p1, obj.angle, obj.dist * (1 / 4));
            obj.pcurv2 = getPointOnLine(p1, obj.angle, obj.dist * (3 / 4));

            complects.push(obj);
        }

        base_points_cache[points_key] = {
            complects: complects,
            points: steps,
            step: step
        };
        return base_points_cache[points_key];
    };

    var getRunnerPosition = function (runner, path_node, time, trackLength, prevPosition) {
        var px_total_length = path_node.getTotalLength();
        var current_distance = getDistanceByTime(runner, time * 1);
        current_distance = Math.max(0, current_distance);
        var px_current_length = current_distance * px_total_length / trackLength;
        var cur_coord = path_node.getPointAtLength(px_current_length);
        var i = 0;
        if (prevPosition) {
            while (getPointsDistanceM(cur_coord, prevPosition) <= 8) {
                px_current_length -= 1;
                cur_coord = path_node.getPointAtLength(px_current_length);
                i++;
                if (i == 100) debugger
            }
        }
        var movedPosition = getPointOnPerpendicularM(
            path_node.getPointAtLength(px_current_length - 5),
            path_node.getPointAtLength(px_current_length + 5),
            cur_coord, 5);
        return {
            x: movedPosition[0],
            y: movedPosition[1]
        };
    };

    var drawRunnersPoints = function (grads, data, runners, timestamp, track, trackLength) {
        var point_radius = 2;
        var prevPosition;

        var prepareRunner = function (runner) {
            var current_distance = getDistanceByTime(runner, timestamp * 1);
            current_distance = Math.max(0, current_distance);
            return {
                runner: runner,
                distance: current_distance
            }
        };

        var getSQPoints = function (runner) {
            var d = runner.distance;
            runner = runner.runner;
            var el = runner.big_genderage_group_full;
            var position = getRunnerPosition(runner, track, timestamp, trackLength, prevPosition);
            prevPosition = position;
            return {
                distance: d,
                cx: position.x,
                cy: position.y,
                r: point_radius,
                fill: grads[el.gender](el.num)
            }
        };

        var limit = 5;

        var steps_runners = getStepsRunners(runners, data.complects, timestamp, true);

        var singleRunnersGroups = steps_runners.filter(function (step) {
            return step.length <= limit;
        });
        return _.flatten(singleRunnersGroups)
            .map(prepareRunner)
            .sort(function (a, b) {
                return b.distance - a.distance;
            })
            .map(getSQPoints)

    };


    var getPoints = function (runners_groups, track, age_areas, seconds, total_distance, step) {
        var data = getBasePoints(track, total_distance, step);

        var complects = data.complects;

        var areas_data = {};
        var areas = {};

        var prev;
        runners_groups.forEach(function (el, i) {
            var prev_districts = (i == 0) ? complects : prev;
            areas_data[el.key] = getAreaByData(el.runners, complects, prev_districts, seconds, data.step);
            prev = areas_data[el.key];
        });
        runners_groups.forEach(function (el) {
            areas[el.key] = getAreaPathData(areas_data[el.key], complects);
        });
        runners_groups.forEach(function (el) {
            age_areas[el.key].d = areas[el.key];
        });
        return data;

    };

    return {
        earth_radius: 6371000,
        getPoints: getPoints,
        format: format,
        getStepValueByHeight: getStepValueByHeight,
        getStepHeight: getStepHeight,
        formatPathPoints: function (array) {
            if (!array.length) return;
            var result = 'M' + format(array[0]);
            array.forEach(function (item, i) {
                if (!i) return;
                result += ' L' + format(item);
            });
            return result;
        },
        getDistance: getDistance,
        drawRunnersPoints: drawRunnersPoints,
        getDistanceByRangesAndTime: getDistanceByTime
    };
});
