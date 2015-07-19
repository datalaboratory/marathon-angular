angular.module('marathon').directive('mapContainer', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/mapContainer.html',
        replace: true,
        link: function link($scope, $element) {
            var d3element = d3.select($element.find('.snakeGroup')[0]);
            var trackGroup = d3element.append('g');
            var snakeGroup = d3element.append('g');
            var width = $element.width();
            var height = $element.height();
            var trackPath = trackGroup.append('path')
                .attr('stroke', '#000')
                .attr('fill', 'none');

            $scope.$watch('selectedTrack', function (track) {
                track.then(function (data) {
                    var projection = d3.geo.mercator().scale(1).translate([0, 0]);
                    var path = d3.geo.path().projection(projection);
                    var geodata = data.data;
                    $scope.trackLength = d3.geo.length(geodata) * earth_radius;
                    var startTime = $scope.time.start;
                    var b = path.bounds(geodata);
                    // в s задаётся общий масштаб пары трек-карта
                    // в t задайтся общий сдвиг пары трек-карта
                   // var s = 0.7 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
                    //var t = [(width - s * (b[1][0] + b[0][0])) / 2 - 70, (height - s * (b[1][1] + b[0][1])) / 2 + 40];

                    var s = 0.6 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
                    var t = [(width - s * (b[1][0] + b[0][0])) / 2 - 130, (height - s * (b[1][1] + b[0][1])) / 2 + 80];

                    projection.scale(s).translate(t);
                    trackPath
                        .datum(geodata)
                        .attr('d', path);
                    trackPath.projection_key = Date.now();
                    $scope.trackPath = trackPath;

                    var ageAreas = {};
                    var runners = checkData($scope.filteredRunners);

                    var runnerGroups = runners.runners_groups.slice().reverse();
                    runnerGroups.forEach(function (el) {
                        var color = $scope.genderGradients[el.gender](el.num);
                        ageAreas[el.key] = (snakeGroup.append('path').style({
                            stroke: 'none',
                            "fill": color
                        }));
                    });
                    function drawSnake(time) {
                        if (!time) return;
                        time = (time - $scope.time.start) / 1000;
                        var runners = checkData($scope.filteredRunners);
                        var d = mh.getPoints(runners.runners_groups, trackPath, ageAreas, time, startTime, $scope.trackLength, 500);
                        mh.drawRunnersPoints(colors, $scope.genderGradients, d, $scope.filteredRunners, snakeGroup, time, startTime);
                    }

                    $scope.$watch('filterValues', function () {
                        drawSnake($scope.time.current);
                    }, true);
                    $scope.$watch('time.current', function (time) {
                        drawSnake(time);
                    });

                })
            });

        }
    }
});