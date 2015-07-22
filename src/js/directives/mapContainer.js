angular.module('marathon').directive('mapContainer', function (mapHelper) {
    return {
        restrict: 'E',
        templateUrl: 'directives/mapContainer.html',
        replace: true,
        link: function link($scope, $element) {
            var snakeGroupContainer = d3.select($element.find('.snakeGroup')[0]);
            var trackGroup = snakeGroupContainer.append('g').attr('opacity', 0);
            var snakeGroup = snakeGroupContainer.append('g');
            var width = $element.width();
            var height = $element.height();
            var trackPath = trackGroup.append('path');

            $scope.mapParams = {
                10: {
                    width: '78%',
                    height: '89%',
                    x: -36,
                    y: 85
                },
                21: {
                    width: '100%',
                    height: '85%',
                    x: -205,
                    y: 110
                }
            };
            $scope.selectedRunnerOnMap = {
                runner: null,
                position: null
            };
            $scope.$watch('selectedTrack', function (track) {
                track.then(function (data) {
                    var projection = d3.geo.mercator().scale(1).translate([0, 0]);
                    var path = d3.geo.path().projection(projection);
                    var geodata = data.data;
                    $scope.trackLength = d3.geo.length(geodata) * mapHelper.earth_radius;

                    var START = 0;
                    var END = 1;
                    var X = 0;
                    var Y = 1;
                    var b = path.bounds(geodata);

                    // в s задаётся общий масштаб пары трек-карта
                    // в t задайтся общий сдвиг пары трек-карта
                    //var s = 0.7 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
                    //var t = [(width - s * (b[1][0] + b[0][0])) / 2 - 70, (height - s * (b[1][1] + b[0][1])) / 2 + 40];

                    var magicNumbers = {
                        scale: 0.6,
                        x: -130,
                        y: 80
                    };
                    var s = magicNumbers.scale / Math.max((b[END][X] - b[START][X]) / width, (b[END][Y] - b[START][Y]) / height);
                    var t = [
                        (width  - s * (b[END][X] + b[START][X])) / 2 + magicNumbers.x,
                        (height - s * (b[END][Y] + b[START][Y])) / 2 + magicNumbers.y
                    ];

                    projection.scale(s).translate(t);
                    trackPath
                        .datum(geodata)
                        .attr('d', path);
                    trackPath.projection_key = Date.now();
                    $scope.trackPath = trackPath;
                    $scope.pathData = path(geodata);

                    $scope.ageAreas = {};
                    var runners = checkData($scope.filteredRunners);

                    var runnerGroups = runners.runners_groups.slice().reverse();
                    runnerGroups.forEach(function (el) {
                        $scope.ageAreas[el.key] = {color: $scope.genderGradients[el.gender](el.num)}
                    });

                    function drawSnake(time) {
                        if (!time) return;
                        time *= 1;
                        var runners = checkData($scope.filteredRunners);
                        var d = mapHelper.getPoints(
                            runners.runners_groups,
                            trackPath,
                            $scope.ageAreas,
                            time,
                            $scope.trackLength,
                            500);
                        $scope.circles = mapHelper.drawRunnersPoints(
                            $scope.genderGradients,
                            d,
                            $scope.filteredRunners,
                            time,
                            trackPath.node(),
                            $scope.trackLength);
                    }

                    $scope.$watch('filterValues', function () {
                        drawSnake($scope.time.current);
                    }, true);
                    $scope.$watch('time.current', drawSnake);

                })
            });

        }
    }
});