angular.module('marathon').factory('mapHelper', function (track, genderColors, last) {
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

    function getDistance(startTime, startDistance, endTime, endDistance, timestamp) {
        return ((timestamp - startTime) * (endDistance - startDistance)) / (endTime - startTime) + startDistance;
    }

    function getCurrentSection(sections, milliseconds) {
        var section;
        var i = 0;

        var length = sections.length;
        var step = sections[0];

        while ((section === undefined) && i < length) {
            var nextStep = sections[i + 1];
            if (step && nextStep && step.time <= milliseconds && milliseconds <= nextStep.time) {
                section = i;
            }
            step = nextStep;
            i++;
        }
        return section;
    }

    function getDistanceByTime(runner, milliseconds) {
        if (!runner.all_result_steps) {
            runner.all_result_steps = runner.result_steps.slice();
            runner.all_result_steps.push({
                distance: Math.round(track.getTrackLength()),
                time: runner.end_time
            });
        }
        var sections = runner.all_result_steps;
        var section = getCurrentSection(sections, milliseconds);
        var start, end;
        if (section === undefined) {
            start = sections[0];
            end = last(sections);
        } else {
            start = sections[section];
            end = sections[section + 1];
        }
        return getDistance(
            start.time, start.distance,
            end.time, end.distance,
            milliseconds
        );
    }

    function getDistances(runners, miliseconds) {
        return runners.map(function (runner) {
            var currentDistance = getDistanceByTime(runner, miliseconds);
            return {
                distance: currentDistance,
                item: runner
            };
        });
    }


    var getRunners = function (array, d_ge, d_l) {
        var result = [];

        for (var i = 0; i < array.length; i++) {
            var cur = array[i];
            if (cur.distance >= d_ge && cur.distance < d_l) {
                result.push(cur.item);
            }
        }
        return result;
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
        bstr += ' L' + format(last(base_districts).pm);


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

    var getStepsRunners = function (runners_array, base_districts, seconds) {
        var distances = getDistances(runners_array, seconds);
        return base_districts.map(function (district) {
            return getRunners(distances, district.start, district.end);
        })
    };

    var getAreaByData = function (runners_array, base_districts, prev_districts, seconds, step) {
        var steps_runners = getStepsRunners(runners_array, base_districts, seconds).map(function (step) {
            return step.length
        });

        return (prev_districts.map(function (prev_di, i) {
            var obj = {};
            var runnersCount = steps_runners[i];

            obj.height = getHeightByRunners(runnersCount, step);
            obj.runners = runnersCount;

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

    var customPieces = {
        '21': 6270,
        '10': 5050
    };

    var getSteps = function (step, px_distance) {
        var pieces = d3.range(0, px_distance, step);
        pieces.push(px_distance);
        var trackLength = track.getTrackLength();
        var customPiece = customPieces[Math.round(trackLength / 1000)] / trackLength * track.getTotalLength();
        pieces.push(customPiece, customPiece);
        pieces.sort(function (a, b) {
            return a - b
        });
        var steps = [{p: 0, l: 0}].concat(pieces.map(function (piece) {
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
    var getRunnersToArray = function (array, d_ge, d_l) {
        return array.filter(function (item) {
            return item.distance >= d_ge && item.distance < d_l
        });
    };

    function getStep(current_distance, timestamp, runners_array, step_distance) {
        var total_distance = track.getTrackLength(),
            px_distance = track.getTotalLength(),
            px_in_m = px_distance / total_distance;

        var step = step_distance * px_in_m;

        var step_start = current_distance;
        var step_end = current_distance + step / px_in_m;

        var distances = getDistances(runners_array, timestamp, true);
        var runners = getRunnersToArray(distances, step_start, step_end);
        var height = getHeightByRunners(runners.length, step);
        return {
            step: step,
            height: height,
            runners: {
                male: runners.filter(function (runner) {
                    return runner.item.gender == 1
                }).length,
                female: runners.filter(function (runner) {
                    return runner.item.gender == 0
                }).length
            },
            step_m: step_distance || step / px_in_m,
            distance: current_distance
        };
    }

    function getMaxHeightSection(time, runners, step_for_dots) {
        var dots_on_distance = d3.range(0, track.getTrackLength(), step_for_dots);

        var maxHeightSection = {height: -Infinity};

        time *= 1;

        dots_on_distance.forEach(function (dot) {
            var section = getStep(
                dot,
                time,
                runners,
                step_for_dots);
            if (section.height > maxHeightSection.height)
                maxHeightSection = section;
        });
        return maxHeightSection;
    }

    var base_points_cache = {};
    var getBasePoints = function (step_in_m) {
        var points_key = null; //base.projection_key; TODO: вернуть кэширование
        if (base_points_cache[points_key]) {
            return base_points_cache[points_key];
        }

        var total_distance = track.getTrackLength(),
            px_distance = track.getTotalLength(),
            i;
        var complects = [],
            px_per_m = px_distance / total_distance;

        var step = step_in_m * px_per_m;
        var steps = getSteps(step, px_distance);
        steps.forEach(function (step) {
            step.p = track.getPointAtLength(step.p);
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

        var result = {
            complects: complects,
            step: step
        };
        return result;
        base_points_cache[points_key] = result;
        return base_points_cache[points_key];
    };

    var getRunnerPosition = function (runner, time, prevPosition) {
        var px_total_length = track.getTotalLength();
        var trackLength = track.getTrackLength();
        var current_distance = getDistanceByTime(runner, time * 1);
        current_distance = Math.max(0, current_distance);
        var px_current_length = current_distance * px_total_length / trackLength;
        var cur_coord = track.getPointAtLength(px_current_length);
        var i = 0;
        if (prevPosition) {
            while (getPointsDistanceM(cur_coord, prevPosition) <= 8) {
                px_current_length -= 1;
                cur_coord = track.getPointAtLength(px_current_length);
                i++;
            }
        }
        var movedPosition = getPointOnPerpendicularM(
            track.getPointAtLength(px_current_length - 5),
            track.getPointAtLength(px_current_length + 5),
            cur_coord, 5);
        return {
            x: movedPosition[0],
            y: movedPosition[1]
        };
    };

    var drawRunnersPoints = function (runners, timestamp, step) {
        var point_radius = 2;
        var prevPosition;

        var complects = getBasePoints(step).complects;
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
            var position = getRunnerPosition(runner, timestamp, prevPosition);
            prevPosition = position;
            return {
                distance: d,
                cx: position.x,
                cy: position.y,
                r: point_radius,
                fill: genderColors.genderGradients[runner.gender](genderColors.colorNumberScale(runner.age)),
                number: runner.num
            }
        };

        var limit = 5;

        var steps_runners = getStepsRunners(runners, complects, timestamp, true);

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


    var getPoints = function (runners_groups, age_areas, seconds, step) {
        var data = getBasePoints(step);
        var complects = data.complects;

        var prev;

        runners_groups.forEach(function (el) {
            var prev_districts = (prev) ? prev : complects;
            var areas_data = getAreaByData(el.runners, complects, prev_districts, seconds, data.step);
            prev = areas_data;
            age_areas[el.key].d = getAreaPathData(areas_data, complects);
        });

        return complects;
    };
    var mapScale = 1;

    function setMapScale(scale) {
        mapScale = scale;
    }

    function getMapScale() {
        return mapScale;
    }

    return {
        getPoints: getPoints,
        format: format,
        getStepValueByHeight: getStepValueByHeight,
        getMaxHeightSection: getMaxHeightSection,
        getHeightByRunners: getHeightByRunners,
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
        getDistanceByRangesAndTime: getDistanceByTime,
        setMapScale: setMapScale,
        getMapScale: getMapScale
    };
});
